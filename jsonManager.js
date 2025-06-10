// jsonManager.js - FIX TEMPORAIRE
console.log("⚠️ jsonManager.js utilisé - redirection vers mongoManager.js");

export {
  initializeDataStructure,
  getGuildSettings,
  saveGuildSettings,
  createBackup,
  cleanupOldBackups
} from './mongoManager.js';