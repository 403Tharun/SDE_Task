const express = require('express');
const authMock = require('../middleware/authMock');
const taskController = require('../controllers/taskController');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.use(authMock);

router.get('/', asyncHandler(taskController.getTasks));
router.get('/analytics', asyncHandler(taskController.getAnalytics));
router.post('/classify', asyncHandler(taskController.classifyTask));
router.post('/', asyncHandler(taskController.createTask));
router.get('/:id', asyncHandler(taskController.getTaskById));
router.put('/:id', asyncHandler(taskController.updateTask));
router.delete('/:id', asyncHandler(taskController.deleteTask));

module.exports = router;

