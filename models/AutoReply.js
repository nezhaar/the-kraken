import mongoose from 'mongoose';

const AutoReplySchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  trigger: { type: String, required: true },
  response: { type: String, required: true }
});

export const AutoReply = mongoose.model('AutoReply', AutoReplySchema);
