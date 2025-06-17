// auto.js - VERSION CORRIGÉE POUR MONGODB
import { getGuildSettings, saveGuildSettings } from '../mongoManager.js';

// Bloc d'aide exporté
export const autoHelp = {
  name: '🤖 Auto-react/message',
  value: '`[prefix]createcommande [message]` — Crée une commande auto-répondante\n' +
         '`[prefix]delcommande [message]` — Supprime une commande auto-répondante\n' +
         '`[prefix]listecommandes` — Liste toutes les commandes auto-répondantes\n' +
         '`[prefix]autorespond [mot] [message]` — Crée une auto-réponse\n' +
         '`[prefix]delrespond [numero]` — Supprime une auto-réponse\n' +
         '`[prefix]listrespond` — Liste toutes les auto-réponses\n' +
         '`[prefix]addreact [mot] [emoji]` — Ajoute une auto-réaction\n' +
         '`[prefix]delreact [numero]` — Supprime une auto-réaction\n' +
         '`[prefix]listreact` — Liste toutes les auto-réactions'
};

// Maps globales pour le cache (optionnel, pour de meilleures performances)
const customCommands = new Map();
const autoReplies = new Map();
const autoReacts = new Map();

// Configuration du préfixe par défaut
const DEFAULT_PREFIX = '!';

// Fonction principale pour les auto-réactions et réponses
export async function AutoReactsAndReplies(message) {
  const guildId = message.guild?.id;
  if (!guildId) return;

  try {
    // Charger les données depuis MongoDB
    const guildSettings = await getGuildSettings(guildId);
    const content = message.content.toLowerCase();

    // Auto-réactions
    if (guildSettings.autoReacts) {
      for (const [trigger, emoji] of Object.entries(guildSettings.autoReacts)) {
        if (content.includes(trigger.toLowerCase())) {
          try {
            await message.react(emoji);
          } catch (err) {
            console.error('Erreur de réaction :', err);
          }
        }
      }
    }
    
    // Auto-réponses
    if (guildSettings.autoReplies) {
      for (const [trigger, response] of Object.entries(guildSettings.autoReplies)) {
        if (content.includes(trigger.toLowerCase())) {
          try {
            await message.reply(response);
            return; // Une seule réponse auto par message
          } catch (err) {
            console.error('Erreur de réponse automatique :', err);
          }
        }
      }
    }
  } catch (error) {
    console.error('Erreur AutoReactsAndReplies:', error);
  }
}

export async function AutoFeaturesCommands(command, message, args, prefix = DEFAULT_PREFIX) {
  if (!message.guild) return false;
  
  const guildId = message.guild.id;

  try {
    // Charger les settings depuis MongoDB
    const guildSettings = await getGuildSettings(guildId);

    // Commandes personnalisées
    if (guildSettings.customCommands && guildSettings.customCommands[command]) {
      try {
        await message.reply(guildSettings.customCommands[command]);
        return true;
      } catch (err) {
        console.error('Erreur commande personnalisée:', err);
      }
    }

    if (!command) return false;

    // Commande pour créer une commande personnalisée
    if (command === 'createcommande') {
      // Vérification permission administrateur
      if (!message.member.permissions.has('Administrator')) {
        await message.reply("🚫 Tu n'as pas la permission d'utiliser cette commande.");
        return true;
      }

      // Vérifie les arguments
      const [name, ...response] = args;
      if (!name || response.length === 0) {
        await message.reply(`❌ Utilisation : \`${prefix}createcommande [nom] [réponse]\``);
        return true;
      }

      // Mise à jour MongoDB
      const updatedSettings = { ...guildSettings };
      if (!updatedSettings.customCommands) updatedSettings.customCommands = {};
      updatedSettings.customCommands[name.toLowerCase()] = response.join(' ');
      
      await saveGuildSettings(guildId, updatedSettings);
      await message.reply(`✅ Commande \`${name}\` créée.`);
      return true;
    }

    if (command === 'listecommandes') {
      const customCommands = guildSettings.customCommands || {};
      const commandNames = Object.keys(customCommands);

      if (commandNames.length === 0) {
        await message.reply('📭 Aucune commande personnalisée enregistrée pour ce serveur.');
        return true;
      }

      // Filtrage des noms non pertinents
      const filtered = commandNames.filter(name => /^[a-zA-Z0-9_]{2,32}$/.test(name));

      const formatted = filtered
        .sort()
        .map(name => `• \`${prefix}${name}\``)
        .join('\n');

      await message.reply(`📜 Commandes personnalisées :\n${formatted}`);
      return true;
    }

    if (command === 'delcommande') {
      if (!message.member.permissions.has('Administrator')) {
        await message.reply("🚫 Tu n'as pas la permission d'utiliser cette commande.");
        return true;
      }

      const name = args[0];
      if (!name) {
        await message.reply(`❌ Utilisation : \`${prefix}delcommande [nom]\``);
        return true;
      }

      const customCommands = guildSettings.customCommands || {};
      
      // Vérifie que la commande existe
      if (!customCommands[name]) {
        await message.reply(`❌ La commande \`${name}\` n'existe pas.`);
        return true;
      }

      // Supprime et sauvegarde
      const updatedSettings = { ...guildSettings };
      delete updatedSettings.customCommands[name];
      
      await saveGuildSettings(guildId, updatedSettings);
      await message.reply(`🗑 Commande \`${name}\` supprimée.`);
      return true;
    }

    if (command === 'listreact') {
      const autoReacts = guildSettings.autoReacts || {};
      
      if (Object.keys(autoReacts).length === 0) {
        await message.reply("❌ Aucune réaction automatique définie.");
        return true;
      }

      const list = Object.entries(autoReacts)
        .map(([trigger, emoji], index) => `${index + 1}. ${trigger} → ${emoji}`)
        .join('\n');

      await message.reply(`📜 Réactions automatiques enregistrées :\n${list}`);
      return true;
    }

    if (command === 'delreact') {
      if (!message.member.permissions.has('Administrator')) {
        await message.reply("🚫 Tu n'as pas la permission d'utiliser cette commande.");
        return true;
      }

      const index = parseInt(args[0], 10) - 1;
      const autoReacts = guildSettings.autoReacts || {};
      const keys = Object.keys(autoReacts);
      
      if (isNaN(index) || index < 0 || index >= keys.length) {
        await message.reply(`❌ Utilisation : \`${prefix}delreact [numéro]\` où le numéro est un indice valide.`);
        return true;
      }

      const triggerToDelete = keys[index];
      const updatedSettings = { ...guildSettings };
      delete updatedSettings.autoReacts[triggerToDelete];
      
      await saveGuildSettings(guildId, updatedSettings);
      await message.reply(`✅ Réaction associée au déclencheur \`${triggerToDelete}\` supprimée.`);
      return true;
    }

    // autoreact - ajout d'un alias pour addreact
    if (command === 'autoreact' || command === 'addreact') {
      if (!message.member.permissions.has('Administrator')) {
        await message.reply("🚫 Tu n'as pas la permission d'utiliser cette commande.");
        return true;
      }

      const [trigger, emoji] = args;
      if (!trigger || !emoji) {
        await message.reply(`❌ Utilisation : \`${prefix}${command} [mot/phrase] [emoji]\``);
        return true;
      }

      const updatedSettings = { ...guildSettings };
      if (!updatedSettings.autoReacts) updatedSettings.autoReacts = {};
      updatedSettings.autoReacts[trigger.toLowerCase()] = emoji;
      
      await saveGuildSettings(guildId, updatedSettings);
      await message.reply(`✅ Réaction ajoutée : \`${trigger}\` → ${emoji}`);
      return true;
    }

    if (command === 'autorespond') {
      if (!message.member.permissions.has('Administrator')) {
        await message.reply("🚫 Tu n'as pas la permission d'utiliser cette commande.");
        return true;
      }

      const trigger = args[0];
      const response = args.slice(1).join(' ');

      if (!trigger || !response) {
        await message.reply(`❌ Utilisation : \`${prefix}autorespond [mot] [message]\``);
        return true;
      }

      const updatedSettings = { ...guildSettings };
      if (!updatedSettings.autoReplies) updatedSettings.autoReplies = {};
      updatedSettings.autoReplies[trigger.toLowerCase()] = response;
      
      await saveGuildSettings(guildId, updatedSettings);
      await message.reply(`✅ Je répondrai maintenant à **${trigger}** par : ${response}`);
      return true;
    }

    // listrespond
    if (command === 'listrespond') {
      const autoReplies = guildSettings.autoReplies || {};
      
      if (Object.keys(autoReplies).length === 0) {
        await message.reply('📭 Aucune auto-réponse enregistrée.');
        return true;
      }

      const list = Object.entries(autoReplies)
        .map(([trigger, response], i) => `${i + 1}. ${trigger} → ${response}`)
        .join('\n');

      await message.reply(`📜 Auto-réponses enregistrées :\n${list}`);
      return true;
    }

    // delrespond
    if (command === 'delrespond') {
      if (!message.member.permissions.has('Administrator')) {
        await message.reply("🚫 Tu n'as pas la permission d'utiliser cette commande.");
        return true;
      }

      const index = parseInt(args[0], 10) - 1;
      const autoReplies = guildSettings.autoReplies || {};
      const keys = Object.keys(autoReplies);
      
      if (isNaN(index) || index < 0 || index >= keys.length) {
        await message.reply(`❌ Utilisation : \`${prefix}delrespond [numéro]\``);
        return true;
      }

      const key = keys[index];
      const updatedSettings = { ...guildSettings };
      delete updatedSettings.autoReplies[key];
      
      await saveGuildSettings(guildId, updatedSettings);
      await message.reply(`🗑 Auto-réponse pour \`${key}\` supprimée.`);
      return true;
    }

    return false; // Commande non trouvée
  } catch (error) {
    console.error('Erreur dans AutoFeaturesCommands:', error);
    return false;
  }
}