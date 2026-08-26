const Project = require('../models/Project');
const Task = require('../models/Task');
const ApiError = require('../utils/ApiError');

// A task inherits its permissions from the project it belongs to: if you can
// see the project, you can work with its tasks.
async function assertProjectAccess(projectId, user) {
  const project = await Project.findById(projectId);

  if (!project) throw ApiError.notFound('Project not found');

  const permitted =
    user.role === 'admin' ||
    project.owner.equals(user._id) ||
    project.members.some((m) => m.equals(user._id));

  if (!permitted) throw ApiError.forbidden('You do not have access to this project');

  return project;
}

async function accessibleProjectIds(user) {
  if (user.role === 'admin') return null; // null means "no restriction"

  const projects = await Project.find({
    $or: [{ owner: user._id }, { members: user._id }],
  }).select('_id');

  return projects.map((p) => p._id);
}

// GET /api/tasks  and  GET /api/projects/:projectId/tasks
async function listTasks(req, res) {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);

  const projectId = req.params.projectId || req.query.project;
  const filter = {};

  if (projectId) {
    await assertProjectAccess(projectId, req.user);
    filter.project = projectId;
  } else {
    const ids = await accessibleProjectIds(req.user);
    if (ids !== null) filter.project = { $in: ids };
  }

  if (req.query.status) filter.status = req.query.status;
  if (req.query.priority) filter.priority = req.query.priority;
  if (req.query.assignee) filter.assignee = req.query.assignee;

  const [tasks, total] = await Promise.all([
    Task.find(filter)
      .populate('assignee', 'name email')
      .populate('project', 'name status')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Task.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: tasks,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

// GET /api/tasks/:id
async function getTask(req, res) {
  const task = await Task.findById(req.params.id)
    .populate('assignee', 'name email')
    .populate('project', 'name status');

  if (!task) throw ApiError.notFound('Task not found');

  await assertProjectAccess(task.project._id, req.user);

  res.json({ success: true, data: task });
}

// POST /api/tasks  and  POST /api/projects/:projectId/tasks
async function createTask(req, res) {
  const projectId = req.params.projectId || req.body.project;

  if (!projectId) throw ApiError.badRequest('A project id is required');

  await assertProjectAccess(projectId, req.user);

  const { title, description, status, priority, dueDate, assignee } = req.body;

  const task = await Task.create({
    title,
    description,
    status,
    priority,
    dueDate,
    assignee: assignee || null,
    project: projectId,
  });

  await task.populate([
    { path: 'assignee', select: 'name email' },
    { path: 'project', select: 'name status' },
  ]);

  res.status(201).json({ success: true, data: task });
}

// PATCH /api/tasks/:id
async function updateTask(req, res) {
  const task = await Task.findById(req.params.id);

  if (!task) throw ApiError.notFound('Task not found');

  await assertProjectAccess(task.project, req.user);

  // Moving a task to a different project requires access to the destination too.
  if (req.body.project && req.body.project !== task.project.toString()) {
    await assertProjectAccess(req.body.project, req.user);
    task.project = req.body.project;
  }

  const allowed = ['title', 'description', 'status', 'priority', 'dueDate', 'assignee'];
  allowed.forEach((field) => {
    if (req.body[field] !== undefined) task[field] = req.body[field];
  });

  await task.save();
  await task.populate([
    { path: 'assignee', select: 'name email' },
    { path: 'project', select: 'name status' },
  ]);

  res.json({ success: true, data: task });
}

// DELETE /api/tasks/:id
async function deleteTask(req, res) {
  const task = await Task.findById(req.params.id);

  if (!task) throw ApiError.notFound('Task not found');

  await assertProjectAccess(task.project, req.user);
  await task.deleteOne();

  res.json({ success: true, data: { id: task._id } });
}

module.exports = { listTasks, getTask, createTask, updateTask, deleteTask };
