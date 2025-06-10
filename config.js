// config.js - Version corrigée avec LANGUE_CODES en tableau
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const PATHS = {
  DATA_DIR: path.join(__dirname, 'data'),
  BACKUPS_DIR: path.join(__dirname, 'data', 'backups'),
  GUILD_SETTINGS: path.join(__dirname, 'data', 'guildSettings.json')
};

export const DEFAULT_GUILD_SETTINGS = {
  prefix: '.',
  welcomeEnabled: false,
  welcomeMessage: 'Bienvenue {user} sur le serveur !',
  goodbyeEnabled: false,
  goodbyeMessage: 'Au revoir {username} !',
  welcomeChannel: null,
  langueRoles: {
    fr: '',
    en: '',
    es: '',
    de: '',
    pt: '',
    ru: '',
    hu: '',
    it: ''
  },
  setlanguesRequiredRoles: [],
  ticketCategoryID: null,
  ticketLogChannelID: null,
  ticketOpenMessageID: null,
  logChannelID: null,
  logEvents: [],
  ticketSupportRoles: [],
  translationSystems: [],
  roleAssignmentSystems: [],
  // ✅ AJOUT CRUCIAL : Configuration par défaut du règlement
  reglementConfig: {
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
  }
};

// ✅ CORRECTION : Garder l'ancienne structure objet pour le dashboard
export const LANGUE_CODES = {
  fr: 'Français',
  en: 'English',
  es: 'Español',
  de: 'Deutsch',
  pt: 'Português',
  ru: 'Русский',
  hu: 'Magyar',
  it: 'Italiano'
};

// ✅ AJOUT : Version tableau pour les fonctions qui nécessitent .forEach()
export const LANGUE_CODES_ARRAY = [
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'hu', name: 'Magyar', flag: '🇭🇺' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' }
];

// Fonction de fusion compatible avec l'existant
export function mergeGuildSettings(current, updates) {
  const merged = { ...current };
  
  // Fusion des propriétés de base
  Object.keys(updates).forEach(key => {
    if (updates[key] !== undefined) {
      if (key === 'langueRoles' && typeof updates[key] === 'object') {
        merged[key] = { ...current[key], ...updates[key] };
      } else if (key === 'reglementConfig' && typeof updates[key] === 'object') {
        // ✅ Fusion spéciale pour reglementConfig
        merged[key] = { 
          ...DEFAULT_GUILD_SETTINGS.reglementConfig,
          ...current[key], 
          ...updates[key] 
        };
        
        // Fusion des sections si elles existent
        if (updates[key].sections && Array.isArray(updates[key].sections)) {
          merged[key].sections = updates[key].sections;
        }
      } else if (Array.isArray(updates[key])) {
        merged[key] = [...updates[key]];
      } else {
        merged[key] = updates[key];
      }
    }
  });
  
  return merged;
}