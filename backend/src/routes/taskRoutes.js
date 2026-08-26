const express = require('express');
const { body, param, query } = require('express-validator');

const {
  listTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
} = require('../controllers/taskController');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const { TASK_STATUSES, TASK_PRIORITIES } = require('../constants');

// mergeParams lets this router see :projectId when mounted under
// /api/projects/:projectId/tasks
const router = express.Router({ mergeParams: true });

router.use(protect);

const createRules = [
  body('title').trim().isLength({ min: 2, max: 200 }).withMessage('Title must be 2-200 characters'),
  body('description').optional().isLength({ max: 5000 }),
  body('status').optional().isIn(TASK_STATUSES).withMessage(`Status must be one of: ${TASK_STATUSES.join(', ')}`),
  body('priority').optional().isIn(TASK_PRIORITIES).withMessage(`Priority must be one of: ${TASK_PRIORITIES.join(', ')}`),
  body('dueDate').optional({ nullable: true }).isISO8601().withMessage('dueDate must be an ISO 8601 date'),
  body('assignee').optional({ nullable: true }).isMongoId().withMessage('assignee must be a valid id'),
  body('project').optional().isMongoId().withMessage('project must be a valid id'),
];

const updateRules = [
  param('id').isMongoId().withMessage('Invalid task id'),
  body('title').optional().trim().isLength({ min: 2, max: 200 }),
  body('description').optional().isLength({ max: 5000 }),
  body('status').optional().isIn(TASK_STATUSES),
  body('priority').optional().isIn(TASK_PRIORITIES),
  body('dueDate').optional({ nullable: true }).isISO8601(),
  body('assignee').optional({ nullable: true }).isMongoId(),
  body('project').optional().isMongoId(),
];

router
  .route('/')
  .get(
    [
      query('status').optional().isIn(TASK_STATUSES),
      query('priority').optional().isIn(TASK_PRIORITIES),
      query('project').optional().isMongoId(),
      query('assignee').optional().isMongoId(),
    ],
    validate,
    listTasks
  )
  .post(createRules, validate, createTask);

router
  .route('/:id')
  .get([param('id').isMongoId().withMessage('Invalid task id')], validate, getTask)
  .patch(updateRules, validate, updateTask)
  .delete([param('id').isMongoId().withMessage('Invalid task id')], validate, deleteTask);

module.exports = router;
