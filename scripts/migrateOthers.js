// scripts/migrateOthers.js
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { mongoManager } from '../database/mongoManager.js';

import { AutoReact } from '../models/AutoReact.js';
import { AutoReply } from '../models/AutoReply.js';
import { AutoResponse } from '../models/AutoResponse.js';
import { CustomCommand } from '../models/CustomCommand.js';
import { Warning } from '../models/Warning.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function migrateJSON(fileName, model, transformer) {
  const filePath = path.join(__dirname, `../data/${fileName}`);
  try {
    const rawData = await fs.readFile(filePath, 'utf-8');
    const json = JSON.parse(rawData);

    const docs = transformer(json);
    for (const doc of docs) {
      await model.updateOne(doc.filter, { $set: doc.data }, { upsert: true });
    }
    console.log(`✅ ${fileName} migré avec succès`);
  } catch (err) {
    console.error(`❌ Erreur pour ${fileName}:`, err.message);
  }
}

async function runMigration() {
  await mongoManager.connect();

  await migrateJSON('autoReacts.json', AutoReact, json =>
    Object.entries(json).map(([guildId, reacts]) =>
      reacts.map(r => ({
        filter: { guildId, trigger: r.trigger },
        data: { guildId, trigger: r.trigger, emojis: r.emojis }
      }))
    ).flat()
  );

  await migrateJSON('autoReplies.json', AutoReply, json =>
    Object.entries(json).map(([guildId, replies]) =>
      replies.map(r => ({
        filter: { guildId, trigger: r.trigger },
        data: { guildId, trigger: r.trigger, response: r.response }
      }))
    ).flat()
  );

await migrateJSON('autoresponses.json', AutoResponse, json =>
  Object.entries(json).map(([guildId, responses]) =>
    Object.values(responses).map(r => ({
      filter: { guildId, trigger: r.trigger },
      data: { guildId, trigger: r.trigger, response: r.response }
    }))
  ).flat()
);


await migrateJSON('customCommands.json', CustomCommand, json =>
  Object.entries(json).map(([guildId, commands]) =>
    Object.values(commands).map(c => ({
      filter: { guildId, command: c.command },
      data: { guildId, command: c.command, response: c.response }
    }))
  ).flat()
);


  await migrateJSON('warnings.json', Warning, json =>
    Object.entries(json).map(([guildId, users]) =>
      Object.entries(users).map(([userId, warnings]) => ({
        filter: { guildId, userId },
        data: { guildId, userId, warnings }
      }))
    ).flat()
  );

  await mongoManager.disconnect();
  console.log('🎉 Toutes les données ont été migrées !');
}

runMigration();
