import { PermissionsBitField } from 'discord.js';

export const WEBHOOK_NAME = 'TraducteurAutomatiqueModule';

export const supportedLanguagesMap = {
    'fr': { name: 'Français', lang: 'fr' },
    'en': { name: 'Anglais', lang: 'en' },
    'es': { name: 'Espagnol', lang: 'es' },
    'de': { name: 'Allemand', lang: 'de' },
    'pt': { name: 'Portugais', lang: 'pt' },
    'ru': { name: 'Russe', lang: 'ru' },
    'hu': { name: 'Hongrois', lang: 'hu' },
    'it': { name: 'Italien', lang: 'it' }
};

export async function exampleTranslateTextFunction(text, sourceLang, targetLang) {
    console.log(`[Traduction Module] Tentative de traduction de "${text}" de ${sourceLang} vers ${targetLang}`);
    
    if (sourceLang === targetLang) {
        return text;
    }
    
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(`[${targetLang.toUpperCase()}] ${text} (traduit de ${sourceLang} via module)`);
        }, 500);
    });
}

export async function handleMessageTranslation(message, client, activeChannelsConfig, translateFunction) {
    if (message.author.bot) return;

    const sourceChannelConfig = activeChannelsConfig[message.channel.id];
    if (!sourceChannelConfig) return;

    const originalMessageContent = message.content;
    if (!originalMessageContent || originalMessageContent.trim() === '') return;

    const sourceLang = sourceChannelConfig.lang;

    console.log(`[Traduction Module] Message reçu dans ${message.channel.name} (${sourceLang}): "${originalMessageContent}" par ${message.author.tag}`);

    for (const targetChannelId in activeChannelsConfig) {
        if (targetChannelId === message.channel.id) continue;

        const targetChannelConfigDetails = activeChannelsConfig[targetChannelId];
        const targetLang = targetChannelConfigDetails.lang;
        const targetChannel = client.channels.cache.get(targetChannelId);

        if (!targetChannel) {
            console.warn(`[Traduction Module] Salon cible avec ID ${targetChannelId} (pour lang ${targetLang}) non trouvé.`);
            continue;
        }

        const botMember = targetChannel.guild.members.me;
        if (!botMember) {
            console.error(`[Traduction Module] Impossible de récupérer les informations du bot dans le serveur ${targetChannel.guild.name}.`);
            continue;
        }

        if (!botMember.permissionsIn(targetChannel).has(PermissionsBitField.Flags.ManageWebhooks)) {
            console.error(`[Traduction Module] Le bot n'a pas la permission "Gérer les webhooks" dans ${targetChannel.name}.`);
            continue;
        }

        if (!botMember.permissionsIn(targetChannel).has(PermissionsBitField.Flags.SendMessages)) {
            console.error(`[Traduction Module] Le bot n'a pas la permission "Envoyer des messages" dans ${targetChannel.name}.`);
            continue;
        }

        try {
            const translatedText = await translateFunction(originalMessageContent, sourceLang, targetLang);

            if (translatedText && translatedText.trim() !== '') {
                let webhook = (await targetChannel.fetchWebhooks()).find(wh => wh.name === WEBHOOK_NAME && wh.owner.id === client.user.id);
                
                if (!webhook) {
                    try {
                        webhook = await targetChannel.createWebhook({
                            name: WEBHOOK_NAME,
                            avatar: client.user.displayAvatarURL(),
                            reason: 'Webhook pour la traduction automatique (Module)'
                        });
                        console.log(`[Traduction Module] Webhook créé dans ${targetChannel.name}`);
                    } catch (webhookError) {
                        console.error(`[Traduction Module] Erreur création webhook dans ${targetChannel.name}:`, webhookError);
                        continue;
                    }
                }

                try {
                    await webhook.send({
                        content: translatedText,
                        username: message.author.username,
                        avatarURL: message.author.displayAvatarURL({ dynamic: true }),
                    });
                    console.log(`[Traduction Module] Message traduit (${targetLang}) envoyé à ${targetChannel.name} en tant que ${message.author.username}`);
                } catch (sendError) {
                    console.error(`[Traduction Module] Erreur envoi webhook dans ${targetChannel.name}:`, sendError);
                }
            } else {
                console.log(`[Traduction Module] La traduction de "${originalMessageContent}" vers ${targetLang} a échoué ou est vide.`);
            }
        } catch (error) {
            console.error(`[Traduction Module] Erreur traduction/envoi pour ${targetChannel.name} (lang ${targetLang}):`, error);
        }
    }
}