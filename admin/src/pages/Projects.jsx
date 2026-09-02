import { useEffect, useState } from 'react'
import { api } from '../api.js'
import { EmptyState, FeedbackBanner, FieldHint, formatApiError } from '../components/Feedback.jsx'
import { PROJECT_STATUSES, idOf, nameOf, validateProject } from '../constants.js'

const emptyForm = { name: '', description: '', status: 'active' }

function Projects() {
  const [projects, setProjects] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [fieldErrors, setFieldErrors] = useState({})
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function load() {
    setError('')
    setLoading(true)
    try {
      const body = await api('/projects')
      setProjects(body.data || [])
    } catch (err) {
      setError(formatApiError(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
    setFieldErrors((current) => ({ ...current, [field]: undefined }))
  }

  function startEdit(project) {
    setEditingId(idOf(project))
    setSuccess('')
    setFieldErrors({})
    setForm({
      name: project.name || '',
      description: project.description || '',
      status: project.status || 'active',
    })
  }

  function cancelEdit() {
    setEditingId(null)
    setFieldErrors({})
    setForm(emptyForm)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = validateProject(form)
    setFieldErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    setSaving(true)
    setError('')
    setSuccess('')

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      status: form.status,
    }

    try {
      if (editingId) {
        await api(`/projects/${editingId}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        })
        setSuccess('Project updated.')
      } else {
        await api('/projects', {
          method: 'POST',
          body: JSON.stringify(payload),
        })
        setSuccess('Project created.')
      }
      cancelEdit()
      await load()
    } catch (err) {
      setError(formatApiError(err))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(project) {
    const ok = window.confirm(
      `Delete "${project.name}"? Its tasks will be deleted too.`
    )
    if (!ok) return

    try {
      setError('')
      await api(`/projects/${idOf(project)}`, { method: 'DELETE' })
      if (editingId === idOf(project)) cancelEdit()
      setSuccess('Project deleted.')
      await load()
    } catch (err) {
      setError(formatApiError(err))
    }
  }

  return (
    <div>
      <div className="page-head">
        <h2>Projects</h2>
        <p className="subtitle">
          Create, edit and delete projects. Each one can hold many tasks.
        </p>
      </div>

      <FeedbackBanner>{error}</FeedbackBanner>
      <FeedbackBanner tone="success">{success}</FeedbackBanner>

      <form className="editor" onSubmit={handleSubmit} noValidate>
        <h3>{editingId ? 'Edit project' : 'New project'}</h3>
        <div className="editor-grid">
          <label>
            Name
            <input
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
              disabled={saving}
              maxLength={120}
            />
            <FieldHint>{fieldErrors.name}</FieldHint>
          </label>
          <label>
            Status
            <select
              value={form.status}
              onChange={(e) => updateField('status', e.target.value)}
              disabled={saving}
            >
              {PROJECT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <FieldHint>{fieldErrors.status}</FieldHint>
          </label>
          <label className="full">
            Description
            <textarea
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
              rows={3}
              disabled={saving}
              maxLength={2000}
            />
            <FieldHint>{fieldErrors.description}</FieldHint>
          </label>
        </div>
        <div className="row-actions">
          <button className="btn-primary" type="submit" disabled={saving}>
            {saving ? 'Saving…' : editingId ? 'Save changes' : 'Create project'}
          </button>
          {editingId ? (
            <button type="button" onClick={cancelEdit} disabled={saving}>
              Cancel
            </button>
          ) : null}
        </div>
      </form>

      {loading ? (
        <div className="empty-state">Loading projects…</div>
      ) : projects.length === 0 ? (
        <EmptyState title="No projects yet">
          Create one above, then add tasks on the Tasks page.
        </EmptyState>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Status</th>
                <th>Owner</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={idOf(project)}>
                  <td>
                    <strong>{project.name}</strong>
                    {project.description ? (
                      <div className="cell-muted">{project.description}</div>
                    ) : null}
                  </td>
                  <td>
                    <span className={`pill pill-${project.status}`}>
                      {project.status}
                    </span>
                  </td>
                  <td>{nameOf(project.owner)}</td>
                  <td className="row-actions">
                    <button type="button" onClick={() => startEdit(project)}>
                      Edit
                    </button>
                    <button
                      className="btn-danger"
                      type="button"
                      onClick={() => handleDelete(project)}
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

export default Projects
