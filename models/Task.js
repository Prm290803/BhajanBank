import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  task: { type: String, required: true },
  points: { type: Number, required: true },
  count: { type: Number, required: true },
  date: { type: Date, required: true }
});

export default mongoose.model('Task', taskSchema);