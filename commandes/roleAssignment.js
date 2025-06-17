// commandes/roleAssignment.js - VERSION CORRIGÉE
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } from 'discord.js';
import { getGuildSettings, saveGuildSettings } from '../mongoManager.js';

// Fonction pour vérifier si l'utilisateur a les rôles requis
function hasRequiredRoles(member, requiredRoleIds) {
  if (!requiredRoleIds || requiredRoleIds.length === 0) {
    return true; // Aucune restriction si pas de rôles configurés
  }
  
  const memberRoleIds = member.roles.cache.map(role => role.id);
  return requiredRoleIds.some(roleId => memberRoleIds.includes(roleId));
}

// ===== VERSION DEBUG DU SYSTÈME D'ATTRIBUTION DE RÔLES =====
// Fonction principale pour gérer les attributions de rôles
export async function handleRoleAssignment(type, data, client) {
  try {
    const { guild, user, member, messageId, emoji, buttonId, command } = data;
    
    console.log(`[ROLE DEBUG] Début handleRoleAssignment - Type: ${type}`);
    console.log(`[ROLE DEBUG] Données reçues:`, {
      guild: guild?.name,
      user: user?.tag,
      messageId,
      emoji,
      buttonId,
      command
    });
    
    const guildSettings = await getGuildSettings(guild.id);
    console.log(`[ROLE DEBUG] Settings récupérés pour ${guild.name}:`, {
      hasRoleAssignmentSystems: !!guildSettings?.roleAssignmentSystems,
      systemCount: guildSettings?.roleAssignmentSystems?.length || 0,
      systems: guildSettings?.roleAssignmentSystems?.map(s => ({
        id: s.id,
        name: s.name,
        condition: s.condition,
        enabled: s.enabled,
        targetRole: s.targetRole,
        triggerData: s.triggerData
      })) || []
    });
    
    if (!guildSettings?.roleAssignmentSystems?.length) {
      console.log(`[ROLE DEBUG] Aucun système d'attribution de rôles configuré pour ${guild.name}`);
      return;
    }

    // Trouver les systèmes correspondants
    const matchingSystems = guildSettings.roleAssignmentSystems.filter(system => {
      console.log(`[ROLE DEBUG] Vérification système '${system.name}' (${system.id}):`);
      console.log(`[ROLE DEBUG] - Enabled: ${system.enabled}`);
      console.log(`[ROLE DEBUG] - Condition: ${system.condition}`);
      console.log(`[ROLE DEBUG] - TriggerData:`, system.triggerData);
      
      if (!system.enabled) {
        console.log(`[ROLE DEBUG] - Système désactivé, ignoré`);
        return false;
      }
      
      switch (type) {
        case 'member_join':
          const isJoinMatch = system.condition === 'member_join';
          console.log(`[ROLE DEBUG] - member_join match: ${isJoinMatch}`);
          return isJoinMatch;
          
        case 'reaction_add':
          const isReactionMatch = system.condition === 'reaction_add' && 
                 system.triggerData?.messageId === messageId &&
                 system.triggerData?.emoji === emoji;
          console.log(`[ROLE DEBUG] - reaction_add match: ${isReactionMatch}`);
          console.log(`[ROLE DEBUG] - Message ID match: ${system.triggerData?.messageId} === ${messageId} = ${system.triggerData?.messageId === messageId}`);
          console.log(`[ROLE DEBUG] - Emoji match: '${system.triggerData?.emoji}' === '${emoji}' = ${system.triggerData?.emoji === emoji}`);
          return isReactionMatch;
                 
        case 'button_click':
          const isButtonMatch = system.condition === 'button_click' && 
                 system.triggerData?.buttonId === buttonId;
          console.log(`[ROLE DEBUG] - button_click match: ${isButtonMatch}`);
          return isButtonMatch;
                 
        case 'command_use':
          const isCommandMatch = system.condition === 'command_use' && 
                 system.triggerData?.command === command;
          console.log(`[ROLE DEBUG] - command_use match: ${isCommandMatch}`);
          return isCommandMatch;
                 
        default:
          console.log(`[ROLE DEBUG] - Type inconnu: ${type}`);
          return false;
      }
    });

    console.log(`[ROLE DEBUG] Systèmes correspondants trouvés: ${matchingSystems.length}`);

    // Attribuer les rôles
    for (const system of matchingSystems) {
      try {
        console.log(`[ROLE DEBUG] Traitement du système '${system.name}'`);
        console.log(`[ROLE DEBUG] Recherche du rôle ID: ${system.targetRole}`);
        
        const role = guild.roles.cache.get(system.targetRole);
        if (!role) {
          console.error(`[ROLE DEBUG] ❌ Rôle ${system.targetRole} introuvable pour le système ${system.name}`);
          continue;
        }

        console.log(`[ROLE DEBUG] ✅ Rôle trouvé: ${role.name} (${role.id})`);

        // Vérifier si l'utilisateur a déjà le rôle
        if (member.roles.cache.has(system.targetRole)) {
          console.log(`[ROLE DEBUG] ⚠️ L'utilisateur ${user.tag} a déjà le rôle ${role.name}`);
          continue;
        }

        // Vérifier les permissions du bot
        const botMember = guild.members.me;
        if (!botMember.permissions.has('ManageRoles')) {
          console.error(`[ROLE DEBUG] ❌ Le bot n'a pas la permission "Gérer les rôles"`);
          continue;
        }

        // Vérifier la hiérarchie des rôles
        if (role.position >= botMember.roles.highest.position) {
          console.error(`[ROLE DEBUG] ❌ Le rôle ${role.name} est trop haut dans la hiérarchie`);
          continue;
        }

        // Attribuer le rôle
        console.log(`[ROLE DEBUG] 🎭 Attribution du rôle ${role.name} à ${user.tag}...`);
        await member.roles.add(role, `Attribution automatique via le système "${system.name}"`);
        console.log(`[ROLE DEBUG] ✅ Rôle ${role.name} attribué avec succès à ${user.tag}`);

        // Log optionnel
        const logChannel = guildSettings.logChannelID;
        if (logChannel) {
          const channel = guild.channels.cache.get(logChannel);
          if (channel?.isTextBased?.()) {
            const embed = new EmbedBuilder()
              .setColor('#00FF00')
              .setTitle('🎭 Attribution de Rôle Automatique')
              .setDescription(`**Utilisateur:** ${user}\n**Rôle:** ${role}\n**Système:** ${system.name}\n**Condition:** ${system.condition}`)
              .setTimestamp();
            
            try {
              await channel.send({ embeds: [embed] });
              console.log(`[ROLE DEBUG] 📝 Log envoyé dans ${channel.name}`);
            } catch (logError) {
              console.error(`[ROLE DEBUG] ❌ Erreur envoi log:`, logError);
            }
          }
        }

      } catch (error) {
        console.error(`[ROLE DEBUG] ❌ Erreur lors de l'attribution du rôle ${system.name}:`, error);
        console.error(`[ROLE DEBUG] Stack trace:`, error.stack);
      }
    }

  } catch (error) {
    console.error('[ROLE DEBUG] ❌ Erreur globale dans handleRoleAssignment:', error);
    console.error('[ROLE DEBUG] Stack trace:', error.stack);
  }
}

// Commande pour créer un message avec bouton d'acceptation
export async function createRuleAcceptanceMessage(message, args) {
  try {
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return message.reply('❌ Seuls les administrateurs peuvent utiliser cette commande.');
    }

    const guildSettings = await getGuildSettings(message.guild.id);
    const roleSystem = guildSettings?.roleAssignmentSystems?.find(s => s.condition === 'button_click');

    if (!roleSystem) {
      return message.reply('❌ Aucun système de rôle par bouton configuré. Configurez-le depuis le dashboard.');
    }

    const embed = new EmbedBuilder()
      .setColor('#0099FF')
      .setTitle('📋 Règlement du Serveur')
      .setDescription('Veuillez lire attentivement le règlement ci-dessous.\n\nEn cliquant sur "✅ J\'accepte", vous confirmez avoir lu et accepté les règles de ce serveur.')
      .addFields([
        {
          name: '📖 Règles Principales',
          value: '• Respectez tous les membres\n• Pas de spam ou de contenu inapproprié\n• Utilisez les bons salons\n• Suivez les instructions des modérateurs',
          inline: false
        }
      ])
      .setFooter({ text: 'Cliquez sur le bouton ci-dessous pour accepter' })
      .setTimestamp();

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('accept_rules')
          .setLabel('✅ J\'accepte le règlement')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId('decline_rules')
          .setLabel('❌ Je refuse')
          .setStyle(ButtonStyle.Danger)
      );

    await message.channel.send({ embeds: [embed], components: [row] });
    await message.delete();

    return true;
  } catch (error) {
    console.error('Erreur createRuleAcceptanceMessage:', error);
    return false;
  }
}

// ✅ FONCTION MANQUANTE AJOUTÉE
// Commande pour configurer les systèmes de rôles
export async function configureRoleSystem(message, args) {
  try {
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return message.reply('❌ Seuls les administrateurs peuvent utiliser cette commande.');
    }

    const embed = new EmbedBuilder()
      .setColor('#7289DA')
      .setTitle('⚙️ Configuration des Systèmes de Rôles')
      .setDescription('Pour configurer les systèmes d\'attribution de rôles, rendez-vous sur le **Dashboard Web** de votre serveur.\n\nVous pourrez y créer et gérer plusieurs systèmes avec différentes conditions.')
      .addFields([
        {
          name: '🌐 Dashboard',
          value: `Accédez au dashboard pour configurer vos systèmes de rôles avec une interface intuitive.`,
          inline: false
        },
        {
          name: '🎭 Types de Systèmes Disponibles',
          value: '• **Arrivée** - Rôle automatique à l\'arrivée\n• **Réaction** - Rôle via réaction sur un message\n• **Bouton** - Rôle via clic sur un bouton\n• **Commande** - Rôle via commande spécifique',
          inline: false
        }
      ]);

    await message.reply({ embeds: [embed] });
    return true;
  } catch (error) {
    console.error('Erreur configureRoleSystem:', error);
    return false;
  }
}

// ✅ EXPORT MANQUANT AJOUTÉ
export const roleAssignmentHelp = {
  name: '🎭 Attribution de Rôles',
  value: '`[prefix]role-config` — Configuration des systèmes de rôles\n`[prefix]create-rules` — Crée un message d\'acceptation du règlement\n`[prefix]test-reaction` — Crée un message de test pour les réactions'
};