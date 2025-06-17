// commandes/test.js - TEST DE TOUTES LES COMMANDES
import { EmbedBuilder, PermissionsBitField } from 'discord.js';
import { initializeDataStructure, getGuildSettings } from '../mongoManager.js';
import { moderationCommands } from './moderation.js';
import { musiqueCommandes } from './musique.js';
import { AutoFeaturesCommands } from './auto.js';
import { handleOthersCommand } from './autre.js';
import { distube } from '../index.js';

export async function testCommand(message, args, client) {
  try {
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return message.reply('❌ Seuls les administrateurs peuvent utiliser cette commande.');
    }

    const initialMsg = await message.reply('🧪 **Test exhaustif de toutes les commandes...**\n⏳ Cela peut prendre 10-15 secondes...');

   const guildSettings = await getGuildSettings(message.guild.id);
    const prefix = guildSettings?.prefix || '!';
    const testResults = [];
    let successCount = 0;
    let totalTests = 0;

    // Helper function pour tester une commande
    const testCommand = async (commandName, args, handler, category) => {
      totalTests++;
      try {
        const handled = await handler(commandName, message, args);
        if (handled) {
          testResults.push(`✅ **${category}** \`${prefix}${commandName}\` - Fonctionne`);
          successCount++;
        } else {
          testResults.push(`⚠️ **${category}** \`${prefix}${commandName}\` - Non trouvée`);
        }
      } catch (error) {
        testResults.push(`❌ **${category}** \`${prefix}${commandName}\` - ${error.message}`);
      }
    };

    // === TESTS DES COMMANDES AIDE/AUTRES ===
    
    await testCommand('help', [], handleOthersCommand, 'Aide');
    await testCommand('poll', ['Test?', 'Oui', 'Non'], handleOthersCommand, 'Sondage');
    await testCommand('closepoll', ['123'], handleOthersCommand, 'Sondage');
    await testCommand('setlangues', [], handleOthersCommand, 'Langues');

    // === TESTS AUTO-FEATURES ===
    
    await testCommand('createcommande', ['test'], AutoFeaturesCommands, 'Auto-Cmd');
    await testCommand('delcommande', ['test'], AutoFeaturesCommands, 'Auto-Cmd');
    await testCommand('listecommandes', [], AutoFeaturesCommands, 'Auto-Cmd');
    await testCommand('autorespond', ['test', 'réponse'], AutoFeaturesCommands, 'Auto-Rep');
    await testCommand('delrespond', ['1'], AutoFeaturesCommands, 'Auto-Rep');
    await testCommand('listrespond', [], AutoFeaturesCommands, 'Auto-Rep');
    await testCommand('addreact', ['test', '😀'], AutoFeaturesCommands, 'Auto-React');
    await testCommand('delreact', ['1'], AutoFeaturesCommands, 'Auto-React');
    await testCommand('listreact', [], AutoFeaturesCommands, 'Auto-React');

    // === TESTS MODÉRATION/SANCTION ===
    
    await testCommand('mute', [`<@${message.author.id}>`], moderationCommands, 'Mod-Sanction');
    await testCommand('unmute', [`<@${message.author.id}>`], moderationCommands, 'Mod-Sanction');
    await testCommand('tempmute', [`<@${message.author.id}`, '5m'], moderationCommands, 'Mod-Sanction');
    await testCommand('ban', [`<@${message.author.id}`, 'test'], moderationCommands, 'Mod-Sanction');
    await testCommand('listwarn', [`<@${message.author.id}>`], moderationCommands, 'Mod-Sanction');
    await testCommand('kick', [`<@${message.author.id}`, 'test'], moderationCommands, 'Mod-Sanction');
    await testCommand('unban', [message.author.id], moderationCommands, 'Mod-Sanction');
    await testCommand('warn', [`<@${message.author.id}`, 'test'], moderationCommands, 'Mod-Sanction');
    await testCommand('unwarn', [`<@${message.author.id}>`], moderationCommands, 'Mod-Sanction');

    // === TESTS MODÉRATION/GESTION ===
    
    await testCommand('clear', ['5'], moderationCommands, 'Mod-Gestion');
    await testCommand('lock', [], moderationCommands, 'Mod-Gestion');
    await testCommand('unlock', [], moderationCommands, 'Mod-Gestion');
    await testCommand('slowmode', ['5'], moderationCommands, 'Mod-Gestion');
    await testCommand('lockall', [], moderationCommands, 'Mod-Gestion');
    await testCommand('unlockall', [], moderationCommands, 'Mod-Gestion');


    // === TESTS MUSIQUE ===
    
    await testCommand('play', ['test song'], musiqueCommandes, 'Musique');
    await testCommand('playlist', ['test playlist'], musiqueCommandes, 'Musique');
    await testCommand('add', ['test song'], musiqueCommandes, 'Musique');
    await testCommand('skip', [], musiqueCommandes, 'Musique');
    await testCommand('stop', [], musiqueCommandes, 'Musique');
    await testCommand('pause', [], musiqueCommandes, 'Musique');
    await testCommand('resume', [], musiqueCommandes, 'Musique');
    await testCommand('queue', [], musiqueCommandes, 'Musique');
    await testCommand('volume', ['50'], musiqueCommandes, 'Musique');
    await testCommand('loop', [], musiqueCommandes, 'Musique');
    await testCommand('nowplaying', [], musiqueCommandes, 'Musique');

    // === TESTS DES JEUX (Slash Commands) ===
    
    totalTests++;
    try {
      const gameCommands = ['chifumi', 'morpion', 'puissance4', 'bingo', 'pendu', 'demineur', 'colormind'];
      const loadedGames = gameCommands.filter(game => client.commands.has(game));
      
      if (loadedGames.length === gameCommands.length) {
        testResults.push(`✅ **Jeux** Tous les ${gameCommands.length} jeux slash chargés`);
        successCount++;
      } else {
        testResults.push(`⚠️ **Jeux** ${loadedGames.length}/${gameCommands.length} jeux chargés`);
        testResults.push(`   → Manquants: ${gameCommands.filter(g => !client.commands.has(g)).join(', ')}`);
      }
    } catch (error) {
      testResults.push(`❌ **Jeux** - ${error.message}`);
    }

    // === TESTS SYSTÈME ===
    
    // Test DisTube
    totalTests++;
    try {
      if (distube && distube.client) {
        testResults.push(`✅ **Système** DisTube initialisé`);
        successCount++;
      } else {
        testResults.push(`❌ **Système** DisTube non disponible`);
      }
    } catch (error) {
      testResults.push(`❌ **Système** DisTube - ${error.message}`);
    }

    // Test Traduction
    totalTests++;
    try {
      const hasAPI = process.env.MICROSOFT_TRANSLATOR_KEY && process.env.MICROSOFT_TRANSLATOR_REGION;
      const hasSystems = guildSettings?.translationSystems?.length > 0;
      
      if (hasAPI && hasSystems) {
        testResults.push(`✅ **Système** Traduction complète (${hasSystems} systèmes)`);
        successCount++;
      } else if (hasAPI) {
        testResults.push(`⚠️ **Système** Traduction API OK, pas de systèmes`);
      } else {
        testResults.push(`⚠️ **Système** Traduction API manquante`);
      }
    } catch (error) {
      testResults.push(`❌ **Système** Traduction - ${error.message}`);
    }

    // Test Tickets
    totalTests++;
    try {
      const ticketCategory = guildSettings?.ticketCategoryID;
      if (ticketCategory) {
        const category = message.guild.channels.cache.get(ticketCategory);
        if (category) {
          testResults.push(`✅ **Système** Tickets configuré`);
          successCount++;
        } else {
          testResults.push(`⚠️ **Système** Tickets catégorie introuvable`);
        }
      } else {
        testResults.push(`⚠️ **Système** Tickets non configuré`);
      }
    } catch (error) {
      testResults.push(`❌ **Système** Tickets - ${error.message}`);
    }

    // Test Logs
    totalTests++;
    try {
      const logChannel = guildSettings?.logChannelID;
      const logEvents = guildSettings?.logEvents?.length || 0;
      
      if (logChannel && logEvents > 0) {
        const channel = message.guild.channels.cache.get(logChannel);
        if (channel) {
          testResults.push(`✅ **Système** Logs (${logEvents} événements)`);
          successCount++;
        } else {
          testResults.push(`⚠️ **Système** Logs canal introuvable`);
        }
      } else {
        testResults.push(`⚠️ **Système** Logs non configuré`);
      }
    } catch (error) {
      testResults.push(`❌ **Système** Logs - ${error.message}`);
    }

    // === RÉSULTATS FINAUX ===
    const successRate = Math.round((successCount / totalTests) * 100);
    let statusColor = '#FF0000';
    let statusEmoji = '❌';

    if (successRate >= 90) {
      statusColor = '#00FF00';
      statusEmoji = '✅';
    } else if (successRate >= 75) {
      statusColor = '#FFA500';
      statusEmoji = '⚠️';
    } else if (successRate >= 50) {
      statusColor = '#FF6B6B';
      statusEmoji = '🔸';
    }

    // Grouper les résultats par catégorie
    const categories = {};
    testResults.forEach(result => {
      const match = result.match(/\*\*(.*?)\*\*/);
      const category = match ? match[1] : 'Autre';
      if (!categories[category]) categories[category] = [];
      categories[category].push(result.replace(/\*\*(.*?)\*\* /, ''));
    });

    const embed = new EmbedBuilder()
      .setColor(statusColor)
      .setTitle('🧪 Test Exhaustif de Toutes les Commandes')
      .setDescription(`**Score Global:** ${successCount}/${totalTests} (${successRate}%) | **Préfixe:** \`${prefix}\``)
      .setTimestamp();

    // Ajouter chaque catégorie comme un field
    for (const [category, results] of Object.entries(categories)) {
      const value = results.slice(0, 10).join('\n') + (results.length > 10 ? `\n... et ${results.length - 10} autres` : '');
      embed.addFields([{
        name: `${statusEmoji} ${category}`,
        value: value || 'Aucun résultat',
        inline: false
      }]);
    }

    // Stats système
    embed.addFields([
      {
        name: '📊 Statistiques',
        value: [
          `**Serveurs:** ${client.guilds.cache.size}`,
          `**RAM:** ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`,
          `**Uptime:** ${Math.round(client.uptime / 1000 / 60)} min`,
          `**Activités:** 120 messages rotatifs`
        ].join('\n'),
        inline: true
      },
      {
        name: '⚙️ Configuration',
        value: [
          `**Logs:** ${guildSettings?.logEvents?.length || 0} événements`,
          `**Traduction:** ${guildSettings?.translationSystems?.length || 0} systèmes`,
          `**Dashboard:** Port ${process.env.PORT || 3000}`,
          `**Version:** Discord.js v14`
        ].join('\n'),
        inline: true
      }
    ]);

    await initialMsg.edit({ content: '', embeds: [embed] });

    // Résumé des problèmes
    const issues = testResults.filter(r => r.startsWith('❌') || r.startsWith('⚠️'));
    if (issues.length > 0) {
      const problemsEmbed = new EmbedBuilder()
        .setColor('#FF6B6B')
        .setTitle(`⚠️ ${issues.length} Problème(s) Détecté(s)`)
        .setDescription('**Commandes nécessitant votre attention :**')
        .addFields([
          {
            name: '🔍 Problèmes Majeurs (❌)',
            value: issues.filter(i => i.startsWith('❌')).slice(0, 8).join('\n') || 'Aucun',
            inline: false
          },
          {
            name: '⚠️ Avertissements',
            value: issues.filter(i => i.startsWith('⚠️')).slice(0, 8).join('\n') || 'Aucun',
            inline: false
          },
          {
            name: '💡 Suggestions',
            value: [
              `• Vérifiez les imports dans vos fichiers de commandes`,
              `• Testez manuellement : \`${prefix}clear 5\`, \`${prefix}ping\`, etc.`,
              `• Consultez les logs du bot pour plus de détails`,
              `• Assurez-vous que toutes les fonctions sont exportées`
            ].join('\n'),
            inline: false
          }
        ]);

      await message.reply({ embeds: [problemsEmbed] });
    } else {
      const successEmbed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('🎉 Félicitations !')
        .setDescription('**Toutes vos commandes fonctionnent parfaitement !**\n\nVotre bot est 100% opérationnel. 🚀')
        .addFields([
          {
            name: '✨ Fonctionnalités Actives',
            value: [
              '• Toutes les commandes de modération',
              '• Système de musique complet',
              '• Auto-réponses et réactions',
              '• 7 jeux interactifs',
              '• Système de traduction',
              '• Gestion des tickets'
            ].join('\n'),
            inline: false
          }
        ]);

      await message.reply({ embeds: [successEmbed] });
    }

    return true;

  } catch (error) {
    console.error('Erreur dans test command:', error);
    await message.reply(`❌ Erreur lors du test: ${error.message}`);
    return true;
  }
}

export const testHelp = {
  name: '🧪 Test Exhaustif',
  value: '`test` - Teste TOUTES les commandes du bot (40+ commandes)'
};