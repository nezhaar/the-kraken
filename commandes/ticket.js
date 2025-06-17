// commandes/ticket.js
import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField, ChannelType, EmbedBuilder } from 'discord.js';
import { getGuildSettings, saveGuildSettings } from '../mongoManager.js';


export const ticketCommand = {
    data: new SlashCommandBuilder()
        .setName('ticket')
        .setDescription('Gère le système de tickets.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('setup')
                .setDescription('Configure le message d\'ouverture de ticket dans un canal.')
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('Le canal où envoyer le message d\'ouverture de ticket.')
                        .setRequired(true)
                        .addChannelTypes(ChannelType.GuildText)
                )
        )
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageGuild),
    
    async execute(interaction) {
        const { guild, options } = interaction;
        const subcommand = options.getSubcommand();

        if (subcommand === 'setup') {
            const setupChannel = options.getChannel('channel');

            // Vérifier que le système est configuré
            const guildSettings = await getGuildSettings(guild.id);
            if (!guildSettings.ticketCategoryID) {
                return await interaction.reply({
                    content: '❌ Veuillez d\'abord configurer une catégorie pour les tickets dans le dashboard.',
                    ephemeral: true
                });
            }

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('open_ticket')
                        .setLabel('🎟️ Ouvrir un Ticket')
                        .setStyle(ButtonStyle.Primary),
                );

            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('🎟️ Support Tickets')
                .setDescription('Cliquez sur le bouton ci-dessous pour ouvrir un ticket de support.\n\n' +
                              '**Avant d\'ouvrir un ticket :**\n' +
                              '• Vérifiez si votre question n\'a pas déjà été posée\n' +
                              '• Préparez une description claire de votre problème\n' +
                              '• Un membre de l\'équipe vous répondra dès que possible\n\n' +
                              '**Note :** Vous ne pouvez avoir qu\'un seul ticket ouvert à la fois.')
                .setThumbnail(guild.iconURL() || null)
                .setFooter({ 
                    text: `${guild.name} • Système de Support`, 
                    iconURL: guild.iconURL() || undefined 
                })
                .setTimestamp();

            try {
                const message = await setupChannel.send({ embeds: [embed], components: [row] });

                // Sauvegarder l'ID du message de ticket
                guildSettings.ticketOpenMessageID = message.id;
                await saveGuildSettings(guild.id, guildSettings);

                await interaction.reply({ 
                    content: `✅ Le message d'ouverture de ticket a été envoyé dans ${setupChannel}.\n` +
                            `**Message ID:** \`${message.id}\``, 
                    ephemeral: true 
                });
            } catch (error) {
                console.error('Erreur lors de l\'envoi du message de ticket :', error);
                await interaction.reply({ 
                    content: '❌ Une erreur est survenue lors de la configuration du ticket. Vérifiez que j\'ai les permissions nécessaires dans ce canal.', 
                    ephemeral: true 
                });
            }
        }
    },
};