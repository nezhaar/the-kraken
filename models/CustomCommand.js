import mongoose from 'mongoose';

const CustomCommandSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  command: { type: String, required: true },
  response: { type: String, required: true }
});

export const CustomCommand = mongoose.model('CustomCommand', CustomCommandSchema);
