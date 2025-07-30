import mongoose from 'mongoose';


const taskSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  tasks: [{
    task: { type: String, required: true },
    points: { type: Number, required: true },
    count: { type: Number, required: true },
    totalPoints: { type: Number }  // new field
  }],
    summary: {
    totalCount: Number,
    grandTotalPoints: Number
  }
});

// Add a pre-save hook to calculate totalPoints
taskSchema.pre('save', function(next) {
  let totalCount = 0;
  let grandTotalPoints = 0;

  this.tasks.forEach(task => {
    task.totalPoints = task.points * task.count;
    totalCount += task.count;
    grandTotalPoints += task.totalPoints;
  });

  this.summary = {
    totalCount,
    grandTotalPoints
  };

  next();
});

export default mongoose.model('Task', taskSchema);