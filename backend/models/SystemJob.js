import mongoose from 'mongoose';

const systemJobSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['idle', 'running', 'completed', 'failed'],
      default: 'idle',
      index: true,
    },
    lastRun: {
      type: Date,
    },
    nextRun: {
      type: Date,
    },
    lastDuration: {
      type: Number, // Execution time in ms
      default: 0,
    },
    error: {
      type: String,
      default: '',
    },
    runCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const SystemJob = mongoose.model('SystemJob', systemJobSchema);

export default SystemJob;
