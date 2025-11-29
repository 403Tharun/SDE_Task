const Joi = require('joi');

const taskSchema = Joi.object({
  title: Joi.string().min(1).required(),
  description: Joi.string().allow('', null).default(''),
  priority: Joi.string().valid('high', 'medium', 'low').default('medium'),
  status: Joi.string().valid('todo', 'progress', 'done').default('todo'),
});

const classifierSchema = Joi.object({
  description: Joi.string().min(5).required(),
});

function validateTask(payload) {
  return taskSchema.validate(payload, { abortEarly: false });
}

function validateClassifier(payload) {
  return classifierSchema.validate(payload, { abortEarly: false });
}

module.exports = {
  validateTask,
  validateClassifier,
};

