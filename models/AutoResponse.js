import mongoose from 'mongoose';

const AutoResponseSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  trigger: { type: String, required: true },
  response: { type: String, required: true }
});

export const AutoResponse = mongoose.model('AutoResponse', AutoResponseSchema);
