import mongoose from 'mongoose';

const WarningSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  userId: { type: String, required: true },
  warnings: { type: [Object], default: [] }
});

export const Warning = mongoose.model('Warning', WarningSchema);
