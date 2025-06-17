// commands/moderation.js
import ms from 'ms';
import { PermissionsBitField, ChannelType } from 'discord.js';
import { Warning } from '../models/Warning.js';

const warns = new Map();

export const moderationHelp = [
  {
    name: '🔨 Modération/Sanction',
    value: '`[prefix]mute @user` — Mute un utilisateur\n' +
           '`[prefix]unmute @user` — Unmute un utilisateur\n' +
           '`[prefix]tempmute @user [durée]` — Mute temporairement\n' +
           '`[prefix]ban @user [raison]` — Banni un utilisateur\n' +
           '`[prefix]listwarn @user` — Liste les avertissements\n' +
           '`[prefix]kick @user [raison]` — Expulse un utilisateur\n' +
           '`[prefix]unban [userId]` — Débanni un utilisateur\n' +
           '`[prefix]warn @user [raison]` — Avertit un utilisateur\n' +
           '`[prefix]unwarn @user` — Retire un avertissement'
  },
  {
    name: '🔨 Modération/Gestion',
    value: '`[prefix]clear [nombre]` — Supprime des messages\n' +
           '`[prefix]lock` — Verrouille le salon\n' +
           '`[prefix]unlock` — Déverrouille le salon\n' +
           '`[prefix]slowmode [durée]` — Active le mode lent\n' +
           '`[prefix]lockall` — Verrouille tous les salons\n' +
           '`[prefix]unlockall` — Déverrouille tous les salons\n' +
           '`[prefix]vider-salon` — Supprime et recrée le salon'
  }
];

export async function moderationCommands(command, message, args){
   console.log('Command received:', command, 'with args:', args);
    // MUTE
    if (command === 'mute') {
      const member = message.mentions.members.first();
      const reason = args.slice(1).join(' ') || 'Aucune raison fournie';

      if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
        await message.reply("Tu n'as pas la permission.");
        return true;
      }
      if (!member) {
        await message.reply('Mentionne un membre.');
        return true;
      }
      if (!member.moderatable) {
        await message.reply('Je ne peux pas mute ce membre.');
        return true;
      }

      try {
        await member.timeout(60 * 60 * 1000, reason);
        await message.channel.send(`${member} a été mute pour 1 heure. Raison: ${reason}`);
      } catch (error) {
        console.error('Erreur mute:', error);
        await message.reply('Erreur lors du mute.');
      }
      return true;
    }

    // TEMPMUTE
    if (command === 'tempmute') {
      const member = message.mentions.members.first();
      const time = args[1];
      const reason = args.slice(2).join(' ') || 'Aucune raison fournie';

      if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
        await message.reply("Tu n'as pas la permission.");
        return true;
      }
      if (!member || !time) {
        await message.reply('Usage : !tempmute @membre durée raison');
        return true;
      }
      if (!member.moderatable) {
        await message.reply('Je ne peux pas mute ce membre.');
        return true;
      }

      try {
        await member.timeout(ms(time), reason);
        await message.channel.send(`${member} a été temporairement mute pendant ${time}. Raison: ${reason}`);
      } catch (error) {
        console.error('Erreur tempmute:', error);
        await message.reply('Erreur lors du mute temporaire.');
      }
      return true;
    }

    // UNMUTE
    if (command === 'unmute') {
      const member = message.mentions.members.first();
      if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
        await message.reply("Tu n'as pas la permission.");
        return true;
      }
      if (!member || !member.isCommunicationDisabled()) {
        await message.reply("Ce membre n'est pas mute.");
        return true;
      }

      try {
        await member.timeout(null);
        await message.channel.send(`${member} a été unmute.`);
      } catch (error) {
        console.error('Erreur unmute:', error);
        await message.reply('Erreur lors du unmute.');
      }
      return true;
    }

    // BAN
    if (command === 'ban') {
      const member = message.mentions.members.first();
      const reason = args.slice(1).join(' ') || 'Aucune raison fournie';

      if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
        await message.reply("Tu n'as pas la permission.");
        return true;
      }
      if (!member || !member.bannable) {
        await message.reply('Je ne peux pas bannir ce membre.');
        return true;
      }

      try {
        await member.ban({ reason });
        await message.channel.send(`${member.user.tag} a été banni. Raison: ${reason}`);
      } catch (error) {
        console.error('Erreur ban:', error);
        await message.reply('Erreur lors du ban.');
      }
      return true;
    }

    // UNBAN
    if (command === 'unban') {
      const userId = args[0];
      if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
        await message.reply("Tu n'as pas la permission.");
        return true;
      }
      if (!userId) {
        await message.reply('Fournis un ID à débannir.');
        return true;
      }

      try {
        await message.guild.bans.remove(userId);
        await message.channel.send(`L'utilisateur ${userId} a été débanni.`);
      } catch {
        await message.reply("L'utilisateur n'est pas banni ou l'ID est invalide.");
      }
      return true;
    }

    // KICK
    if (command === 'kick') {
      const member = message.mentions.members.first();
      const reason = args.slice(1).join(' ') || 'Aucune raison fournie';

      if (!message.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
        await message.reply("Tu n'as pas la permission.");
        return true;
      }
      if (!member || !member.kickable) {
        await message.reply('Je ne peux pas expulser ce membre.');
        return true;
      }

      try {
        await member.kick(reason);
        await message.channel.send(`${member.user.tag} a été expulsé. Raison: ${reason}`);
      } catch (error) {
        console.error('Erreur kick:', error);
        await message.reply('Erreur lors du kick.');
      }
      return true;
    }

    // CLEAR

 
    if (command === 'clear') {
      const amount = parseInt(args[0], 10);
      if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
        await message.reply("Tu n'as pas la permission.");
        return true;
      }
      if (isNaN(amount) || amount < 1 || amount > 100) {
        await message.reply('Entre un nombre entre 1 et 100.');
        return true;
      }

      try {
        await message.channel.bulkDelete(amount, true);
        const msg = await message.channel.send(`🧹 ${amount} messages supprimés.`);
        setTimeout(() => msg.delete().catch(() => {}), 3000);
      } catch (error) {
        console.error('Erreur clear:', error);
        await message.reply('Erreur lors de la suppression des messages.');
      }
      return true;
    }

    // WARN
    if (command === 'warn') {
      const user = message.mentions.users.first();
      const reason = args.slice(1).join(' ') || 'Aucune raison fournie';

      if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
        await message.reply("Tu n'as pas la permission.");
        return true;
      }
      if (!user) {
        await message.reply('Mentionne un utilisateur.');
        return true;
      }

      const key = `${message.guild.id}-${user.id}`;
      const userWarns = warns.get(key) || [];
      userWarns.push({ reason, date: new Date() });
      warns.set(key, userWarns);

      await message.channel.send(`${user.tag} a été averti. Raison: ${reason}`);
      return true;
    }

    // UNWARN
    if (command === 'unwarn') {
      const user = message.mentions.users.first();
      if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
        await message.reply("Tu n'as pas la permission.");
        return true;
      }
      if (!user) {
        await message.reply('Mentionne un utilisateur.');
        return true;
      }

      const key = `${message.guild.id}-${user.id}`;
      warns.delete(key);

      await message.channel.send(`Tous les avertissements pour ${user.tag} ont été retirés.`);
      return true;
    }

    // LISTWARN
    if (command === 'listwarn') {
      const user = message.mentions.users.first();
      if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
        await message.reply("Tu n'as pas la permission.");
        return true;
      }
      if (!user) {
        await message.reply('Mentionne un utilisateur.');
        return true;
      }

      const key = `${message.guild.id}-${user.id}`;
      const userWarns = warns.get(key);

      if (!userWarns || userWarns.length === 0) {
        await message.reply(`${user.tag} n'a aucun avertissement.`);
        return true;
      }

      const warnList = userWarns.map((w, i) => `${i + 1}. ${w.reason} - ${w.date.toLocaleString()}`).join('\n');
      await message.channel.send(`Avertissements pour ${user.tag} :\n${warnList}`);
      return true;
    }

    // LOCK / UNLOCK
    if (command === 'lock') {
      if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
        await message.reply("Tu n'as pas la permission.");
        return true;
      }
      
      try {
        await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, { SendMessages: false });
        await message.channel.send('🔒 Ce salon est verrouillé.');
      } catch (error) {
        console.error('Erreur lock:', error);
        await message.reply('Erreur lors du verrouillage.');
      }
      return true;
    }

    if (command === 'unlock') {
      if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
        await message.reply("Tu n'as pas la permission.");
        return true;
      }
      
      try {
        await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, { SendMessages: true });
        await message.channel.send('🔓 Ce salon est déverrouillé.');
      } catch (error) {
        console.error('Erreur unlock:', error);
        await message.reply('Erreur lors du déverrouillage.');
      }
      return true;
    }

    // LOCKALL / UNLOCKALL
    if (command === 'lockall') {
      if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
        await message.reply("Tu n'as pas la permission.");
        return true;
      }
      
      try {
        const promises = message.guild.channels.cache
          .filter(c => c.isTextBased() && c.permissionsFor(message.guild.roles.everyone).has(PermissionsBitField.Flags.SendMessages))
          .map(c => c.permissionOverwrites.edit(message.guild.roles.everyone, { SendMessages: false }).catch(() => {}));
        
        await Promise.all(promises);
        await message.channel.send('🔒 Tous les salons ont été verrouillés.');
      } catch (error) {
        console.error('Erreur lockall:', error);
        await message.reply('Erreur lors du verrouillage global.');
      }
      return true;
    }

    if (command === 'unlockall') {
      if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
        await message.reply("Tu n'as pas la permission.");
        return true;
      }
      
      try {
        const promises = message.guild.channels.cache
          .filter(c => c.isTextBased())
          .map(c => c.permissionOverwrites.edit(message.guild.roles.everyone, { SendMessages: true }).catch(() => {}));
        
        await Promise.all(promises);
        await message.channel.send('🔓 Tous les salons ont été déverrouillés.');
      } catch (error) {
        console.error('Erreur unlockall:', error);
        await message.reply('Erreur lors du déverrouillage global.');
      }
      return true;
    }

    if (command === 'vider-salon') {
      if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
        await message.reply("Tu n'as pas la permission.");
        return true;
      }

      try {
        const channel = message.channel;

        // Sauvegarde des propriétés du salon
        const {
          name: channelName,
          type: channelType,
          position: channelPosition,
          topic: channelTopic = '',
          nsfw: channelNsfw = false,
          rateLimitPerUser: channelRateLimitPerUser = 0,
          parentId
        } = channel;

        // Sauvegarde des permissions (format brut : bitfields)
        const overwrites = channel.permissionOverwrites.cache.map(overwrite => ({
          id: overwrite.id,
          type: overwrite.type,
          allow: overwrite.allow.bitfield,
          deny: overwrite.deny.bitfield
        }));

        // Message de confirmation
        await message.reply("🔄 Suppression et recréation du salon en cours...");

        // Création du nouveau salon AVEC les permissions d'origine
        const newChannel = await message.guild.channels.create({
          name: channelName,
          type: channelType,
          topic: channelTopic,
          nsfw: channelNsfw,
          rateLimitPerUser: channelRateLimitPerUser,
          parent: parentId,
          permissionOverwrites: overwrites,
          reason: "Commande vider-salon"
        });

        // Répositionner le salon
        try {
          await newChannel.setPosition(channelPosition);
        } catch (e) {
          console.error("Erreur lors du positionnement du salon:", e);
        }

        // Message de confirmation
        await newChannel.send('✅ Salon vidé avec succès !');

        // Suppression de l'ancien salon
        setTimeout(async () => {
          try {
            await channel.delete("Commande vider-salon");
          } catch (e) {
            console.error("Erreur suppression salon:", e);
            await newChannel.send("⚠️ Impossible de supprimer l'ancien salon.");
          }
        }, 1000);

      } catch (error) {
        console.error("Erreur vider-salon:", error);
        await message.reply("❌ Une erreur est survenue : " + error.message);
      }
      return true;
    }

    // SLOWMODE
    if (command === 'slowmode') {
      const seconds = parseInt(args[0], 10);
      if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
        await message.reply("Tu n'as pas la permission.");
        return true;
      }
      if (isNaN(seconds) || seconds < 0 || seconds > 21600) {
        await message.reply('Entre une durée valide entre 0 et 21600 secondes.');
        return true;
      }

      try {
        await message.channel.setRateLimitPerUser(seconds);
        if (seconds === 0) {
          await message.channel.send('🕒 Mode lent désactivé.');
        } else {
          await message.channel.send(`🕒 Mode lent défini à ${seconds} secondes.`);
        }
      } catch (error) {
        console.error('Erreur slowmode:', error);
        await message.reply('Erreur lors de la modification du mode lent.');
      }
      return true;
    }

    // Si aucune commande de modération n'a été trouvée
    return false;
}