// commandes/autre.js
// commandes/autre.js
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { getGuildSettings } from '../mongoManager.js';
import { LANGUE_CODES } from '../config.js';

// Fonction pour vérifier si l'utilisateur a les rôles requis
function hasRequiredRoles(member, requiredRoleIds) {
  if (!requiredRoleIds || requiredRoleIds.length === 0) {
    return true; // Aucune restriction si pas de rôles configurés
  }

  const memberRoleIds = member.roles.cache.map(role => role.id);
  return requiredRoleIds.some(roleId => memberRoleIds.includes(roleId));
}
export const helpFields = [
  {
    name: '❓ Aide',
    value: '`[prefix]help` — Affiche ce message d\'aide avec la liste des commandes disponibles.'
  },
  {
    name: '📊 Sondages',
    value: '`[prefix]poll <question> ; <option1> ; <option2> ; ...` — Crée un sondage avec jusqu\'à 10 options.\n' +
           '`[prefix]closepoll <ID>` — Ferme un sondage en cours grâce à son ID.'
  },
  {
    name: '🌐 Langues',
    value: '`[prefix]setlangues` — Affiche des boutons pour choisir ou retirer vos rôles langues (toggle).'
  }
];

// Map pour stocker les sondages actifs : Map<pollId, pollData>
export const activePolls = new Map();

// Emoji lettres pour les options du sondage
const emojiLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

// Gestion des commandes "diverses" : poll, closepoll, setlangues
export async function handleOthersCommand(command, message, args) {
  const commandBody = message.content.slice(1).trim();
  const [...rest] = commandBody.split(' ');
  const fullArgs = rest.join(' ');

  // === COMMANDES DE SONDAGE ===
  if (command === 'poll') {
    // Parse flags et arguments
    const flags = fullArgs.match(/--\w+(=([^\s]+))?/g) || [];
    const inputWithoutFlags = fullArgs.replace(/--\w+(=([^\s]+))?/g, '').trim();

    const input = inputWithoutFlags.split(';').map(arg => arg.trim());
    if (input.length < 3 || input.length > 11) {
      await message.reply("❌ Utilisation : `!poll Question ?; Option 1; Option 2; ...` (2 à 10 options)");
      return true; // Commande traitée
    }

    const [question, ...options] = input;

    let roles = [];
    let anonymous = false;

    flags.forEach(flag => {
      if (flag.startsWith('--roles=')) {
        roles = flag.split('=')[1].split(',').map(r => r.trim());
      } else if (flag === '--anonymous') {
        anonymous = true;
      }
    });

    // Embed du sondage
    const fields = options.map((opt, i) => ({
      name: `${emojiLetters[i]} ${opt}`,
      value: '\u200b',
    }));

    const pollId = Date.now().toString().slice(-6);

    const embed = new EmbedBuilder()
      .setTitle(`📊 ${question}`)
      .addFields(...fields)
      .setFooter({ text: `ID du sondage : ${pollId}` })
      .setColor('Random');

    // Boutons des options
    const row = new ActionRowBuilder();
    options.forEach((opt, i) => {
      row.addComponents(
        new ButtonBuilder()
          .setCustomId(`poll_${pollId}_${i}`)
          .setLabel(emojiLetters[i])
          .setStyle(ButtonStyle.Primary)
      );
    });

    const pollMessage = await message.channel.send({ embeds: [embed], components: [row] });

    // Enregistrement du sondage (stockage global par ID)
    activePolls.set(pollId, {
      channelId: message.channel.id,
      message: pollMessage,
      roles,
      anonymous,
      results: {},        // { optionIndex: voteCount }
      voters: new Map()   // { userId: optionIndex }
    });

    await message.reply(`✅ Sondage créé avec l'ID \`${pollId}\`.`);
    return true; // Commande traitée
  }

  if (command === 'closepoll') {
    const pollId = rest[1];
    if (!pollId) {
      await message.reply("❌ Utilisation : `!closepoll [ID]`");
      return true; // Commande traitée
    }

    if (!activePolls.has(pollId)) {
      await message.reply("❌ Aucun sondage actif avec cet ID.");
      return true; // Commande traitée
    }

    const pollData = activePolls.get(pollId);

    // Optionnel : forcer fermeture dans le même salon
    if (pollData.channelId !== message.channel.id) {
      await message.reply("❌ Tu dois fermer le sondage dans le même salon où il a été créé.");
      return true; // Commande traitée
    }

    const pollMessage = pollData.message;
    const results = pollData.results;

    // Format des résultats
    const resultText = emojiLetters
      .slice(0, Object.keys(results).length)
      .map((emoji, i) => `Option ${emoji} : ${results[i] || 0} vote(s)`)
      .join('\n');

    // Désactivation des boutons
    const disabledRow = new ActionRowBuilder().addComponents(
      pollMessage.components[0].components.map(button =>
        ButtonBuilder.from(button).setDisabled(true)
      )
    );

    await pollMessage.edit({ components: [disabledRow] });
    activePolls.delete(pollId);

    await message.channel.send(`📥 Résultats du sondage \`${pollId}\` :\n${resultText}`);
    return true; // Commande traitée
  }

  // === COMMANDE SETLANGUES ===
   if (command === 'setlangues') {
    try {
      // Récupérer les paramètres du serveur avec le nouveau système
      const guildSettings = await getGuildSettings(message.guild.id); // ✅ Corrigé
      const langueRoles = guildSettings.langueRoles || {};
      const setlanguesRequiredRoles = guildSettings.setlanguesRequiredRoles || [];

      // Vérifier si l'utilisateur a les rôles requis pour utiliser cette commande
      if (!hasRequiredRoles(message.member, setlanguesRequiredRoles)) {
        await message.reply("❌ Tu n'as pas les permissions nécessaires pour utiliser cette commande.");
        return true; // Commande traitée
      }
      
      // Créer la description du message
      let description = "Clique sur le bouton correspondant à ta langue (un clic pour activer/désactiver) :\n\n";
      
      // Mapping des codes de langue vers leurs noms complets
      const langueNames = {
        'fr': '🇫🇷 Français',
        'en': '🇬🇧 English', 
        'es': '🇪🇸 Español',
        'de': '🇩🇪 Deutsch',
        'pt': '🇵🇹 Português',
        'ru': '🇷🇺 Русский',
        'hu': '🇭🇺 Magyar',
        'it': '🇮🇹 Italiano'
      };

      // Vérifier quelles langues sont configurées
      let configuredLanguages = 0;
      for (const [code, roleId] of Object.entries(langueRoles)) {
        if (roleId && roleId.trim() !== '') {
          description += `${langueNames[code] || code.toUpperCase()}\n`;
          configuredLanguages++;
        }
      }

      if (configuredLanguages === 0) {
        await message.reply("❌ Aucun rôle de langue n'a été configuré dans le dashboard pour ce serveur.");
        return true;
      }

      const embed = new EmbedBuilder()
        .setColor('#2ecc71')
        .setTitle('🌍 Choisis ta langue')
        .setDescription(description)
        .setFooter({ text: 'Clique pour activer/désactiver un rôle' });

      // Créer les boutons pour chaque langue configurée
      const rows = [];
      let currentRow = new ActionRowBuilder();
      let buttonCount = 0;
      
      for (const [code, roleId] of Object.entries(langueRoles)) {
        if (!roleId || roleId.trim() === '') continue; // Ignorer les langues sans rôle configuré
        
        // Vérifier que le rôle existe sur le serveur
        const role = message.guild.roles.cache.get(roleId);
        if (!role) {
          console.warn(`Rôle ${roleId} pour la langue ${code} introuvable sur ${message.guild.name}`);
          continue;
        }
        
        const button = new ButtonBuilder()
          .setCustomId(`lang_${code}_${roleId}`)
          .setLabel(langueNames[code] || code.toUpperCase())
          .setStyle(ButtonStyle.Primary);
        
        currentRow.addComponents(button);
        buttonCount++;
        
        // Discord limite à 5 boutons par rangée
        if (buttonCount % 5 === 0) {
          rows.push(currentRow);
          currentRow = new ActionRowBuilder();
        }
      }
      
      // Ajouter la dernière rangée si elle contient des boutons
      if (currentRow.components.length > 0) {
        rows.push(currentRow);
      }
      
      if (rows.length === 0) {
        await message.reply("❌ Aucun rôle de langue valide trouvé sur ce serveur.");
        return true;
      }
      
      await message.channel.send({ embeds: [embed], components: rows });
      return true; // Commande traitée
    } catch (error) {
      console.error('Erreur dans setlangues:', error);
      await message.reply("❌ Une erreur est survenue lors du chargement des paramètres du serveur.");
      return true; // Commande traitée
    }
  }

  // Commande non reconnue
  return false;
}

// Gestion des clics sur boutons (sondages + setlangues)
export async function handleButtonInteraction(interaction) {
  if (!interaction.isButton()) return false;

  const customId = interaction.customId;

  // --- Gestion des boutons de sondage ---
  if (customId.startsWith('poll_')) {
    const [_, pollId, optionIndexStr] = customId.split('_');
    const optionIndex = parseInt(optionIndexStr);

    if (!activePolls.has(pollId)) {
      await interaction.reply({ 
        content: '❌ Ce sondage n\'existe plus ou est fermé.', 
        ephemeral: true 
      });
      return true;
    }

    const pollData = activePolls.get(pollId);

    // Vérification des rôles requis si nécessaire
    if (pollData.roles.length > 0) {
      const memberRoleIds = interaction.member.roles.cache.map(r => r.id);
      const hasRole = pollData.roles.some(rId => memberRoleIds.includes(rId));
      if (!hasRole) {
        await interaction.reply({ 
          content: '❌ Tu n\'as pas le rôle nécessaire pour voter.', 
          ephemeral: true 
        });
        return true;
      }
    }

    const previousVote = pollData.voters.get(interaction.user.id);

    // Si l'utilisateur vote pour la même option que précédemment
    if (previousVote === optionIndex) {
      await interaction.reply({ 
        content: `✅ Tu as déjà voté pour cette option (${emojiLetters[optionIndex]}).`, 
        ephemeral: true 
      });
      return true;
    }

    // Si l'utilisateur change son vote, on retire son vote précédent
    if (previousVote !== undefined) {
      pollData.results[previousVote] = Math.max(0, (pollData.results[previousVote] || 0) - 1);
    }

    // Enregistrement du nouveau vote
    pollData.voters.set(interaction.user.id, optionIndex);
    pollData.results[optionIndex] = (pollData.results[optionIndex] || 0) + 1;

    // Réponse au votant selon que le sondage est anonyme ou non
    if (pollData.anonymous) {
      await interaction.reply({ 
        content: `✅ Vote enregistré. (sondage anonyme)`, 
        ephemeral: true 
      });
    } else {
      await interaction.reply({ 
        content: `✅ Tu as voté pour l'option ${emojiLetters[optionIndex]}.`, 
        ephemeral: true 
      });
    }

    return true;
  }

  // --- Gestion des boutons de sélection/désélection des rôles langues ---
  if (customId.startsWith('lang_')) {
    try {
      const [_, langCode, roleId] = customId.split('_');
      
      // Vérifier les permissions pour les interactions avec les boutons aussi
      const guildSettings = await getGuildSettings(interaction.guild.id);
      const setlanguesRequiredRoles = guildSettings.setlanguesRequiredRoles || [];
      
      if (!hasRequiredRoles(interaction.member, setlanguesRequiredRoles)) {
        await interaction.reply({ 
          content: '❌ Tu n\'as pas les permissions nécessaires pour utiliser cette fonctionnalité.', 
          ephemeral: true 
        });
        return true;
      }
      
      const role = interaction.guild.roles.cache.get(roleId);
      if (!role) {
        await interaction.reply({ 
          content: `❌ Le rôle est introuvable (ID: ${roleId}).`, 
          ephemeral: true 
        });
        return true;
      }

      const member = interaction.member;

      try {
        if (member.roles.cache.has(role.id)) {
          await member.roles.remove(role);
          await interaction.reply({ 
            content: `🗑️ Le rôle **${role.name}** t'a été retiré.`, 
            ephemeral: true 
          });
        } else {
          await member.roles.add(role);
          await interaction.reply({ 
            content: `✅ Tu as maintenant le rôle **${role.name}**.`, 
            ephemeral: true 
          });
        }
      } catch (err) {
        console.error('Erreur modification rôle:', err);
        await interaction.reply({ 
          content: '❌ Une erreur est survenue lors de la modification du rôle. Vérifiez que le bot a les permissions nécessaires et que son rôle est au-dessus du rôle à assigner.', 
          ephemeral: true 
        });
      }
    } catch (error) {
      console.error('Erreur dans handleButtonInteraction (lang):', error);
      await interaction.reply({ 
        content: '❌ Une erreur est survenue lors du traitement de votre demande.', 
        ephemeral: true 
      });
    }

    return true;
  }

  return false;
}