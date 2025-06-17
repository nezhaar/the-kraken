// Import de distube depuis index.js
import { distube } from '../index.js';

// Aide musique
export const musiqueHelp = {
  name: '🎶 Musique',
  value: '`[prefix]play [nom/lien]` — Joue une musique\n' +
         '`[prefix]playlist [lien/nom]` — Joue une playlist\n' +
         '`[prefix]add [nom/lien]` — Ajoute une musique à la file d\'attente\n' +
         '`[prefix]skip` — Passe à la musique suivante\n' +
         '`[prefix]stop` — Arrête la musique\n' +
         '`[prefix]pause` / `[prefix]resume` — Pause/Reprend la musique\n' +
         '`[prefix]queue` — Affiche la file d\'attente\n' +
         '`[prefix]volume [0-100]` — Définit le volume\n' +
         '`[prefix]loop` — Active/Désactive la boucle\n' +
         '`[prefix]nowplaying` — Affiche la musique en cours'
};

// Fonction pour configurer distube
export function setupMusique(distubeInstance) {
  distubeInstance.setMaxListeners(20);
  
  // Événements DisTube
  distubeInstance
    .on('playSong', (queue, song) => {
      console.log(`[playSong] ${song.name}`);
      try {
        queue.textChannel.send(`🎶 Maintenant en train de jouer : **${song.name}**`);
      } catch (error) {
        console.error("DisTube playSong error:", error);
      }
    })
    .on('addSong', (queue, song) => {
      console.log(`[addSong] ${song.name}`);
      try {
        queue.textChannel.send(`➕ **${song.name}** a été ajouté à la file.`);
      } catch (error) {
        console.error("DisTube addSong error:", error);
      }
    })
    .on('addList', (queue, playlist) => {
      console.log(`[addList] Playlist : ${playlist.name}, ${playlist.songs.length} musiques`);
      try {
        queue.textChannel.send(`📃 Playlist **${playlist.name}** ajoutée avec ${playlist.songs.length} musiques.`);
      } catch (error) {
        console.error("DisTube addList error:", error);
      }
    })
    .on('finish', queue => {
      console.log(`[finish] File terminée.`);
      try {
        queue.textChannel.send('✅ File terminée.');
      } catch (error) {
        console.error("DisTube finish error:", error);
      }
    })
    .on('error', (channel, error) => {
      console.error('Erreur DisTube :', error);
      if (channel?.send) {
        try {
          channel.send('❌ Une erreur est survenue : ' + error.message);
        } catch (sendError) {
          console.error("DisTube error handler send error:", sendError);
        }
      }
    });
}

export async function musiqueCommandes(command, message, args) {
  // Liste des commandes de musique qui nécessitent d'être dans un salon vocal
  const musicCommands = ['play', 'playlist', 'add', 'skip', 'stop', 'pause', 'resume', 'queue', 'volume', 'loop', 'nowplaying'];
  
  // Si ce n'est pas une commande de musique, on sort de la fonction
  if (!musicCommands.includes(command)) return false;

  const voiceChannel = message.member?.voice.channel;
  if (!voiceChannel) {
    await message.reply('🔊 Tu dois être dans un salon vocal !');
    return true;
  }

  const query = args.join(" ");
  const queue = distube.getQueue(message);

  try {
    switch (command) {
      case 'play':
        if (!query) {
          await message.reply("❌ Tu dois fournir un lien ou une recherche.");
          return true;
        }
        console.log(`[Commande] play ${query}`);
        await distube.play(voiceChannel, query, {
          member: message.member,
          textChannel: message.channel,
        });
        break;

      case 'playlist':
        if (!query) {
          await message.reply("❌ Tu dois fournir un lien ou un nom de playlist.");
          return true;
        }
        console.log(`[Commande] playlist ${query}`);
        await distube.play(voiceChannel, query, {
          member: message.member,
          textChannel: message.channel,
        });
        break;

      case 'add':
        if (!query) {
          await message.reply("❌ Tu dois fournir un lien ou une recherche.");
          return true;
        }
        console.log(`[Commande] add ${query}`);
        await distube.play(voiceChannel, query, {
          member: message.member,
          textChannel: message.channel,
          message,
        });
        await message.reply(`🎶 **${query}** a été ajouté à la file d'attente.`);
        break;

      case 'skip':
        if (!queue) {
          await message.reply("❌ Aucune musique en cours.");
          return true;
        }
        await distube.skip(queue);
        await message.reply('⏭️ Musique suivante...');
        break;

      case 'stop':
        if (!queue) {
          await message.reply("❌ Aucune musique en cours.");
          return true;
        }
        await distube.stop(queue);
        await message.reply('⏹️ Musique arrêtée.');
        break;

      case 'pause':
        if (!queue) {
          await message.reply("❌ Rien à mettre en pause.");
          return true;
        }
        await distube.pause(queue);
        await message.reply('⏸️ Musique en pause.');
        break;

      case 'resume':
        if (!queue) {
          await message.reply("❌ Rien à reprendre.");
          return true;
        }
        await distube.resume(queue);
        await message.reply('▶️ Musique reprise.');
        break;

      case 'queue':
        if (!queue || !queue.songs.length) {
          await message.reply("📭 La file est vide.");
          return true;
        }
        const songList = queue.songs
          .map((song, index) => `${index + 1}. ${song.name}`)
          .join("\n");
        await message.reply(`📜 File d'attente :\n${songList}`);
        break;

      case 'volume':
        const volume = parseInt(args[0]);
        if (isNaN(volume) || volume < 0 || volume > 100) {
          await message.reply("📉 Volume entre 0 et 100.");
          return true;
        }
        if (!queue) {
          await message.reply("❌ Rien n'est en lecture.");
          return true;
        }
        await distube.setVolume(queue, volume);
        await message.reply(`🔊 Volume défini à ${volume}%.`);
        break;

      case 'loop':
        if (!queue) {
          await message.reply("❌ Aucune musique en cours.");
          return true;
        }
        const mode = distube.setRepeatMode(queue);
        await message.reply(`🔁 Mode boucle : ${mode === 0 ? 'off' : mode === 1 ? 'chanson' : 'file'}`);
        break;

      case 'nowplaying':
        if (!queue || !queue.songs.length) {
          await message.reply("❌ Aucune musique n'est en cours.");
          return true;
        }
        await message.reply(`🎧 En lecture : **${queue.songs[0].name}**`);
        break;

      default:
        return false;
    }
  } catch (error) {
    console.error(`DisTube ${command} command error:`, error);
    await message.reply(`❌ Erreur lors de l'exécution de la commande ${command}.`);
  }

  return true;
}