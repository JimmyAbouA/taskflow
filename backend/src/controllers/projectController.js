const Project = require('../models/Project');
const Task = require('../models/Task');
const ApiError = require('../utils/ApiError');

// A user may see a project if they own it or are a member of it.
// Admins can see everything.
function visibilityFilter(user) {
  if (user.role === 'admin') return {};
  return { $or: [{ owner: user._id }, { members: user._id }] };
}

function isOwner(project, user) {
  return project.owner.equals(user._id) || user.role === 'admin';
}

// GET /api/projects
async function listProjects(req, res) {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);

  const filter = visibilityFilter(req.user);
  if (req.query.status) filter.status = req.query.status;

  const [projects, total] = await Promise.all([
    Project.find(filter)
      .populate('owner', 'name email')
      .populate('members', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Project.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: projects,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

// GET /api/projects/:id
async function getProject(req, res) {
  const project = await Project.findById(req.params.id)
    .populate('owner', 'name email')
    .populate('members', 'name email')
    .populate('tasks');

  if (!project) throw ApiError.notFound('Project not found');

  const permitted =
    req.user.role === 'admin' ||
    project.owner._id.equals(req.user._id) ||
    project.members.some((m) => m._id.equals(req.user._id));

  if (!permitted) throw ApiError.forbidden('You do not have access to this project');

  res.json({ success: true, data: project });
}

// POST /api/projects
async function createProject(req, res) {
  const { name, description, status, members } = req.body;

  const project = await Project.create({
    name,
    description,
    status,
    members,
    owner: req.user._id,
  });

  await project.populate('owner', 'name email');

  res.status(201).json({ success: true, data: project });
}

// PATCH /api/projects/:id
async function updateProject(req, res) {
  const project = await Project.findById(req.params.id);

  if (!project) throw ApiError.notFound('Project not found');
  if (!isOwner(project, req.user)) {
    throw ApiError.forbidden('Only the project owner can update it');
  }

  // Whitelist the updatable fields so a caller cannot reassign `owner`.
  const allowed = ['name', 'description', 'status', 'members'];
  allowed.forEach((field) => {
    if (req.body[field] !== undefined) project[field] = req.body[field];
  });

  await project.save();
  await project.populate('owner', 'name email');

  res.json({ success: true, data: project });
}

// DELETE /api/projects/:id
async function deleteProject(req, res) {
  const project = await Project.findById(req.params.id);

  if (!project) throw ApiError.notFound('Project not found');
  if (!isOwner(project, req.user)) {
    throw ApiError.forbidden('Only the project owner can delete it');
  }

  // MongoDB has no cascading delete, so remove the project's tasks here or
  // they become orphans pointing at a project that no longer exists.
  const { deletedCount } = await Task.deleteMany({ project: project._id });
  await project.deleteOne();

  res.json({
    success: true,
    data: { id: project._id, deletedTasks: deletedCount },
  });
}

module.exports = {
  listProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
};
