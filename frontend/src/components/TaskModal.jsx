import React, { useState, useEffect } from 'react';

const PRIORITIES = ['Low', 'Medium', 'High'];

export default function TaskModal({
  isOpen,
  onClose,
  onSubmit,
  task = null,
  columns = [],
  defaultColumnId = null
}) {
  const isEditing = Boolean(task);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [columnId, setColumnId] = useState(defaultColumnId || (columns[0]?.id || ''));
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setPriority(task.priority || 'Medium');
      setColumnId(task.column_id || (columns[0]?.id || ''));
    } else {
      setTitle('');
      setDescription('');
      setPriority('Medium');
      setColumnId(defaultColumnId || (columns[0]?.id || ''));
    }
    setValidationError('');
  }, [task, defaultColumnId, columns, isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!title || title.trim() === '') {
      setValidationError('Title is required and cannot be empty.');
      return;
    }

    setValidationError('');
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      priority,
      column_id: Number(columnId)
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 id="modal-title">{isEditing ? 'Edit Task' : 'Create New Task'}</h2>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close modal">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {validationError && (
            <div className="inline-error" role="alert">
              {validationError}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="task-title">Title <span className="required">*</span></label>
            <input
              id="task-title"
              type="text"
              className="form-input"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (validationError) setValidationError('');
              }}
              placeholder="e.g. Implement user authentication"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="task-description">Description</label>
            <textarea
              id="task-description"
              className="form-textarea"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details or acceptance criteria (optional)"
            />
          </div>

          <div className="form-row">
            <div className="form-group flex-1">
              <label htmlFor="task-priority">Priority</label>
              <select
                id="task-priority"
                className="form-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div className="form-group flex-1">
              <label htmlFor="task-column">Column</label>
              <select
                id="task-column"
                className="form-select"
                value={columnId}
                onChange={(e) => setColumnId(e.target.value)}
              >
                {columns.map((col) => (
                  <option key={col.id} value={col.id}>{col.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {isEditing ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
