export const PROJECT_STATUSES = ['active', 'on-hold', 'completed', 'archived']
export const TASK_STATUSES = ['todo', 'in-progress', 'done']
export const TASK_PRIORITIES = ['low', 'medium', 'high']

export function idOf(doc) {
  return doc?._id || doc?.id || ''
}

export function nameOf(doc) {
  if (!doc) return '—'
  if (typeof doc === 'string') return doc
  return doc.name || doc.email || idOf(doc)
}

export function validateProject(form) {
  const errors = {}
  const name = form.name.trim()
  if (name.length < 2) errors.name = 'Name must be at least 2 characters'
  if (name.length > 120) errors.name = 'Name must be at most 120 characters'
  if (form.description.length > 2000) {
    errors.description = 'Description must be at most 2000 characters'
  }
  if (!PROJECT_STATUSES.includes(form.status)) {
    errors.status = 'Pick a valid status'
  }
  return errors
}

export function validateTask(form) {
  const errors = {}
  const title = form.title.trim()
  if (!form.project) errors.project = 'Choose a project'
  if (title.length < 2) errors.title = 'Title must be at least 2 characters'
  if (title.length > 200) errors.title = 'Title must be at most 200 characters'
  if (form.description.length > 5000) {
    errors.description = 'Description must be at most 5000 characters'
  }
  if (!TASK_STATUSES.includes(form.status)) errors.status = 'Pick a valid status'
  if (!TASK_PRIORITIES.includes(form.priority)) {
    errors.priority = 'Pick a valid priority'
  }
  return errors
}

export function validateAuth({ mode, name, email, password }) {
  const errors = {}
  if (mode === 'register' && name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters'
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.email = 'Enter a valid email address'
  }
  if (!password) errors.password = 'Password is required'
  if (mode === 'register' && password.length < 8) {
    errors.password = 'Password must be at least 8 characters'
  }
  return errors
}
