import { SlashCommandBuilder, ChannelType } from 'discord.js';
import GuildSettings from '../models/GuildSettings.js';
import { createReglementEmbed, createReglementButtons } from '../utils/reglementUtils.js';

export default {
  data: new SlashCommandBuilder()
    .setName('send-reglement')
    .setDescription('🚀 Envoie le règlement dans un salon spécifique')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Salon cible')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    ),

  async execute(interaction) {
    const guildId = interaction.guild.id;
    const channel = interaction.options.getChannel('channel');

    const settings = await GuildSettings.findByGuildId(guildId);
    const config = settings?.reglementConfig;

    if (!config || !config.enabled) {
      return interaction.reply({
        content: '❌ Le système de règlement est désactivé.',
        ephemeral: true
      });
    }

    const embed = createReglementEmbed(config, interaction.guild);
    const buttons = createReglementButtons(config);

    try {
      const msg = await channel.send({ embeds: [embed], components: [buttons] });

      // 🔁 Mise à jour Mongo
      config.lastMessageId = msg.id;
      config.lastSent = new Date().toISOString();
      config.lastChannelId = channel.id;
      await settings.save();

      await interaction.reply({
        content: `✅ Règlement envoyé dans ${channel}`,
        ephemeral: true
      });

    } catch (err) {
      console.error(err);
      return interaction.reply({
        content: '❌ Erreur lors de l’envoi du règlement.',
        ephemeral: true
      });
    }
  }
};
