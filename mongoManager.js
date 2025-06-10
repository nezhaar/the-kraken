// mongoManager.js - Version corrigée et optimisée
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { DEFAULT_GUILD_SETTINGS, mergeGuildSettings } from './config.js';
import GuildSettings from './models/GuildSettings.js';

class MongoManager {
  constructor() {
    this.isConnected = false;
    this.connectionLocks = new Map();
  }

  async connect() {
    try {
      const mongoUri = process.env.MONGODB_URI;
      
      if (!mongoUri) {
        throw new Error('MONGODB_URI n\'est pas défini dans les variables d\'environnement');
      }

      console.log('📊 Connexion à MongoDB Atlas...');
      
      // Configuration de connexion optimisée pour production
      await mongoose.connect(mongoUri, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        bufferCommands: false,
        retryWrites: true,
        retryReads: true,
        family: 4
      });

      this.isConnected = true;
      console.log('✅ Connexion MongoDB Atlas établie avec succès');
      
      // Gestion des événements de connexion
      mongoose.connection.on('error', (error) => {
        console.error('❌ Erreur MongoDB:', error.message);
        this.isConnected = false;
      });

      mongoose.connection.on('disconnected', () => {
        console.warn('⚠️ MongoDB déconnecté');
        this.isConnected = false;
      });

      mongoose.connection.on('reconnected', () => {
        console.log('🔄 MongoDB reconnecté avec succès');
        this.isConnected = true;
      });

      // Test de connexion
      await this.testConnection();

    } catch (error) {
      console.error('❌ Erreur de connexion MongoDB:', error.message);
      throw error;
    }
  }

  async testConnection() {
    try {
      await mongoose.connection.db.admin().ping();
      console.log('🏓 Test de ping MongoDB réussi');
    } catch (error) {
      console.error('❌ Test de ping MongoDB échoué:', error.message);
      throw new Error('Connexion MongoDB non fonctionnelle');
    }
  }

  async getGuildSettings(guildId) {
    try {
      if (!this.isConnected) {
        console.warn('[mongoManager] ⚠️ MongoDB non connecté, tentative de reconnexion...');
        await this.connect();
      }

      console.log(`[mongoManager] 📖 Récupération des settings pour ${guildId}`);
      
      let settings = await GuildSettings.findOne({ guildId }).lean();
      
      if (!settings) {
        console.log(`[mongoManager] 🆕 Création des settings par défaut pour ${guildId}`);
        const defaultSettings = this.normalizeGuildSettings({ guildId });
        const preparedData = this.prepareDataForMongoDB(defaultSettings);
        
        const newSettings = new GuildSettings(preparedData);
        settings = await newSettings.save();
        console.log(`[mongoManager] ✅ Settings par défaut créés pour ${guildId}`);
      }

      const converted = this.convertFromMongoDB(settings);
      const normalized = this.normalizeGuildSettings(converted);
      
      console.log(`[mongoManager] ✅ Settings récupérés pour ${guildId}`);
      return normalized;
      
    } catch (err) {
      console.error(`[mongoManager] ❌ Erreur récupération settings ${guildId}:`, err.message);
      console.error('[mongoManager] Stack trace:', err.stack);
      return this.normalizeGuildSettings({ guildId });
    }
  }

  async saveGuildSettings(guildId, newSettingsFromIndexJs) {
    const lockKey = `guildSettings_${guildId}`;
    
    console.log(`[mongoManager] 💾 Début sauvegarde pour ${guildId}`);
    
    // Gestion des locks
    while (this.connectionLocks.has(lockKey)) {
      console.log(`[mongoManager] ⏳ Attente libération du lock pour ${guildId}`);
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    try {
      this.connectionLocks.set(lockKey, true);
      console.log(`[mongoManager] 🔒 Lock acquis pour ${guildId}`);
      
      if (!this.isConnected) {
        console.warn('[mongoManager] ⚠️ MongoDB non connecté, tentative de reconnexion...');
        await this.connect();
      }
      
      // Chargement des paramètres actuels
      const currentSettingsRaw = await GuildSettings.findOne({ guildId }).lean();
      const currentSettingsFromFile = currentSettingsRaw ? 
        this.convertFromMongoDB(currentSettingsRaw) : { guildId };
      
      // Fusion des paramètres
      let mergedForNormalization = mergeGuildSettings(currentSettingsFromFile, newSettingsFromIndexJs);
      let settingsToSave = this.normalizeGuildSettings(mergedForNormalization);

      // Validation
      const validationErrors = this.validateGuildSettings(settingsToSave);
      if (validationErrors.length > 0) {
        console.error(`[mongoManager] ❌ Erreurs de validation pour ${guildId}:`, validationErrors);
        throw new Error(`Erreurs de validation: ${validationErrors.join('; ')}`);
      }

      // Préparation pour MongoDB
      const preparedData = this.prepareDataForMongoDB(settingsToSave);

      // Sauvegarde avec upsert
      const result = await GuildSettings.findOneAndUpdate(
        { guildId },
        { ...preparedData, guildId, updatedAt: new Date() },
        { 
          upsert: true, 
          new: true, 
          runValidators: true,
          setDefaultsOnInsert: true
        }
      ).lean();
      
      console.log(`[mongoManager] ✅ Sauvegarde MongoDB réussie pour ${guildId}`);
      
      return settingsToSave;
      
    } catch (err) {
      console.error(`[mongoManager] ❌ Erreur sauvegarde pour ${guildId}:`, err.message);
      console.error(`[mongoManager] Stack trace:`, err.stack);
      throw err; 
    } finally {
      this.connectionLocks.delete(lockKey);
      console.log(`[mongoManager] 🔓 Lock libéré pour ${guildId}`);
    }
  }

  async disconnect() {
    try {
      if (this.isConnected) {
        await mongoose.connection.close();
        this.isConnected = false;
        console.log('🔌 Connexion MongoDB fermée');
      }
    } catch (error) {
      console.error('❌ Erreur lors de la fermeture MongoDB:', error.message);
    }
  }

  validateGuildSettings(settings) {
    const errors = [];
    
    try {
      // Validation du guildId (requis)
      if (!settings.guildId || typeof settings.guildId !== 'string' || !/^\d{17,20}$/.test(settings.guildId)) {
        errors.push("guildId manquant ou invalide");
      }

      // Validation du préfixe
      if (settings.prefix && (typeof settings.prefix !== 'string' || settings.prefix.length > 5)) {
        errors.push("Le préfixe doit être une chaîne de caractères de 5 caractères maximum.");
      }
      
      // Validation des systèmes de traduction
      if (settings.translationSystems && Array.isArray(settings.translationSystems)) {
        settings.translationSystems.forEach((system, index) => {
          if (!system.id || typeof system.id !== 'string') {
            errors.push(`Système de traduction à l'index ${index} manque un ID valide.`);
          }
          if (typeof system.name !== 'string') {
            errors.push(`Système de traduction '${system.id}' manque un nom valide.`);
          }
          if (!system.channels || typeof system.channels !== 'object') {
            errors.push(`Système de traduction '${system.id}' manque un objet 'channels' valide.`);
          }
        });
      }

      // Validation des systèmes d'attribution de rôles
      if (settings.roleAssignmentSystems && Array.isArray(settings.roleAssignmentSystems)) {
        settings.roleAssignmentSystems.forEach((system, index) => {
          if (!system.id || typeof system.id !== 'string') {
            errors.push(`Système de rôles à l'index ${index} manque un ID valide.`);
          }
          if (typeof system.name !== 'string') {
            errors.push(`Système de rôles '${system.id}' manque un nom valide.`);
          }
          if (!['member_join', 'reaction_add', 'button_click', 'command_use'].includes(system.condition)) {
            errors.push(`Système de rôles '${system.id}' a une condition invalide: ${system.condition}`);
          }
          if (!system.targetRole || !/^\d{17,20}$/.test(system.targetRole)) {
            errors.push(`Système de rôles '${system.id}' a un rôle cible invalide: ${system.targetRole}`);
          }
        });
      }
      
      // Validation des IDs de salons
      const channelFields = ['welcomeChannel', 'ticketCategoryID', 'ticketLogChannelID', 'logChannelID'];
      channelFields.forEach(field => {
        if (settings[field] && !/^\d{17,20}$/.test(settings[field])) {
          errors.push(`${field} doit être un ID Discord valide.`);
        }
      });
      
      // Validation des rôles
      if (settings.setlanguesRequiredRoles && Array.isArray(settings.setlanguesRequiredRoles)) {
        settings.setlanguesRequiredRoles.forEach(roleId => {
          if (!/^\d{17,20}$/.test(roleId)) {
            errors.push(`ID de rôle invalide dans setlanguesRequiredRoles: ${roleId}`);
          }
        });
      }
      
      if (settings.ticketSupportRoles && Array.isArray(settings.ticketSupportRoles)) {
        settings.ticketSupportRoles.forEach(roleId => {
          if (!/^\d{17,20}$/.test(roleId)) {
            errors.push(`ID de rôle invalide dans ticketSupportRoles: ${roleId}`);
          }
        });
      }
      
    } catch (validationError) {
      console.error('[mongoManager] Erreur lors de la validation:', validationError.message);
      errors.push(`Erreur de validation: ${validationError.message}`);
    }
    
    return errors;
  }

  normalizeGuildSettings(settings) {
    const validSettings = (settings && typeof settings === 'object') ? settings : {};
    
    // S'assurer que guildId est présent
    if (!validSettings.guildId) {
      console.warn('[mongoManager] ⚠️ guildId manquant lors de la normalisation');
      validSettings.guildId = validSettings.guildId || 'unknown';
    }

    const mergedWithDefaults = { ...DEFAULT_GUILD_SETTINGS, ...validSettings };
    
    // Fusion spécifique pour les objets imbriqués
    if (validSettings.langueRoles && typeof validSettings.langueRoles === 'object') {
       mergedWithDefaults.langueRoles = {...DEFAULT_GUILD_SETTINGS.langueRoles, ...validSettings.langueRoles};
    }
    
    // Normalisation pour translationSystems
    const normalizedTranslationSystems = [];
    if (Array.isArray(mergedWithDefaults.translationSystems)) {
      mergedWithDefaults.translationSystems.forEach(system => {
        if (system && typeof system === 'object' && system.channels && typeof system.channels === 'object') {
          const normalizedSystemChannels = {};
          for (const langCode in system.channels) {
            if (Object.prototype.hasOwnProperty.call(system.channels, langCode)) {
              const channelId = system.channels[langCode];
              if (typeof channelId === 'string' && channelId.trim() !== '') {
                normalizedSystemChannels[langCode] = channelId.trim();
              }
            }
          }
          normalizedTranslationSystems.push({
            id: system.id || uuidv4(),
            name: typeof system.name === 'string' ? system.name.trim() : `Système de traduction ${normalizedTranslationSystems.length + 1}`,
            channels: normalizedSystemChannels
          });
        }
      });
    }

    // Normalisation pour roleAssignmentSystems
    const normalizedRoleAssignmentSystems = [];
    if (Array.isArray(mergedWithDefaults.roleAssignmentSystems)) {
      mergedWithDefaults.roleAssignmentSystems.forEach(system => {
        if (system && typeof system === 'object' && system.targetRole) {
          normalizedRoleAssignmentSystems.push({
            id: system.id || uuidv4(),
            name: typeof system.name === 'string' ? system.name.trim() : `Système de rôles ${normalizedRoleAssignmentSystems.length + 1}`,
            condition: ['member_join', 'reaction_add', 'button_click', 'command_use'].includes(system.condition) ? system.condition : 'member_join',
            targetRole: typeof system.targetRole === 'string' ? system.targetRole.trim() : '',
            triggerData: (system.triggerData && typeof system.triggerData === 'object') ? { ...system.triggerData } : {},
            enabled: system.enabled !== false,
            description: typeof system.description === 'string' ? system.description.trim() : ''
          });
        }
      });
    }

    // Fonctions utilitaires
    const cleanLanguageRoleId = (value) => (typeof value === 'string' && value.trim() !== '' ? value.trim() : '');
    const cleanRoleIdArray = (arr) => (Array.isArray(arr) ? arr.filter(id => typeof id === 'string' && /^\d{17,20}$/.test(id)) : []);
    const cleanNullableString = (value) => (typeof value === 'string' && value.trim() !== '' ? value.trim() : null);

    const normalizedSettings = {
      guildId: validSettings.guildId,
      prefix: typeof mergedWithDefaults.prefix === 'string' ? mergedWithDefaults.prefix.trim() || DEFAULT_GUILD_SETTINGS.prefix : DEFAULT_GUILD_SETTINGS.prefix,
      welcomeEnabled: typeof mergedWithDefaults.welcomeEnabled === 'boolean' ? mergedWithDefaults.welcomeEnabled : DEFAULT_GUILD_SETTINGS.welcomeEnabled,
      welcomeMessage: typeof mergedWithDefaults.welcomeMessage === 'string' ? mergedWithDefaults.welcomeMessage.trim() : DEFAULT_GUILD_SETTINGS.welcomeMessage,
      goodbyeEnabled: typeof mergedWithDefaults.goodbyeEnabled === 'boolean' ? mergedWithDefaults.goodbyeEnabled : DEFAULT_GUILD_SETTINGS.goodbyeEnabled,
      goodbyeMessage: typeof mergedWithDefaults.goodbyeMessage === 'string' ? mergedWithDefaults.goodbyeMessage.trim() : DEFAULT_GUILD_SETTINGS.goodbyeMessage,
      welcomeChannel: cleanNullableString(mergedWithDefaults.welcomeChannel),
      langueRoles: {
        fr: cleanLanguageRoleId(mergedWithDefaults.langueRoles?.fr),
        en: cleanLanguageRoleId(mergedWithDefaults.langueRoles?.en),
        es: cleanLanguageRoleId(mergedWithDefaults.langueRoles?.es),
        de: cleanLanguageRoleId(mergedWithDefaults.langueRoles?.de),
        pt: cleanLanguageRoleId(mergedWithDefaults.langueRoles?.pt),
        ru: cleanLanguageRoleId(mergedWithDefaults.langueRoles?.ru),
        hu: cleanLanguageRoleId(mergedWithDefaults.langueRoles?.hu),
        it: cleanLanguageRoleId(mergedWithDefaults.langueRoles?.it)
      },
      setlanguesRequiredRoles: cleanRoleIdArray(mergedWithDefaults.setlanguesRequiredRoles),
      ticketCategoryID: cleanNullableString(mergedWithDefaults.ticketCategoryID),
      ticketLogChannelID: cleanNullableString(mergedWithDefaults.ticketLogChannelID),
      ticketOpenMessageID: cleanNullableString(mergedWithDefaults.ticketOpenMessageID),
      logChannelID: cleanNullableString(mergedWithDefaults.logChannelID),
      logEvents: Array.isArray(mergedWithDefaults.logEvents) ? [...new Set(mergedWithDefaults.logEvents.filter(e => typeof e === 'string' && e.trim() !== ''))] : [],
      ticketSupportRoles: cleanRoleIdArray(mergedWithDefaults.ticketSupportRoles),
      translationSystems: normalizedTranslationSystems,
      roleAssignmentSystems: normalizedRoleAssignmentSystems
    };

    // Ajouter reglementConfig normalisé
    if (mergedWithDefaults.reglementConfig) {
      normalizedSettings.reglementConfig = mergedWithDefaults.reglementConfig;
    }

    return normalizedSettings;
  }

  prepareDataForMongoDB(data) {
    const prepared = { ...data };
    
    // Convertir les objets en Maps pour MongoDB
    if (prepared.langueRoles && typeof prepared.langueRoles === 'object') {
      prepared.langueRoles = new Map(Object.entries(prepared.langueRoles));
    }
    
    // Traiter les roleAssignmentSystems
    if (prepared.roleAssignmentSystems) {
      prepared.roleAssignmentSystems = prepared.roleAssignmentSystems.map(system => ({
        ...system,
        triggerData: system.triggerData && typeof system.triggerData === 'object' ?
          new Map(Object.entries(system.triggerData)) : new Map()
      }));
    }

    // Traiter les translationSystems
    if (prepared.translationSystems) {
      prepared.translationSystems = prepared.translationSystems.map(system => ({
        ...system,
        channels: system.channels && typeof system.channels === 'object' ?
          new Map(Object.entries(system.channels)) : new Map()
      }));
    }
    
    return prepared;
  }

  convertFromMongoDB(mongoData) {
    if (!mongoData) return null;

    const converted = mongoData.toObject ? mongoData.toObject() : { ...mongoData };
    
    // Convertir les Maps en objets
    if (converted.langueRoles instanceof Map) {
      converted.langueRoles = Object.fromEntries(converted.langueRoles);
    }
    
    // Convertir les triggerData dans roleAssignmentSystems
    if (converted.roleAssignmentSystems) {
      converted.roleAssignmentSystems = converted.roleAssignmentSystems.map(system => ({
        ...system,
        triggerData: system.triggerData instanceof Map ? 
          Object.fromEntries(system.triggerData) : system.triggerData
      }));
    }

    // Convertir les channels dans translationSystems
    if (converted.translationSystems) {
      converted.translationSystems = converted.translationSystems.map(system => ({
        ...system,
        channels: system.channels instanceof Map ? 
          Object.fromEntries(system.channels) : system.channels
      }));
    }

    return converted;
  }
}

// Instance globale du manager
const mongoManager = new MongoManager();

// Exports fonctionnels
export async function getGuildSettings(guildId) {
  return await mongoManager.getGuildSettings(guildId);
}

export async function saveGuildSettings(guildId, settings) {
  return await mongoManager.saveGuildSettings(guildId, settings);
}

export async function initializeDataStructure() {
  return await mongoManager.connect();
}

export async function createBackup() {
  try {
    console.log(`✅ Backup automatique avec MongoDB Atlas (pas d'action nécessaire)`);
  } catch (err) {
    console.error('❌ Erreur backup MongoDB:', err.message);
  }
}

export async function cleanupOldBackups() {
  try {
    console.log(`✅ Nettoyage automatique avec MongoDB Atlas (pas d'action nécessaire)`);
  } catch (err) {
    console.error('❌ Erreur nettoyage MongoDB:', err.message);
  }
}

// Export de l'instance pour les fonctions avancées
export { mongoManager };