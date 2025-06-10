// ===== 1. CLIENT.JS CORRIGÉ =====
import { Client, GatewayIntentBits, Partials, ActivityType } from 'discord.js';

// Client Discord avec TOUS les intents et partials nécessaires
export const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions, // ✅ CRUCIAL pour les réactions
    GatewayIntentBits.GuildModeration
  ],
  partials: [
    Partials.Channel,
    Partials.Message,
    Partials.Reaction,      // ✅ CRUCIAL pour les réactions sur anciens messages
    Partials.User,
    Partials.GuildMember
  ]
});

// Export ActivityType pour utilisation dans index.js
export { ActivityType };