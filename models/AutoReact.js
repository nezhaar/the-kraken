import mongoose from 'mongoose';

const AutoReactSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  trigger: { type: String, required: true },
  emojis: { type: [String], default: [] }
});

export const AutoReact = mongoose.model('AutoReact', AutoReactSchema);
