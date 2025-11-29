const { Schema, model, models } = require('mongoose');

const TaskSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    priority: {
      type: String,
      enum: ['high', 'medium', 'low'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['todo', 'progress', 'done'],
      default: 'todo',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = models.Task || model('Task', TaskSchema);

