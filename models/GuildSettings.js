// models/GuildSettings.js - VERSION CORRIGÉE ET OPTIMISÉE
import mongoose from 'mongoose';

// Schéma pour les sections du règlement
const ReglementSectionSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 256
  },
  value: { 
    type: String, 
    required: true,
    maxlength: 1024
  },
  inline: { 
    type: Boolean, 
    default: false 
  }
}, { _id: false });

// Schéma pour la configuration du règlement
const ReglementConfigSchema = new mongoose.Schema({
  enabled: { type: Boolean, default: false },
  title: { 
    type: String, 
    default: 'Règlement du Serveur',
    maxlength: 256,
    trim: true
  },
  description: { 
    type: String, 
    default: 'Veuillez lire et accepter notre règlement pour accéder au serveur.',
    maxlength: 1024,
    trim: true
  },
  color: { 
    type: String, 
    default: '#7289DA',
    validate: {
      validator: function(v) {
        return /^#[0-9A-Fa-f]{6}$/.test(v);
      },
      message: 'La couleur doit être au format hexadécimal (#RRGGBB)'
    }
  },
  sections: [ReglementSectionSchema],
  footerText: { 
    type: String, 
    default: 'En acceptant, vous obtiendrez automatiquement vos rôles d\'accès',
    maxlength: 512,
    trim: true
  },
  showThumbnail: { type: Boolean, default: true },
  showTimestamp: { type: Boolean, default: true },
  acceptButtonText: { 
    type: String, 
    default: '✅ J\'accepte le règlement',
    maxlength: 80,
    trim: true
  },
  declineButtonText: { 
    type: String, 
    default: '❌ Je refuse',
    maxlength: 80,
    trim: true
  },
  acceptButtonEmoji: { 
    type: String, 
    default: '📋',
    maxlength: 10
  },
  declineButtonEmoji: { 
    type: String, 
    default: '🚫',
    maxlength: 10
  },
  // Champs optionnels pour l'envoi automatique
  autoSend: { type: Boolean, default: false },
  targetChannelId: { 
    type: String, 
    validate: {
      validator: function(v) {
        return !v || /^\d{17,20}$/.test(v);
      },
      message: 'L\'ID du salon doit être un ID Discord valide'
    }
  },
  lastMessageId: { 
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^\d{17,20}$/.test(v);
      },
      message: 'L\'ID du message doit être un ID Discord valide'
    }
  },
  lastSent: { type: Date },
  lastChannelId: { 
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^\d{17,20}$/.test(v);
      },
      message: 'L\'ID du salon doit être un ID Discord valide'
    }
  }
}, { _id: false });

// Schéma pour les systèmes de traduction
const TranslationSystemSchema = new mongoose.Schema({
  id: { 
    type: String, 
    required: true,
    index: true
  },
  name: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 100
  },
  channels: { 
    type: Map, 
    of: {
      type: String,
      validate: {
        validator: function(v) {
          return /^\d{17,20}$/.test(v);
        },
        message: 'L\'ID du salon doit être un ID Discord valide'
      }
    },
    default: {} 
  }
}, { _id: false });

// Schéma pour les systèmes d'attribution de rôles
const RoleAssignmentSystemSchema = new mongoose.Schema({
  id: { 
    type: String, 
    required: true,
    index: true
  },
  name: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 100
  },
  description: { 
    type: String, 
    default: '',
    maxlength: 500,
    trim: true
  },
  condition: { 
    type: String, 
    enum: ['member_join', 'button_click', 'reaction_add', 'command_use'], 
    required: true,
    index: true
  },
  targetRole: { 
    type: String, 
    required: true,
    validate: {
      validator: function(v) {
        return /^\d{17,20}$/.test(v);
      },
      message: 'L\'ID du rôle doit être un ID Discord valide'
    },
    index: true
  },
  enabled: { 
    type: Boolean, 
    default: true,
    index: true
  },
  triggerData: { 
    type: Map, 
    of: mongoose.Schema.Types.Mixed, 
    default: {} 
  }
}, { _id: false });

// Schéma principal des paramètres de serveur
const GuildSettingsSchema = new mongoose.Schema({
  guildId: { 
    type: String, 
    required: true, 
    unique: true,
    index: true,
    validate: {
      validator: function(v) {
        return /^\d{17,20}$/.test(v);
      },
      message: 'L\'ID du serveur doit être un ID Discord valide'
    }
  },
  prefix: { 
    type: String, 
    default: '.',
    maxlength: 5,
    trim: true
  },
  
  // Messages de bienvenue/au revoir
  welcomeEnabled: { type: Boolean, default: false },
  welcomeMessage: { 
    type: String, 
    default: '',
    maxlength: 2000,
    trim: true
  },
  goodbyeEnabled: { type: Boolean, default: false },
  goodbyeMessage: { 
    type: String, 
    default: '',
    maxlength: 2000,
    trim: true
  },
  welcomeChannel: { 
    type: String, 
    default: null,
    validate: {
      validator: function(v) {
        return !v || /^\d{17,20}$/.test(v);
      },
      message: 'L\'ID du salon doit être un ID Discord valide'
    }
  },
  
  // Rôles de langue
  langueRoles: { 
    type: Map, 
    of: {
      type: String,
      validate: {
        validator: function(v) {
          return !v || /^\d{17,20}$/.test(v);
        },
        message: 'L\'ID du rôle doit être un ID Discord valide'
      }
    },
    default: {} 
  },
  setlanguesRequiredRoles: [{
    type: String,
    validate: {
      validator: function(v) {
        return /^\d{17,20}$/.test(v);
      },
      message: 'L\'ID du rôle doit être un ID Discord valide'
    }
  }],
  
  // Système de tickets
  ticketCategoryID: { 
    type: String, 
    default: null,
    validate: {
      validator: function(v) {
        return !v || /^\d{17,20}$/.test(v);
      },
      message: 'L\'ID de la catégorie doit être un ID Discord valide'
    }
  },
  ticketLogChannelID: { 
    type: String, 
    default: null,
    validate: {
      validator: function(v) {
        return !v || /^\d{17,20}$/.test(v);
      },
      message: 'L\'ID du salon doit être un ID Discord valide'
    }
  },
  ticketOpenMessageID: { 
    type: String, 
    default: null,
    validate: {
      validator: function(v) {
        return !v || /^\d{17,20}$/.test(v);
      },
      message: 'L\'ID du message doit être un ID Discord valide'
    }
  },
  ticketSupportRoles: [{
    type: String,
    validate: {
      validator: function(v) {
        return /^\d{17,20}$/.test(v);
      },
      message: 'L\'ID du rôle doit être un ID Discord valide'
    }
  }],
  
  // Logs
  logChannelID: { 
    type: String, 
    default: null,
    validate: {
      validator: function(v) {
        return !v || /^\d{17,20}$/.test(v);
      },
      message: 'L\'ID du salon doit être un ID Discord valide'
    }
  },
  logEvents: [{ 
    type: String, 
    enum: [
      'memberJoin', 'memberLeave', 'messageDelete', 'messageUpdate', 
      'channelCreate', 'channelDelete', 'channelUpdate', 
      'roleCreate', 'roleDelete', 'roleUpdate'
    ]
  }],
  
  // Systèmes avancés
  translationSystems: [TranslationSystemSchema],
  roleAssignmentSystems: [RoleAssignmentSystemSchema],
  
  // Configuration du règlement
  reglementConfig: { 
    type: ReglementConfigSchema, 
    default: () => ({
      enabled: false,
      title: 'Règlement du Serveur',
      description: 'Veuillez lire et accepter notre règlement pour accéder au serveur.',
      color: '#7289DA',
      sections: [
        {
          name: 'Règles Générales',
          value: '• Respectez tous les membres\n• Pas de spam ou contenu inapproprié\n• Utilisez les bons salons\n• Suivez les instructions des modérateurs',
          inline: false
        }
      ],
      footerText: 'En acceptant, vous obtiendrez automatiquement vos rôles d\'accès',
      showThumbnail: true,
      showTimestamp: true,
      acceptButtonText: '✅ J\'accepte le règlement',
      declineButtonText: '❌ Je refuse',
      acceptButtonEmoji: '📋',
      declineButtonEmoji: '🚫'
    })
  },
  
  // Métadonnées
  createdAt: { 
    type: Date, 
    default: Date.now,
    index: true
  },
  updatedAt: { 
    type: Date, 
    default: Date.now,
    index: true
  }
});

// Index composés pour optimiser les requêtes
GuildSettingsSchema.index({ guildId: 1, updatedAt: -1 });
GuildSettingsSchema.index({ 'roleAssignmentSystems.condition': 1, 'roleAssignmentSystems.enabled': 1 });
GuildSettingsSchema.index({ 'translationSystems.id': 1 });

// Middleware pour mettre à jour updatedAt automatiquement
GuildSettingsSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

GuildSettingsSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: new Date() });
  next();
});

// Méthodes statiques utiles
GuildSettingsSchema.statics.findByGuildId = function(guildId) {
  return this.findOne({ guildId }).lean();
};

GuildSettingsSchema.statics.createOrUpdate = async function(guildId, updateData) {
  const options = { 
    upsert: true, 
    new: true, 
    runValidators: true,
    setDefaultsOnInsert: true
  };
  
  return this.findOneAndUpdate(
    { guildId }, 
    { ...updateData, updatedAt: new Date() }, 
    options
  );
};

// Méthode pour nettoyer les données avant sauvegarde
GuildSettingsSchema.methods.cleanData = function() {
  // Nettoyer les arrays vides
  if (this.logEvents && this.logEvents.length === 0) {
    this.logEvents = undefined;
  }
  if (this.setlanguesRequiredRoles && this.setlanguesRequiredRoles.length === 0) {
    this.setlanguesRequiredRoles = undefined;
  }
  if (this.ticketSupportRoles && this.ticketSupportRoles.length === 0) {
    this.ticketSupportRoles = undefined;
  }
  
  // Nettoyer les Maps vides
  if (this.langueRoles && this.langueRoles.size === 0) {
    this.langueRoles = undefined;
  }
  
  return this;
};

// Validation personnalisée au niveau du document
GuildSettingsSchema.pre('validate', function(next) {
  // Validation des systèmes de traduction
  if (this.translationSystems) {
    for (let system of this.translationSystems) {
      if (!system.id || !system.name) {
        return next(new Error('Chaque système de traduction doit avoir un ID et un nom'));
      }
    }
  }
  
  // Validation des systèmes d'attribution de rôles
  if (this.roleAssignmentSystems) {
    for (let system of this.roleAssignmentSystems) {
      if (!system.id || !system.name || !system.targetRole) {
        return next(new Error('Chaque système de rôles doit avoir un ID, un nom et un rôle cible'));
      }
    }
  }
  
  next();
});

// Création du modèle
const GuildSettings = mongoose.model("GuildSettings", GuildSettingsSchema);

// Export par défaut
export default GuildSettings;