// Shared enum values, kept in one place so the Mongoose schemas and the
// request validators can never disagree about what is allowed.

const USER_ROLES = ['admin', 'member'];

const PROJECT_STATUSES = ['active', 'on-hold', 'completed', 'archived'];

const TASK_STATUSES = ['todo', 'in-progress', 'done'];

const TASK_PRIORITIES = ['low', 'medium', 'high'];

module.exports = {
  USER_ROLES,
  PROJECT_STATUSES,
  TASK_STATUSES,
  TASK_PRIORITIES,
};
