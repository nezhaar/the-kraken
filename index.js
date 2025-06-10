// index.js - VERSION COMPLÈTE ET CORRIGÉE AVEC DIAGNOSTIC MUSIQUE
// Chargement des variables d'environnement
import dotenv from "dotenv";
dotenv.config();

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const callbackUrl = process.env.CALLBACK_URL;

import fetch from 'node-fetch';
import { v4 as uuidv4 } from 'uuid';

if (!token || !clientId || !clientSecret || !callbackUrl) {
  console.error("❌ Erreur : Des variables d'environnement sont manquantes ! (DISCORD_TOKEN, CLIENT_ID, CLIENT_SECRET, CALLBACK_URL)");
  process.exit(1);
}

console.log("🔑 Token et identifiants chargés.");
console.log("Démarrage du bot...");

process.on('uncaughtException', (error) => console.error('Erreur non capturée:', error));
process.on('unhandledRejection', (reason, promise) => console.error('Rejet non géré:', reason, promise));

// === IMPORTS ESSENTIELS ===
import { DisTube } from 'distube';
import {
  GatewayIntentBits,
  Collection,
  PermissionsBitField,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  EmbedBuilder,
  ActivityType,
  Partials
} from "discord.js";
import { YtDlpPlugin } from '@distube/yt-dlp';
import express from 'express';
import expressLayouts from 'express-ejs-layouts';
import session from 'express-session';
import passport from 'passport';
import { Strategy } from 'passport-discord';
import path from 'path';
import { fileURLToPath } from 'url';
import { Client } from 'discord.js';

// === CONFIGURATION EXPRESS - PRIORITÉ ABSOLUE ===
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("🔧 Initialisation Express...");
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set('layout', 'layout');
app.use(expressLayouts);
app.use(session({
  secret: process.env.SESSION_SECRET || 'supersecretkey',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));
passport.use(new Strategy({
  clientID: clientId,
  clientSecret: clientSecret,
  callbackURL: callbackUrl,
  scope: ['identify', 'guilds']
}, (accessToken, refreshToken, profile, done) => process.nextTick(() => done(null, profile))));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

console.log("✅ Express configuré avec succès");

// === DÉMARRAGE IMMÉDIAT DU SERVEUR EXPRESS ===
const PORT = process.env.PORT || 3000;
console.log(`🚀 Démarrage du serveur Express sur le port ${PORT}...`);

app.listen(PORT, () => {
  console.log(`🚀 Serveur Express démarré sur http://localhost:${PORT}`);
});

console.log("✅ Serveur Express lancé");

// === CLIENT DISCORD ===
export const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildModeration
  ],
  partials: [
    Partials.Channel,
    Partials.Message,
    Partials.Reaction,
    Partials.User,
    Partials.GuildMember
  ]
});

// === IMPORTS DES MODULES ===
import {
  initializeDataStructure,
  getGuildSettings,
  saveGuildSettings,
  createBackup,
  cleanupOldBackups
} from './mongoManager.js';
import { musiqueCommandes, musiqueHelp, setupMusique } from './commandes/musique.js';
import { moderationCommands, moderationHelp } from './commandes/moderation.js';
import { AutoFeaturesCommands, AutoReactsAndReplies, autoHelp } from './commandes/auto.js';
import {
  handleOthersCommand,
  handleButtonInteraction as handleOtherButtonInteraction,
  helpFields
} from './commandes/autre.js';
import { ticketCommand } from './commandes/ticket.js';
import { testCommand, testHelp } from './commandes/test.js';
import { handleRoleAssignment, createRuleAcceptanceMessage, configureRoleSystem, roleAssignmentHelp } from './commandes/roleAssignment.js';

// Modules de Logs d'événements
import { messageDeleteLog } from './events/messageDelete.js';
import { messageUpdateLog } from './events/messageUpdate.js';
import { channelCreateLog } from './events/channelCreate.js';
import { channelDeleteLog } from './events/channelDelete.js';
import { channelUpdateLog } from './events/channelUpdate.js';
import { roleCreateLog } from './events/roleCreate.js';
import { roleDeleteLog } from './events/roleDelete.js';
import { roleUpdateLog } from './events/roleUpdate.js';

// Traduction
import {
  handleMessageTranslation,
  supportedLanguagesMap
} from './fonction/traduction.js';
import { LANGUE_CODES, LANGUE_CODES_ARRAY } from './config.js';

// Jeux
import {
  data as chifumiData,
  execute as chifumiExecute,
  handleChifumiComponent
} from './commandes/jeux/chifumi.js';
import {
  data as morpionData,
  execute as morpionExecute,
  handleMorpionComponent
} from './commandes/jeux/morpion.js';
import {
  data as p4Data,
  execute as p4Execute,
  handleP4Component
} from './commandes/jeux/puissance4.js';
import {
  data as bingoData,
  execute as bingoExecute
} from './commandes/jeux/bingo.js';
import {
  data as penduData,
  execute as penduExecute,
  handlePenduComponent
} from './commandes/jeux/pendu.js';
import {
  data as demineurData,
  execute as demineurExecute,
  handleDemineurComponent
} from './commandes/jeux/demineur.js';
import {
  data as colormindData,
  execute as colormindExecute,
  handleColormindComponent
} from './commandes/jeux/colormind.js';

// === FONCTIONS HELPER ===
function buildReglementFromForm(body) {
  return {
    enabled: body.reglementEnabled === 'on',
    title: body.reglementTitle || 'Règlement du Serveur',
    description: body.reglementDescription || 'Veuillez lire et accepter notre règlement pour accéder au serveur.',
    color: body.reglementColor || '#7289DA',
    sections: getDefaultReglementSections(),
    footerText: body.footerText || 'En acceptant, vous obtiendrez automatiquement vos rôles d\'accès',
    showThumbnail: body.showThumbnail === 'on',
    showTimestamp: body.showTimestamp === 'on',
    acceptButtonText: body.acceptButtonText || '✅ J\'accepte le règlement',
    declineButtonText: body.declineButtonText || '❌ Je refuse',
    acceptButtonEmoji: body.acceptButtonEmoji || '📋',
    declineButtonEmoji: body.declineButtonEmoji || '🚫'
  };
}

function getDefaultReglementSections() {
  return [
    {
      name: 'Règles Générales',
      value: '• Respectez tous les membres\n• Pas de spam ou contenu inapproprié\n• Utilisez les bons salons\n• Suivez les instructions des modérateurs',
      inline: false
    }
  ];
}

function getDefaultReglementConfig() {
  return {
    enabled: false,
    title: 'Règlement du Serveur',
    description: 'Veuillez lire et accepter notre règlement pour accéder au serveur.',
    color: '#7289DA',
    sections: getDefaultReglementSections(),
    footerText: 'En acceptant, vous obtiendrez automatiquement vos rôles d\'accès',
    showThumbnail: true,
    showTimestamp: true,
    acceptButtonText: '✅ J\'accepte le règlement',
    declineButtonText: '❌ Je refuse',
    acceptButtonEmoji: '📋',
    declineButtonEmoji: '🚫'
  };
}

// === DISTUBE ET MUSIQUE ===
export const distube = new DisTube(client, {
  plugins: [new YtDlpPlugin({ update: true })],
  emitAddListWhenCreatingQueue: true,
  emitNewSongOnly: true,
});
setupMusique(distube);

client.commands = new Collection();

// === HELPER POUR LES JEUX ===
const jeuxHelp = {
  name: '🎮 Jeux',
  value: '`chifumi [@utilisateur]` - Pierre-feuille-ciseaux\n' +
         '`morpion [@utilisateur]` - Tic-tac-toe\n' +
         '`puissance4 [@utilisateur]` - Puissance 4\n' +
         '`bingo` - Jeu de bingo\n' +
         '`pendu [@utilisateur]` - Jeu du pendu\n' +
         '`demineur` - Démineur\n' +
         '`colormind` - Jeu de couleurs'
};

// === API DE TRADUCTION ===
async function votreApiDeTraductionReelle(text, sourceLang, targetLang) {
  console.log(`[DEBUG API] Appel de votreApiDeTraductionReelle avec : text='${text.substring(0,50)}...', sourceLang='${sourceLang}', targetLang='${targetLang}'`);
  const apiKey = process.env.MICROSOFT_TRANSLATOR_KEY;
  const region = process.env.MICROSOFT_TRANSLATOR_REGION;
  console.log(`[DEBUG API] Clé API: ${apiKey ? 'Présente' : 'MANQUANTE!'}, Région: ${region || 'MANQUANTE!'}`);

  if (!apiKey || !region) {
    console.error("[Traduction API Erreur] Clé ou région Microsoft Translator non configurée.");
    return null;
  }
  const endpoint = `https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&from=${sourceLang}&to=${targetLang}`;
  console.log(`[DEBUG API] Endpoint: ${endpoint}`);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': apiKey,
        'Ocp-Apim-Subscription-Region': region,
        'Content-type': 'application/json',
        'X-ClientTraceId': uuidv4().toString()
      },
      body: JSON.stringify([{ 'Text': text }])
    });
    console.log(`[DEBUG API] Statut réponse Microsoft API: ${response.status}`);
    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`[DEBUG API Microsoft Erreur Statut] ${response.status}: ${errorBody}`);
      return null;
    }
    const data = await response.json();
    console.log('[DEBUG API] Données brutes de Microsoft API:', JSON.stringify(data, null, 2));
    if (
      data &&
      Array.isArray(data) &&
      data.length > 0 &&
      data[0].translations &&
      Array.isArray(data[0].translations) &&
      data[0].translations.length > 0
    ) {
      const translatedText = data[0].translations[0].text;
      console.log(`[DEBUG API Microsoft] Succès, texte traduit: "${translatedText.substring(0,50)}..."`);
      return translatedText;
    } else {
      console.error("[Traduction API Microsoft Erreur] Réponse invalide:", data);
      return null;
    }
  } catch (error) {
    console.error("[Traduction API Microsoft Erreur Fetch]", error);
    return null;
  }
}

// === NETTOYAGE PÉRIODIQUE ===
setInterval(async () => {
  try {
    await cleanupOldBackups();
    console.log('🧹 Nettoyage automatique des sauvegardes effectué');
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage automatique:', error);
  }
}, 60 * 60 * 1000); // Toutes les heures

// === INITIALISATION BOT ===
async function initializeBot() {
  try {
    console.log('🚀 Initialisation des données...');
    await initializeDataStructure();
    await createBackup();
    await cleanupOldBackups();
    console.log('✅ Initialisation terminée.');
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
    process.exit(1);
  }
}

// === CONNEXION DISCORD ===
client.login(token).catch(err => console.error('Erreur de connexion avec le token :', err));

client.once('ready', async () => {
  console.log(`🤖 Bot connecté en tant que ${client.user.tag}`);
  
  // === DIAGNOSTIC AUDIO AUTOMATIQUE ===
  console.log('='.repeat(60));
  console.log('🔧 DIAGNOSTIC AUDIO AUTOMATIQUE - FLY.IO');
  console.log('='.repeat(60));
  
  // Test FFmpeg
  try {
    const { exec } = await import('child_process');
    exec('ffmpeg -version', (error, stdout, stderr) => {
      if (error) {
        console.error('❌ CRITIQUE: FFmpeg NON DISPONIBLE:', error.message);
        console.error('   → La musique ne fonctionnera PAS sans FFmpeg');
      } else {
        const version = stdout.split('\n')[0];
        console.log('✅ FFmpeg OK:', version);
      }
    });
  } catch (error) {
    console.error('❌ ERREUR test FFmpeg:', error.message);
  }

  // Test yt-dlp
  try {
    const { exec } = await import('child_process');
    exec('yt-dlp --version', (error, stdout, stderr) => {
      if (error) {
        console.error('❌ CRITIQUE: yt-dlp NON DISPONIBLE:', error.message);
        console.error('   → YouTube ne fonctionnera PAS sans yt-dlp');
      } else {
        console.log('✅ yt-dlp OK: v' + stdout.trim());
      }
    });
  } catch (error) {
    console.error('❌ ERREUR test yt-dlp:', error.message);
  }

  // Test DisTube
  if (typeof distube !== 'undefined' && distube) {
    console.log('✅ DisTube OK: Initialisé correctement');
    console.log(`📊 Plugins DisTube: ${distube.options.plugins?.length || 0}`);
    
    const events = ['playSong', 'addSong', 'addList', 'finish', 'error'];
    events.forEach(event => {
      const listenerCount = distube.listenerCount(event);
      console.log(`🎵 Event "${event}": ${listenerCount} listener(s)`);
    });
  } else {
    console.error('❌ CRITIQUE: DisTube NON INITIALISÉ');
  }

  // Test mémoire et ressources
  const memUsage = process.memoryUsage();
  console.log(`💾 Mémoire utilisée: ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`);
  console.log(`🖥️  Plateforme: ${process.platform}`);
  console.log(`📂 Répertoire de travail: ${process.cwd()}`);
  
  console.log(`🔑 FFMPEG_PATH: ${process.env.FFMPEG_PATH || 'Non défini'}`);
  console.log(`🔑 NODE_ENV: ${process.env.NODE_ENV || 'Non défini'}`);
  
  console.log('='.repeat(60));
  
  // Messages rotatifs
  const activities = [
    'concurrencer MEE6',
    'surpasser MEE6', 
    'défier MEE6',
    'être meilleur que MEE6',
    'dominer Discord',
    '.help pour découvrir',
    'révolutionner les serveurs',
    'remplacer MEE6'
  ];
  
  let currentIndex = 0;
  
  client.user.setActivity(activities[0], { type: ActivityType.Playing });
  console.log(`🎮 Activité initiale: ${activities[0]}`);
  
  setInterval(() => {
    currentIndex = (currentIndex + 1) % activities.length;
    client.user.setActivity(activities[currentIndex], { type: ActivityType.Playing });
    console.log(`🔄 Nouvelle activité: ${activities[currentIndex]}`);
  }, 30000);
  
  await initializeBot();

  // Enregistrement des Slash Commands
  const commandsToRegister = [
    ticketCommand.data.toJSON(),
    chifumiData.toJSON(),
    morpionData.toJSON(),
    p4Data.toJSON(),
    bingoData.toJSON(),
    penduData.toJSON(),
    demineurData.toJSON(),
    colormindData.toJSON()
  ];

  try {
    await client.application.commands.set(commandsToRegister);
    console.log('✅ Slash commands enregistrées globalement.');
  } catch (error) {
    console.error('❌ Erreur lors de l\'enregistrement des Slash Commands:', error);
  }

  // Stockage des handlers en mémoire
  client.commands.set(ticketCommand.data.name, ticketCommand);
  client.commands.set(chifumiData.name, { execute: chifumiExecute });
  client.commands.set(morpionData.name, { execute: morpionExecute });
  client.commands.set(p4Data.name, { execute: p4Execute });
  client.commands.set(bingoData.name, { execute: bingoExecute });
  client.commands.set(penduData.name, { execute: penduExecute });
  client.commands.set(demineurData.name, { execute: demineurExecute });
  client.commands.set(colormindData.name, { execute: colormindExecute });

  console.log('🔧 Handlers de commandes "jeux" chargés en mémoire.');
});

// === GESTIONNAIRE D'INTERACTIONS ===
client.on('interactionCreate', async interaction => {
  console.log(`[DEBUG INT] Interaction reçue : ${interaction.type} dans le serveur ${interaction.guild ? interaction.guild.name : 'DM'} (ID: ${interaction.guild ? interaction.guild.id : 'DM'})`);
  if (!interaction.guild) return;

  try {
    if (interaction.isCommand()) {
      const name = interaction.commandName;

      if (name === ticketCommand.data.name) {
        return ticketCommand.execute(interaction);
      }
      if (name === chifumiData.name) {
        return chifumiExecute(interaction);
      }
      if (name === morpionData.name) {
        return morpionExecute(interaction);
      }
      if (name === p4Data.name) {
        return p4Execute(interaction);
      }
      if (name === bingoData.name) {
        return bingoExecute(interaction);
      }
      if (name === penduData.name) {
        return penduExecute(interaction);
      }
      if (name === demineurData.name) {
        return demineurExecute(interaction);
      }
      if (name === colormindData.name) {
        return colormindExecute(interaction);
      }
      return;
    }

    if (interaction.isButton()) {
      const customId = interaction.customId;
      const guildSettings = await getGuildSettings(interaction.guild.id);
      console.log(`[DEBUG BTN] Interaction de bouton reçue : ${customId} dans le serveur ${interaction.guild.name} (ID: ${interaction.guild.id})`);

      // Ticket buttons
      if (customId === 'open_ticket') {
        const ticketCategoryID = guildSettings.ticketCategoryID;
        const ticketSupportRoles = guildSettings.ticketSupportRoles || [];

        if (!ticketCategoryID) {
          return interaction.reply({ content: '❌ Le système de tickets n\'est pas configuré correctement.', ephemeral: true });
        }
        const category = interaction.guild.channels.cache.get(ticketCategoryID);
        if (!category || category.type !== ChannelType.GuildCategory) {
          return interaction.reply({ content: '❌ La catégorie de tickets est introuvable.', ephemeral: true });
        }

        const existingTicket = interaction.guild.channels.cache.find(ch =>
          ch.name === `ticket-${interaction.user.username.toLowerCase()}` ||
          ch.topic?.includes(interaction.user.id)
        );
        if (existingTicket) {
          return interaction.reply({ content: `❌ Vous avez déjà un ticket ouvert : ${existingTicket}`, ephemeral: true });
        }

        try {
          const ticketChannel = await interaction.guild.channels.create({
            name: `ticket-${interaction.user.username}`,
            type: ChannelType.GuildText,
            parent: category,
            topic: `Ticket ouvert par ${interaction.user.tag} (${interaction.user.id})`,
            permissionOverwrites: [
              { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
              {
                id: interaction.user.id,
                allow: [
                  PermissionsBitField.Flags.ViewChannel,
                  PermissionsBitField.Flags.SendMessages,
                  PermissionsBitField.Flags.ReadMessageHistory
                ],
              },
              ...ticketSupportRoles.map(roleId => ({
                id: roleId,
                allow: [
                  PermissionsBitField.Flags.ViewChannel,
                  PermissionsBitField.Flags.SendMessages,
                  PermissionsBitField.Flags.ReadMessageHistory
                ],
              }))
            ],
          });

          const embed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle('🎫 Ticket Support')
            .setDescription(`Bonjour ${interaction.user}, merci d'avoir ouvert un ticket.\nUn membre de l'équipe va vous répondre dans les plus brefs délais.`)
            .setTimestamp();

          const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId('close_ticket')
              .setLabel('Fermer le ticket')
              .setStyle(ButtonStyle.Danger)
              .setEmoji('🔒')
          );

          await ticketChannel.send({
            content: `${interaction.user}`,
            embeds: [embed],
            components: [row]
          });

          await interaction.reply({
            content: `✅ Votre ticket a été créé : ${ticketChannel}`,
            ephemeral: true
          });
        } catch (error) {
          console.error('Erreur lors de la création du ticket:', error);
          return interaction.reply({ content: '❌ Une erreur est survenue lors de la création du ticket.', ephemeral: true });
        }
        return;
      }

      if (customId === 'close_ticket') {
        if (!interaction.channel.name.startsWith('ticket-')) {
          return interaction.reply({ content: '❌ Cette commande ne peut être utilisée que dans un salon de ticket.', ephemeral: true });
        }
        const embed = new EmbedBuilder()
          .setColor(0xff0000)
          .setTitle('🔒 Fermeture du ticket')
          .setDescription('Ce ticket sera fermé dans 5 secondes...')
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });
        setTimeout(async () => {
          try {
            await interaction.channel.delete();
          } catch (error) {
            console.error('Erreur lors de la suppression du ticket:', error);
          }
        }, 5000);
        return;
      }

      // Boutons d'acceptation des règles
      if (customId === 'accept_rules') {
        await handleRoleAssignment('button_click', {
          guild: interaction.guild,
          user: interaction.user,
          member: interaction.member,
          buttonId: 'accept_rules'
        }, client);

        await interaction.reply({
          content: '✅ Merci d\'avoir accepté le règlement ! Vos rôles ont été mis à jour.',
          ephemeral: true
        });
        return;
      }

      if (customId === 'decline_rules') {
        await interaction.reply({
          content: '❌ Vous devez accepter le règlement pour accéder au serveur.',
          ephemeral: true
        });
        return;
      }

      // Jeux
      if (customId.startsWith('chifumi_')) {
        return handleChifumiComponent(interaction);
      }
      if (customId.startsWith('morpion_')) {
        return handleMorpionComponent(interaction);
      }
      if (customId.startsWith('p4_')) {
        return handleP4Component(interaction);
      }
      if (customId.startsWith('pendu_')) {
        return handlePenduComponent(interaction);
      }
      if (customId.startsWith('demineur_')) {
        return handleDemineurComponent(interaction);
      }
      if (customId.startsWith('colormind_')) {
        return handleColormindComponent(interaction);
      }

      return handleOtherButtonInteraction(interaction);
    }
  } catch (error) {
    console.error('Erreur dans interactionCreate :', error);
    if (!interaction.replied) {
      await interaction.reply({ content: 'Une erreur est survenue lors du traitement de votre interaction !', ephemeral: true });
    }
  }
});

// === FONCTION D'AUTHENTIFICATION ===
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  if (req.method === 'POST') {
    return res.status(401).send(`<!DOCTYPE html><html><head><title>Non autorisé</title></head><body><h1>401 - Non autorisé</h1><p>Vous devez être connecté pour accéder à cette ressource.</p></body></html>`);
  }
  res.redirect('/login');
}

// === GESTIONNAIRE DE MESSAGES ===
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (!message.guild) return;

  console.log(`[DEBUG MSG] Nouveau message de ${message.author.tag} dans #${message.channel.name} (ID: ${message.channel.id}), Contenu: "${message.content.substring(0,100)}"`);

  try {
    const guildSettings = await getGuildSettings(message.guild.id);
    console.log('[DEBUG MSG] Guild Settings récupérés:', JSON.stringify(guildSettings, null, 2));

    // Logique de traduction
    if (guildSettings && Array.isArray(guildSettings.translationSystems) && guildSettings.translationSystems.length > 0) {
      console.log('[DEBUG MSG] guildSettings.translationSystems trouvé:', JSON.stringify(guildSettings.translationSystems));
      for (const system of guildSettings.translationSystems) {
        if (system && system.channels && typeof system.channels === 'object' && Object.keys(system.channels).length > 0) {
          let sourceLangForCurrentSystem = null;
          let messageIsInThisSystem = false;
          for (const langCode in system.channels) {
            if (Object.prototype.hasOwnProperty.call(system.channels, langCode)) {
              if (system.channels[langCode] === message.channel.id) {
                sourceLangForCurrentSystem = langCode;
                messageIsInThisSystem = true;
                break;
              }
            }
          }
          if (messageIsInThisSystem) {
            console.log(`[DEBUG MSG] Message de "${system.name || system.id}", salon source langue: ${sourceLangForCurrentSystem}.`);
            const activeSystemChannelsConfig = {};
            for (const langCode_targets in system.channels) {
              if (Object.prototype.hasOwnProperty.call(system.channels, langCode_targets)) {
                const channelId = system.channels[langCode_targets];
                if (channelId && supportedLanguagesMap[langCode_targets]) {
                  activeSystemChannelsConfig[channelId] = {
                    name: supportedLanguagesMap[langCode_targets].name,
                    lang: langCode_targets
                  };
                }
              }
            }
            console.log('[DEBUG MSG] activeSystemChannelsConfig pour CE système:', JSON.stringify(activeSystemChannelsConfig, null, 2));
            if (Object.keys(activeSystemChannelsConfig).length > 0) {
              console.log('[DEBUG MSG] Appel à handleMessageTranslation pour ce système...');
              await handleMessageTranslation(message, client, activeSystemChannelsConfig, votreApiDeTraductionReelle);
            }
            break;
          }
        }
      }
    } else {
      console.log('[DEBUG MSG] Aucun guildSettings.translationSystems trouvé ou tableau vides.');
    }

    const prefix = (guildSettings && guildSettings.prefix) ? guildSettings.prefix : '!';

    // Auto-réactions et réponses AVANT la vérification du préfixe
    try {
      await AutoReactsAndReplies(message);
    } catch (error) {
      console.error('Erreur AutoReactsAndReplies:', error);
    }

    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    // === GESTION DES COMMANDES ===

    // HELP
    if (commandName === 'help') {
      try {
        const embed = new EmbedBuilder()
          .setColor('#7289DA')
          .setTitle('📋 Liste des commandes')
          .setDescription('Voici toutes les commandes disponibles :')
          .addFields([
            ...helpFields,
            autoHelp,
            musiqueHelp,
            ...moderationHelp,
            testHelp,
            jeuxHelp,
            roleAssignmentHelp,
          ])
          .setFooter({ text: `Préfixe actuel : ${prefix}` })
          .setTimestamp();

        await message.reply({ embeds: [embed] });
      } catch (error) {
        console.error('Erreur dans la commande help:', error);
        await message.reply('❌ Une erreur est survenue lors de l\'affichage de l\'aide.');
      }
      return;
    }

    // DIAGNOSTIC AUDIO COMPLET
    if (commandName === 'test-audio') {
      try {
        if (!message.member.permissions.has('Administrator')) {
          await message.reply('❌ Seuls les administrateurs peuvent utiliser cette commande.');
          return;
        }

        await message.reply('🔧 **Diagnostic audio en cours...**');

        const embed = new EmbedBuilder()
          .setColor('#e74c3c')
          .setTitle('🔧 Diagnostic Audio Complet - Fly.io')
          .setDescription('Vérification de tous les composants audio...');

        let diagnostics = [];
        const { exec } = await import('child_process');

        // Test FFmpeg avec timeout
        await new Promise((resolve) => {
          exec('ffmpeg -version', { timeout: 5000 }, (error, stdout, stderr) => {
            if (error) {
              diagnostics.push(`❌ **FFmpeg:** ${error.message}`);
              diagnostics.push(`   ⚠️ **CRITIQUE:** La musique ne peut pas fonctionner`);
            } else {
              const version = stdout.split('\n')[0];
              diagnostics.push(`✅ **FFmpeg:** ${version}`);
            }
            resolve();
          });
        });

        // Test yt-dlp avec timeout
        await new Promise((resolve) => {
          exec('yt-dlp --version', { timeout: 5000 }, (error, stdout, stderr) => {
            if (error) {
              diagnostics.push(`❌ **yt-dlp:** ${error.message}`);
              diagnostics.push(`   ⚠️ **CRITIQUE:** YouTube ne peut pas fonctionner`);
            } else {
              diagnostics.push(`✅ **yt-dlp:** v${stdout.trim()}`);
            }
            resolve();
          });
        });

        // Test DisTube
        if (typeof distube !== 'undefined' && distube) {
          diagnostics.push('✅ **DisTube:** Initialisé correctement');
          diagnostics.push(`📊 **Plugins:** ${distube.options.plugins?.length || 0}`);
          
          const events = ['playSong', 'addSong', 'error'];
          const eventStatus = events.map(event => 
            `${event}: ${distube.listenerCount(event)} listener(s)`
          ).join(', ');
          diagnostics.push(`🎵 **Événements:** ${eventStatus}`);
        } else {
          diagnostics.push('❌ **DisTube:** Non initialisé');
          diagnostics.push('   ⚠️ **CRITIQUE:** Le système de musique ne fonctionne pas');
        }

        // Test mémoire et ressources
        const memUsage = process.memoryUsage();
        diagnostics.push(`💾 **Mémoire:** ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB utilisés`);
        diagnostics.push(`🖥️ **Plateforme:** ${process.platform}`);

        // Test utilisateur
        if (message.member.voice?.channel) {
          diagnostics.push(`🎤 **Utilisateur:** Connecté à "${message.member.voice.channel.name}"`);
        } else {
          diagnostics.push('❌ **Utilisateur:** Non connecté à un canal vocal');
          diagnostics.push('   ℹ️ Connectez-vous pour tester la musique');
        }

        // Test permissions bot
        if (message.member.voice?.channel) {
          const channel = message.member.voice.channel;
          const permissions = channel.permissionsFor(message.guild.members.me);
          
          if (permissions.has(PermissionsBitField.Flags.Connect)) {
            diagnostics.push('✅ **Permissions:** Bot peut se connecter');
          } else {
            diagnostics.push('❌ **Permissions:** Bot ne peut pas se connecter');
          }
          
          if (permissions.has(PermissionsBitField.Flags.Speak)) {
            diagnostics.push('✅ **Permissions:** Bot peut parler');
          } else {
            diagnostics.push('❌ **Permissions:** Bot ne peut pas parler');
          }
        }

        embed.setDescription(diagnostics.join('\n'));
        
        // Ajouter un résumé
        const hasFFmpeg = !diagnostics.some(d => d.includes('❌ **FFmpeg:**'));
        const hasYtDlp = !diagnostics.some(d => d.includes('❌ **yt-dlp:**'));
        const hasDistube = !diagnostics.some(d => d.includes('❌ **DisTube:**'));
        
        if (hasFFmpeg && hasYtDlp && hasDistube) {
          embed.setColor('#2ecc71');
          embed.addFields([{
            name: '✅ Résumé',
            value: 'Tous les composants sont OK ! La musique devrait fonctionner.',
            inline: false
          }]);
        } else {
          embed.addFields([{
            name: '❌ Résumé',
            value: 'Des composants critiques sont manquants. Consultez le Dockerfile et redéployez.',
            inline: false
          }]);
        }

        await message.channel.send({ embeds: [embed] });

      } catch (error) {
        console.error('Erreur test-audio:', error);
        await message.reply(`❌ **Erreur lors du diagnostic:** ${error.message}`);
      }
      return;
    }

    // TEST DE LECTURE SIMPLE
    if (commandName === 'test-play') {
      try {
        if (!message.member.voice?.channel) {
          return message.reply('❌ **Connectez-vous d\'abord à un canal vocal !**');
        }

        await message.reply('🎵 **Test de lecture en cours...**');

        const testUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
        
        console.log(`[TEST MUSIC] Tentative de lecture: ${testUrl}`);
        console.log(`[TEST MUSIC] Canal vocal: ${message.member.voice.channel.name}`);
        console.log(`[TEST MUSIC] Canal texte: ${message.channel.name}`);

        try {
          await distube.play(message.member.voice.channel, testUrl, {
            member: message.member,
            textChannel: message.channel
          });
          
          console.log(`[TEST MUSIC] ✅ Commande play exécutée avec succès`);
          
          setTimeout(() => {
            message.channel.send('✅ **Test lancé !** Si vous n\'entendez rien, vérifiez les logs avec `!test-audio`');
          }, 2000);
          
        } catch (playError) {
          console.error('[TEST MUSIC] ❌ Erreur play:', playError);
          console.error('[TEST MUSIC] Stack:', playError.stack);
          
          let errorMsg = '❌ **Erreur de lecture:**\n';
          
          if (playError.message.includes('ffmpeg')) {
            errorMsg += '🔧 **FFmpeg manquant** - Redéployez avec le nouveau Dockerfile';
          } else if (playError.message.includes('ytdl') || playError.message.includes('yt-dlp')) {
            errorMsg += '🔧 **yt-dlp manquant** - Redéployez avec le nouveau Dockerfile';
          } else if (playError.message.includes('permissions')) {
            errorMsg += '🔧 **Permissions manquantes** - Vérifiez les permissions du bot';
          } else {
            errorMsg += `🔧 **Erreur:** ${playError.message}`;
          }
          
          await message.reply(errorMsg);
        }

      } catch (error) {
        console.error('Erreur test-play:', error);
        await message.reply(`❌ **Erreur test:** ${error.message}`);
      }
      return;
    }

    // COMMANDES DE JEUX
    if (commandName === 'chifumi') {
      try {
        await chifumiExecute({
          guild: message.guild,
          user: message.author,
          reply: (payload) => message.reply(payload),
          options: { getUser: () => message.mentions.users.first() || null }
        });
      } catch (e) {
        console.error('Erreur chifumi préfixe :', e);
        message.reply('❌ Problème dans /chifumi.');
      }
      return;
    }

    if (commandName === 'morpion') {
      try {
        await morpionExecute({
          guild: message.guild,
          user: message.author,
          reply: (payload) => message.reply(payload),
          options: { getUser: () => message.mentions.users.first() || null }
        });
      } catch (e) {
        console.error('Erreur morpion préfixe :', e);
        message.reply('❌ Problème dans /morpion.');
      }
      return;
    }

    if (commandName === 'puissance4') {
      try {
        await p4Execute({
          guild: message.guild,
          user: message.author,
          reply: (payload) => message.reply(payload),
          options: { getUser: () => message.mentions.users.first() || null }
        });
      } catch (e) {
        console.error('Erreur puissance4 préfixe :', e);
        message.reply('❌ Problème dans /puissance4.');
      }
      return;
    }

    if (commandName === 'bingo') {
      try {
        await bingoExecute({
          guild: message.guild,
          user: message.author,
          reply: (payload) => message.reply(payload)
        });
      } catch (e) {
        console.error('Erreur bingo préfixe :', e);
        message.reply('❌ Problème dans /bingo.');
      }
      return;
    }

    if (commandName === 'pendu') {
      try {
        await penduExecute({
          guild: message.guild,
          user: message.author,
          reply: (payload) => message.reply(payload),
          options: { getUser: () => message.mentions.users.first() || null }
        });
      } catch (e) {
        console.error('Erreur pendu préfixe :', e);
        message.reply('❌ Problème dans /pendu.');
      }
      return;
    }

    if (commandName === 'demineur') {
      try {
        await demineurExecute({
          guild: message.guild,
          user: message.author,
          reply: (payload) => message.reply(payload)
        });
      } catch (e) {
        console.error('Erreur demineur préfixe :', e);
        message.reply('❌ Problème dans /demineur.');
      }
      return;
    }

    if (commandName === 'colormind') {
      try {
        await colormindExecute({
          guild: message.guild,
          user: message.author,
          reply: (payload) => message.reply(payload)
        });
      } catch (e) {
        console.error('Erreur colormind préfixe :', e);
        message.reply('❌ Problème dans /colormind.');
      }
      return;
    }

    // COMMANDE TEST
    if (commandName === 'test') {
      const handled = await testCommand(message, args, client);
      if (handled) return;
    }

    // Attribution de rôles
    if (commandName === 'role-config') {
      const handled = await configureRoleSystem(message, args);
      if (handled) return;
    }

    if (commandName === 'create-rules') {
      const handled = await createRuleAcceptanceMessage(message, args);
      if (handled) return;
    }

    // Autres commandes
    let handled = false;
    handled = await AutoFeaturesCommands(commandName, message, args, prefix);
    if (handled) return;

    handled = await moderationCommands(commandName, message, args);
    if (handled) return;

    handled = await handleOthersCommand(commandName, message, args);
    if (handled) return;

    handled = await musiqueCommandes(commandName, message, args);
    if (handled) return;

    // Commande non reconnue
    await message.reply({ content: `❌ Commande "${commandName}" non reconnue. Tape \`${prefix}help\` pour voir la liste.` });
  } catch (error) {
    console.error('Erreur globale dans messageCreate:', error);
  }
});

// === GESTIONNAIRE DE RÉACTIONS ===
client.on('messageReactionAdd', async (reaction, user) => {
  console.log(`[DEBUG REACTION] Réaction ajoutée par ${user.tag} : ${reaction.emoji.name || reaction.emoji.id} sur le message ${reaction.message.id}`);
  
  if (user.bot) return;
  
  try {
    if (reaction.partial) {
      try {
        console.log('[DEBUG REACTION] Récupération de la réaction partielle...');
        await reaction.fetch();
        console.log('[DEBUG REACTION] Réaction récupérée avec succès');
      } catch (error) {
        console.error('Erreur lors de la récupération de la réaction:', error);
        return;
      }
    }

    if (!reaction.message.guild) {
      console.log('[DEBUG REACTION] Réaction en DM, ignorée');
      return;
    }

    const guild = reaction.message.guild;
    
    let member;
    try {
      member = await guild.members.fetch(user.id);
    } catch (error) {
      console.error(`Erreur lors de la récupération du membre ${user.id}:`, error);
      return;
    }
    
    if (!member) {
      console.log(`[DEBUG REACTION] Membre ${user.id} non trouvé`);
      return;
    }

    console.log(`[DEBUG REACTION] Réaction traitée: ${user.tag} - ${reaction.emoji.name || reaction.emoji.id} - Message: ${reaction.message.id}`);

    let emojiIdentifier = reaction.emoji.name;
    if (reaction.emoji.id) {
      emojiIdentifier = reaction.emoji.id;
    } else if (!emojiIdentifier) {
      emojiIdentifier = reaction.emoji.toString();
    }

    console.log(`[DEBUG REACTION] Emoji normalisé: '${emojiIdentifier}'`);

    await handleRoleAssignment('reaction_add', {
      guild: guild,
      user: user,
      member: member,
      messageId: reaction.message.id,
      emoji: emojiIdentifier
    }, client);

  } catch (error) {
    console.error('Erreur dans messageReactionAdd:', error);
    console.error('Stack trace:', error.stack);
  }
});

// Gestionnaire de suppression de réaction
client.on('messageReactionRemove', async (reaction, user) => {
  if (user.bot) return;
  
  try {
    if (reaction.partial) {
      try {
        await reaction.fetch();
      } catch (error) {
        console.error('Erreur lors de la récupération de la réaction supprimée:', error);
        return;
      }
    }

    if (!reaction.message.guild) return;

    const guild = reaction.message.guild;
    const member = await guild.members.fetch(user.id).catch(() => null);
    
    if (!member) return;

    console.log(`[DEBUG REACTION REMOVE] Réaction supprimée par ${user.tag} : ${reaction.emoji.name || reaction.emoji.id} sur le message ${reaction.message.id}`);

  } catch (error) {
    console.error('Erreur dans messageReactionRemove:', error);
  }
});

// === LISTENERS D'ÉVÉNEMENTS ===
client.on(messageDeleteLog.name, (...args) => messageDeleteLog.execute(...args));
client.on(messageUpdateLog.name, (...args) => messageUpdateLog.execute(...args));
client.on(channelCreateLog.name, (...args) => channelCreateLog.execute(...args));
client.on(channelDeleteLog.name, (...args) => channelDeleteLog.execute(...args));
client.on(channelUpdateLog.name, (...args) => channelUpdateLog.execute(...args));
client.on(roleCreateLog.name, (...args) => roleCreateLog.execute(...args));
client.on(roleDeleteLog.name, (...args) => roleDeleteLog.execute(...args));
client.on(roleUpdateLog.name, (...args) => roleUpdateLog.execute(...args));

// === ROUTES EXPRESS ===
app.get('/login', passport.authenticate('discord'));
app.get('/auth/discord/callback',
  passport.authenticate('discord', { failureRedirect: '/' }),
  (req, res) => res.redirect('/')
);
app.get('/logout', (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);
    res.redirect('/');
  });
});

app.get('/', isAuthenticated, async (req, res) => {
  const ADMIN = BigInt(PermissionsBitField.Flags.Administrator);
  const guilds = req.user.guilds.filter(
    g => (BigInt(g.permissions) & ADMIN) === ADMIN && client.guilds.cache.has(g.id)
  );
  res.render('home', { user: req.user, guilds, title: 'Accueil Dashboard' });
});

app.get('/server/:id', isAuthenticated, async (req, res) => {
  const guildId = req.params.id;
  
  try {
    if (!client.guilds.cache.has(guildId)) {
      return res.redirect('/');
    }

    const userGuild = req.user.guilds.find(g => g.id === guildId);
    const ADMIN = BigInt(PermissionsBitField.Flags.Administrator);
    if (!userGuild || (BigInt(userGuild.permissions) & ADMIN) !== ADMIN) {
      return res.redirect('/');
    }

    const guild = client.guilds.cache.get(guildId);
    let guildSettings = await getGuildSettings(guildId);

    if (!guildSettings.reglementConfig) {
      console.log(`[Dashboard] FORCE initialisation reglementConfig pour ${guildId}`);
      guildSettings.reglementConfig = getDefaultReglementConfig();
      
      try {
        await saveGuildSettings(guildId, guildSettings);
        console.log(`[Dashboard] ✅ reglementConfig initialisé et sauvegardé`);
      } catch (saveError) {
        console.error(`[Dashboard] Erreur sauvegarde initialisation règlement:`, saveError);
      }
    }

    if (!guildSettings.langueRoles || typeof guildSettings.langueRoles !== 'object') {
      guildSettings.langueRoles = {
        fr: '', en: '', es: '', de: '', pt: '', ru: '', hu: '', it: ''
      };
    }

    console.log(`[Dashboard Debug GET] reglementConfig présent:`, !!guildSettings.reglementConfig);
    console.log(`[Dashboard Debug GET] reglementConfig.enabled:`, guildSettings.reglementConfig?.enabled);

    const channels = guild.channels.cache
      .filter(c => c.type === ChannelType.GuildText || c.type === ChannelType.GuildCategory)
      .sort((a, b) => a.position - b.position)
      .map(c => ({ id: c.id, name: c.name, type: c.type }));

    const roles = guild.roles.cache
      .filter(role => role.id !== guild.id)
      .sort((a, b) => b.position - a.position)
      .map(role => ({ id: role.id, name: role.name, color: role.hexColor }));

    res.render('dashboard-server', {
      user: req.user,
      guild,
      settings: guildSettings,
      channels,
      roles,
      LANGUE_CODES: LANGUE_CODES,
      LANGUE_CODES_ARRAY: LANGUE_CODES_ARRAY, 
      supportedLanguagesMap: supportedLanguagesMap,
      logEventsAvailable: [
        'memberJoin', 'memberLeave', 'messageDelete', 'messageUpdate',
        'channelCreate', 'channelDelete', 'channelUpdate',
        'roleCreate', 'roleDelete', 'roleUpdate'
      ],
      client: client
    });

  } catch (error) {
    console.error(`Erreur chargement dashboard pour la guilde ${guildId}:`, error);
    res.redirect('/');
  }
});

app.post('/server/:id/update', isAuthenticated, async (req, res) => {
  const guildId = req.params.id;
  console.log(`[DEBUG POST Update /server/${guildId}] Route POST appelée.`);
  
  try {
    const userGuild = req.user.guilds.find(g => g.id === guildId);
    const ADMIN = BigInt(PermissionsBitField.Flags.Administrator);
    if (!userGuild || (BigInt(userGuild.permissions) & ADMIN) !== ADMIN) {
      return res.status(403).send('Accès refusé.');
    }

    console.log('[DEBUG POST Update] req.body reçu:', JSON.stringify(req.body, null, 2));

    const currentSettings = await getGuildSettings(guildId);

    const cleanStringValue = (value, defaultValue = '') => (typeof value === 'string' ? value.trim() : defaultValue);
    const cleanNullableStringValue = (value) => (typeof value === 'string' && value.trim() !== '' ? value.trim() : null);

    const langueRoles = {};
    const languesRolesMap = { fr: 'Français', en: 'English', es: 'Español', de: 'Deutsch', pt: 'Português', ru: 'Русский', hu: 'Magyar', it: 'Italiano' };
    
    Object.keys(languesRolesMap).forEach(code => {
      const roleId = cleanNullableStringValue(req.body[`lang_${code}`]);
      if (roleId) langueRoles[code] = roleId;
    });

    let translationSystems = [];
    if (req.body.translationSystemsData) {
      try {
        translationSystems = JSON.parse(req.body.translationSystemsData);
        console.log('[DEBUG POST] Données systèmes de traduction:', translationSystems);
      } catch (e) {
        console.error('[DEBUG POST] Erreur parsing translationSystemsData:', e);
        translationSystems = [];
      }
    }

    let roleAssignmentSystems = [];
    if (req.body.roleAssignmentSystemsData) {
      try {
        const parsedSystems = JSON.parse(req.body.roleAssignmentSystemsData);
        console.log('[DEBUG POST] Systèmes de rôles parsés:', JSON.stringify(parsedSystems, null, 2));
        
        roleAssignmentSystems = parsedSystems.map(system => ({
          id: system.id,
          name: system.name,
          description: system.description || '',
          condition: system.condition,
          targetRole: system.targetRole,
          enabled: system.enabled,
          triggerData: system.triggerData || {}
        }));
      } catch (e) {
        console.error('[DEBUG POST] Erreur parsing roleAssignmentSystems:', e);
        roleAssignmentSystems = currentSettings.roleAssignmentSystems || [];
      }
    }

    let reglementConfig = {};
    
    if (req.body.reglementConfigData) {
      try {
        let reglementData;
        
        if (Array.isArray(req.body.reglementConfigData)) {
          reglementData = req.body.reglementConfigData.find(item => item && item.trim() !== '');
        } else {
          reglementData = req.body.reglementConfigData;
        }
        
        if (typeof reglementData === 'string' && reglementData.trim() !== '') {
          reglementConfig = JSON.parse(reglementData);
          console.log('[DEBUG POST] Données règlement parsées:', JSON.stringify(reglementConfig, null, 2));
        } else {
          console.log('[DEBUG POST] reglementConfigData vide, utilisation des données du formulaire');
          reglementConfig = buildReglementFromForm(req.body);
        }
      } catch (parseError) {
        console.error('[DEBUG POST] Erreur parsing reglementConfigData:', parseError);
        reglementConfig = buildReglementFromForm(req.body);
      }
    } else {
      console.log('[DEBUG POST Update] Aucun reglementConfigData reçu, construction depuis le formulaire.');
      reglementConfig = buildReglementFromForm(req.body);
    }

    const setlanguesRequiredRolesArray = req.body.setlanguesRequiredRoles 
      ? (Array.isArray(req.body.setlanguesRequiredRoles) 
          ? req.body.setlanguesRequiredRoles 
          : req.body.setlanguesRequiredRoles.split(',').map(id => id.trim()).filter(id => id))
      : [];

    const ticketSupportRolesArray = req.body.ticketSupportRoles 
      ? (typeof req.body.ticketSupportRoles === 'string' 
          ? req.body.ticketSupportRoles.split(',').map(id => id.trim()).filter(id => id)
          : req.body.ticketSupportRoles)
      : [];

    const settings = {
      prefix: req.body.prefix || '.',
      welcomeEnabled: req.body.welcomeEnabled === 'true',
      welcomeMessage: req.body.welcomeMessage || '',
      goodbyeEnabled: req.body.goodbyeEnabled === 'true',
      goodbyeMessage: req.body.goodbyeMessage || '',
      welcomeChannel: req.body.welcomeChannel || '',
      langueRoles: langueRoles,
      setlanguesRequiredRoles: setlanguesRequiredRolesArray,
      ticketCategoryID: req.body.ticketCategoryID || '',
      ticketLogChannelID: req.body.ticketLogChannelID || '',
      logChannelID: req.body.logChannelID || '',
      logEvents: req.body.logEvents || [],
      ticketSupportRoles: ticketSupportRolesArray,
      translationSystems: translationSystems,
      roleAssignmentSystems: roleAssignmentSystems,
      reglementConfig: reglementConfig,
      ticketOpenMessageID: currentSettings.ticketOpenMessageID || ''
    };

    console.log('[DEBUG POST Update] Settings complets avant sauvegarde:', JSON.stringify(settings, null, 2));

    await saveGuildSettings(guildId, settings);
    
    console.log('[DEBUG POST Update] ✅ Sauvegarde réussie pour:', guildId);
    res.redirect(`/server/${guildId}?success=1`);

  } catch (error) {
    console.error('[DEBUG POST Update] ❌ Erreur:', error);
    res.status(500).send('Erreur lors de la sauvegarde: ' + error.message);
  }
});

// Health check
app.get('/health', async (req, res) => {
  const health = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: Math.round(process.uptime()),
    memory: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB'
  };

  health.discord = client.isReady() ? 'Connected' : 'Disconnected';

  try {
    const { exec } = await import('child_process');
    await new Promise((resolve, reject) => {
      exec('ffmpeg -version', { timeout: 2000 }, (error, stdout) => {
        if (error) {
          health.ffmpeg = 'Missing';
          health.status = 'DEGRADED';
          reject();
        } else {
          health.ffmpeg = 'Available';
          resolve();
        }
      });
    });
  } catch {
    health.ffmpeg = 'Error';
    health.status = 'DEGRADED';
  }

  try {
    const { exec } = await import('child_process');
    await new Promise((resolve, reject) => {
      exec('yt-dlp --version', { timeout: 2000 }, (error, stdout) => {
        if (error) {
          health.ytdlp = 'Missing';
          health.status = 'DEGRADED';
          reject();
        } else {
          health.ytdlp = stdout.trim();
          resolve();
        }
      });
    });
  } catch {
    health.ytdlp = 'Error';
    health.status = 'DEGRADED';
  }

  health.distube = (typeof distube !== 'undefined' && distube) ? 'Ready' : 'Not Ready';
  if (health.distube === 'Not Ready') {
    health.status = 'DEGRADED';
  }

  const statusCode = health.status === 'OK' ? 200 : 503;
  res.status(statusCode).json(health);
});

// === GESTIONNAIRES DE MEMBRES ===
client.on('guildMemberAdd', async (member) => {
  try {
    const guildSettings = await getGuildSettings(member.guild.id);
    
    if (guildSettings?.welcomeEnabled && guildSettings?.welcomeChannel) {
      const channel = member.guild.channels.cache.get(guildSettings.welcomeChannel);
      if (channel && channel.isTextBased()) {
        const welcomeMessage = guildSettings.welcomeMessage
          .replace(/{user}/g, `<@${member.id}>`)
          .replace(/{username}/g, member.user.username)
          .replace(/{server}/g, member.guild.name);
        
        await channel.send(welcomeMessage);
      }
    }

    await handleRoleAssignment('member_join', {
      guild: member.guild,
      user: member.user,
      member: member
    }, client);

  } catch (error) {
    console.error('Erreur dans guildMemberAdd:', error);
  }
});

client.on('guildMemberRemove', async (member) => {
  try {
    const guildSettings = await getGuildSettings(member.guild.id);
    if (!guildSettings || !guildSettings.goodbyeEnabled || !guildSettings.welcomeChannel) return;

    const channel = member.guild.channels.cache.get(guildSettings.welcomeChannel);
    if (channel && channel.isTextBased()) {
      const goodbyeMessage = guildSettings.goodbyeMessage
        .replace(/{user}/g, `<@${member.id}>`)
        .replace(/{username}/g, member.user.username)
        .replace(/{server}/g, member.guild.name);

      await channel.send(goodbyeMessage);
    }
  } catch (error) {
    console.error('Erreur dans guildMemberRemove:', error);
  }
});

console.log('✅ Fichier index.js chargé avec succès');


app.get('/health', (req, res) => res.send('OK'));

// === NETTOYAGE PÉRIODIQUE ===
setInterval(async () => {
  try {
    await cleanupOldBackups();
    console.log('🧹 Nettoyage automatique des sauvegardes effectué');
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage automatique:', error);
  }
}, 60 * 60 * 1000); // Toutes les heures