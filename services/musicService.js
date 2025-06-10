// services/musicService.js - Module DisTube séparé pour éviter l'import cyclique
import { DisTube } from 'distube';
import { YtDlpPlugin } from '@distube/yt-dlp';

// ✅ CORRECTION: Fonction pour créer l'instance DisTube
export function createDistubeInstance(client) {
  const distube = new DisTube(client, {
    plugins: [new YtDlpPlugin({ update: true })],
    emitAddListWhenCreatingQueue: true,
    emitNewSongOnly: true,
  });

  // Configuration des événements DisTube
  setupDistubeEvents(distube);
  
  return distube;
}

// ✅ CORRECTION: Configuration des événements DisTube avec gestion d'erreurs
function setupDistubeEvents(distube) {
  distube.setMaxListeners(20);
  
  distube
    .on('playSong', (queue, song) => {
      console.log(`[playSong] ${song.name}`);
      try {
        if (queue.textChannel && queue.textChannel.send) {
          queue.textChannel.send(`🎶 Maintenant en train de jouer : **${song.name}**`);
        }
      } catch (error) {
        console.error("DisTube playSong error:", error.message);
      }
    })
    .on('addSong', (queue, song) => {
      console.log(`[addSong] ${song.name}`);
      try {
        if (queue.textChannel && queue.textChannel.send) {
          queue.textChannel.send(`➕ **${song.name}** a été ajouté à la file.`);
        }
      } catch (error) {
        console.error("DisTube addSong error:", error.message);
      }
    })
    .on('addList', (queue, playlist) => {
      console.log(`[addList] Playlist : ${playlist.name}, ${playlist.songs.length} musiques`);
      try {
        if (queue.textChannel && queue.textChannel.send) {
          queue.textChannel.send(`📃 Playlist **${playlist.name}** ajoutée avec ${playlist.songs.length} musiques.`);
        }
      } catch (error) {
        console.error("DisTube addList error:", error.message);
      }
    })
    .on('finish', queue => {
      console.log(`[finish] File terminée.`);
      try {
        if (queue.textChannel && queue.textChannel.send) {
          queue.textChannel.send('✅ File terminée.');
        }
      } catch (error) {
        console.error("DisTube finish error:", error.message);
      }
    })
    .on('error', (channel, error) => {
      console.error('Erreur DisTube :', error.message);
      if (channel?.send) {
        try {
          channel.send('❌ Une erreur est survenue : ' + error.message);
        } catch (sendError) {
          console.error("DisTube error handler send error:", sendError.message);
        }
      }
    })
    .on('empty', queue => {
      console.log('[DisTube] File vide, arrêt de la musique');
      try {
        if (queue.textChannel && queue.textChannel.send) {
          queue.textChannel.send('⏹️ Aucune musique dans la file, arrêt automatique.');
        }
      } catch (error) {
        console.error("DisTube empty error:", error.message);
      }
    })
    .on('disconnect', queue => {
      console.log('[DisTube] Bot déconnecté du salon vocal');
      try {
        if (queue.textChannel && queue.textChannel.send) {
          queue.textChannel.send('👋 Déconnecté du salon vocal.');
        }
      } catch (error) {
        console.error("DisTube disconnect error:", error.message);
      }
    });
}

export default createDistubeInstance;