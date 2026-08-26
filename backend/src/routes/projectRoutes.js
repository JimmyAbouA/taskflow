const express = require('express');
const { body, param, query } = require('express-validator');

const {
  listProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
} = require('../controllers/projectController');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const { PROJECT_STATUSES } = require('../constants');
const taskRouter = require('./taskRoutes');

const router = express.Router();

// Everything below requires a valid token.
router.use(protect);

// Nested resource: /api/projects/:projectId/tasks
router.use('/:projectId/tasks', taskRouter);

router
  .route('/')
  .get(
    [
      query('status').optional().isIn(PROJECT_STATUSES),
      query('page').optional().isInt({ min: 1 }),
      query('limit').optional().isInt({ min: 1, max: 100 }),
    ],
    validate,
    listProjects
  )
  .post(
    [
      body('name').trim().isLength({ min: 2, max: 120 }).withMessage('Name must be 2-120 characters'),
      body('description').optional().isLength({ max: 2000 }),
      body('status').optional().isIn(PROJECT_STATUSES).withMessage(`Status must be one of: ${PROJECT_STATUSES.join(', ')}`),
      body('members').optional().isArray().withMessage('members must be an array of user ids'),
      body('members.*').optional().isMongoId().withMessage('Each member must be a valid user id'),
    ],
    validate,
    createProject
  );

router
  .route('/:id')
  .get([param('id').isMongoId().withMessage('Invalid project id')], validate, getProject)
  .patch(
    [
      param('id').isMongoId().withMessage('Invalid project id'),
      body('name').optional().trim().isLength({ min: 2, max: 120 }),
      body('description').optional().isLength({ max: 2000 }),
      body('status').optional().isIn(PROJECT_STATUSES),
      body('members').optional().isArray(),
      body('members.*').optional().isMongoId(),
    ],
    validate,
    updateProject
  )
  .delete([param('id').isMongoId().withMessage('Invalid project id')], validate, deleteProject);

module.exports = router;
