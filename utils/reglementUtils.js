import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export function createReglementEmbed(config, guild) {
  const embed = new EmbedBuilder()
    .setTitle(config.title || '📜 Règlement')
    .setDescription(config.description || '')
    .setColor(config.color || '#7289DA');

  if (Array.isArray(config.sections)) {
    config.sections.forEach(section => {
      embed.addFields({
        name: section.name,
        value: section.value,
        inline: section.inline || false
      });
    });
  }

  if (config.showThumbnail) embed.setThumbnail(guild.iconURL());
  if (config.showTimestamp) embed.setTimestamp();
  if (config.footerText) embed.setFooter({ text: config.footerText });

  return embed;
}

export function createReglementButtons(config) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('accept_reglement')
      .setLabel(config.acceptButtonText || '✅ J\'accepte le règlement')
      .setEmoji(config.acceptButtonEmoji || '📋')
      .setStyle(ButtonStyle.Success),

    new ButtonBuilder()
      .setCustomId('decline_reglement')
      .setLabel(config.declineButtonText || '❌ Je refuse')
      .setEmoji(config.declineButtonEmoji || '🚫')
      .setStyle(ButtonStyle.Danger)
  );
}
