import { useEffect, useState } from 'react'
import { api } from '../api.js'
import { EmptyState, FeedbackBanner, FieldHint, formatApiError } from '../components/Feedback.jsx'
import {
  TASK_PRIORITIES,
  TASK_STATUSES,
  idOf,
  nameOf,
  validateTask,
} from '../constants.js'

const emptyForm = {
  title: '',
  description: '',
  project: '',
  status: 'todo',
  priority: 'medium',
  dueDate: '',
}

function Tasks() {
  const [tasks, setTasks] = useState([])
  const [projects, setProjects] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [fieldErrors, setFieldErrors] = useState({})
  const [editingId, setEditingId] = useState(null)
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function load() {
    setError('')
    setLoading(true)
    try {
      const query = new URLSearchParams()
      if (statusFilter) query.set('status', statusFilter)
      if (priorityFilter) query.set('priority', priorityFilter)
      const suffix = query.toString() ? `?${query}` : ''

      const [taskBody, projectBody] = await Promise.all([
        api(`/tasks${suffix}`),
        api('/projects'),
      ])
      setTasks(taskBody.data || [])
      setProjects(projectBody.data || [])
    } catch (err) {
      setError(formatApiError(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [statusFilter, priorityFilter])

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
    setFieldErrors((current) => ({ ...current, [field]: undefined }))
  }

  function startEdit(task) {
    setEditingId(idOf(task))
    setSuccess('')
    setFieldErrors({})
    setForm({
      title: task.title || '',
      description: task.description || '',
      project: idOf(task.project),
      status: task.status || 'todo',
      priority: task.priority || 'medium',
      dueDate: task.dueDate ? String(task.dueDate).slice(0, 10) : '',
    })
  }

  function cancelEdit() {
    setEditingId(null)
    setFieldErrors({})
    setForm(emptyForm)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = validateTask(form)
    setFieldErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    setSaving(true)
    setError('')
    setSuccess('')

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      project: form.project,
      status: form.status,
      priority: form.priority,
      dueDate: form.dueDate || null,
    }

    try {
      if (editingId) {
        await api(`/tasks/${editingId}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        })
        setSuccess('Task updated.')
      } else {
        await api('/tasks', {
          method: 'POST',
          body: JSON.stringify(payload),
        })
        setSuccess('Task created.')
      }
      cancelEdit()
      await load()
    } catch (err) {
      setError(formatApiError(err))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(task) {
    const ok = window.confirm(`Delete task "${task.title}"?`)
    if (!ok) return

    try {
      setError('')
      await api(`/tasks/${idOf(task)}`, { method: 'DELETE' })
      if (editingId === idOf(task)) cancelEdit()
      setSuccess('Task deleted.')
      await load()
    } catch (err) {
      setError(formatApiError(err))
    }
  }

  return (
    <div>
      <div className="page-head">
        <h2>Tasks</h2>
        <p className="subtitle">
          Every task belongs to a project. Create a project first if the
          dropdown is empty.
        </p>
      </div>

      <FeedbackBanner>{error}</FeedbackBanner>
      <FeedbackBanner tone="success">{success}</FeedbackBanner>

      <div className="filters">
        <label>
          Status
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            disabled={loading}
          >
            <option value="">all</option>
            {TASK_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
        <label>
          Priority
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            disabled={loading}
          >
            <option value="">all</option>
            {TASK_PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>
        </label>
      </div>

      <form className="editor" onSubmit={handleSubmit} noValidate>
        <h3>{editingId ? 'Edit task' : 'New task'}</h3>
        <div className="editor-grid">
          <label>
            Project
            <select
              value={form.project}
              onChange={(e) => updateField('project', e.target.value)}
              disabled={saving || projects.length === 0}
            >
              <option value="">Select a project</option>
              {projects.map((project) => (
                <option key={idOf(project)} value={idOf(project)}>
                  {project.name}
                </option>
              ))}
            </select>
            <FieldHint>{fieldErrors.project}</FieldHint>
          </label>
          <label>
            Title
            <input
              value={form.title}
              onChange={(e) => updateField('title', e.target.value)}
              disabled={saving}
              maxLength={200}
            />
            <FieldHint>{fieldErrors.title}</FieldHint>
          </label>
          <label className="full">
            Description
            <textarea
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
              rows={3}
              disabled={saving}
              maxLength={5000}
            />
            <FieldHint>{fieldErrors.description}</FieldHint>
          </label>
          <label>
            Status
            <select
              value={form.status}
              onChange={(e) => updateField('status', e.target.value)}
              disabled={saving}
            >
              {TASK_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
          <label>
            Priority
            <select
              value={form.priority}
              onChange={(e) => updateField('priority', e.target.value)}
              disabled={saving}
            >
              {TASK_PRIORITIES.map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </select>
          </label>
          <label>
            Due date
            <input
              type="date"
              value={form.dueDate}
              onChange={(e) => updateField('dueDate', e.target.value)}
              disabled={saving}
            />
          </label>
        </div>
        <div className="row-actions">
          <button
            className="btn-primary"
            type="submit"
            disabled={saving || projects.length === 0}
          >
            {saving ? 'Saving…' : editingId ? 'Save changes' : 'Create task'}
          </button>
          {editingId ? (
            <button type="button" onClick={cancelEdit} disabled={saving}>
              Cancel
            </button>
          ) : null}
        </div>
      </form>

      {loading ? (
        <div className="empty-state">Loading tasks…</div>
      ) : projects.length === 0 ? (
        <EmptyState title="Create a project first">
          Tasks cannot exist on their own. Add a project, then come back here.
        </EmptyState>
      ) : tasks.length === 0 ? (
        <EmptyState title="No tasks match these filters">
          Create one above, or clear the status and priority filters.
        </EmptyState>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Project</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Due</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={idOf(task)}>
                  <td>
                    <strong>{task.title}</strong>
                    {task.description ? (
                      <div className="cell-muted">{task.description}</div>
                    ) : null}
                  </td>
                  <td>{nameOf(task.project)}</td>
                  <td>
                    <span className={`pill pill-${task.status}`}>{task.status}</span>
                  </td>
                  <td>
                    <span className={`pill pill-${task.priority}`}>{task.priority}</span>
                  </td>
                  <td>{task.dueDate ? String(task.dueDate).slice(0, 10) : '—'}</td>
                  <td className="row-actions">
                    <button type="button" onClick={() => startEdit(task)}>
                      Edit
                    </button>
                    <button
                      className="btn-danger"
                      type="button"
                      onClick={() => handleDelete(task)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default Tasks
