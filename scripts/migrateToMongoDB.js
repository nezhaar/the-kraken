// scripts/migrateToMongoDB.js
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { mongoManager } from '../database/mongoManager.js';
import { GuildSettings } from '../models/GuildSettings.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function migrateGuildSettings() {
  try {
    const filePath = path.join(__dirname, '../data/guildSettings.json');
    const rawData = await fs.readFile(filePath, 'utf-8');
    const jsonData = JSON.parse(rawData);

    await mongoManager.connect();

    const guildIds = Object.keys(jsonData);

    for (const guildId of guildIds) {
      const data = jsonData[guildId];

      await GuildSettings.updateOne(
        { guildId },
        { $set: { ...data, guildId } },
        { upsert: true }
      );

      console.log(`✅ Données importées pour le serveur : ${guildId}`);
    }

    await mongoManager.disconnect();
    console.log('🎉 Migration terminée avec succès !');
  } catch (err) {
    console.error('❌ Erreur durant la migration :', err);
  }
}

migrateGuildSettings();
