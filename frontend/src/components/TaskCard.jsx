import React from 'react';

export default function TaskCard({ task, columns, onEdit, onDelete, onMove }) {
  const otherColumns = columns.filter((col) => col.id !== task.column_id);

  const handleDelete = () => {
    const confirmed = window.confirm(`Are you sure you want to delete the task "${task.title}"?`);
    if (confirmed) {
      onDelete(task.id);
    }
  };

  const handleMoveChange = (e) => {
    const targetColId = Number(e.target.value);
    if (targetColId && targetColId !== task.column_id) {
      onMove(task.id, targetColId);
    }
  };

  const priorityClass = `badge-priority-${(task.priority || 'medium').toLowerCase()}`;

  return (
    <div className="task-card">
      <div className="task-card-header">
        <h4 className="task-title">{task.title}</h4>
        <span className={`priority-badge ${priorityClass}`}>
          {task.priority || 'Medium'}
        </span>
      </div>

      {task.description && (
        <p className="task-description">{task.description}</p>
      )}

      <div className="task-card-footer">
        <div className="task-move-control">
          <label htmlFor={`move-select-${task.id}`} className="sr-only">
            Move task to column
          </label>
          <select
            id={`move-select-${task.id}`}
            className="move-select"
            value={task.column_id}
            onChange={handleMoveChange}
            aria-label="Move task to another column"
          >
            <option value={task.column_id} disabled>
              Move to...
            </option>
            {otherColumns.map((col) => (
              <option key={col.id} value={col.id}>
                → {col.name}
              </option>
            ))}
          </select>
        </div>

        <div className="task-card-actions">
          <button
            type="button"
            className="action-btn edit-btn"
            onClick={() => onEdit(task)}
            title="Edit task"
            aria-label={`Edit task ${task.title}`}
          >
            Edit
          </button>
          <button
            type="button"
            className="action-btn delete-btn"
            onClick={handleDelete}
            title="Delete task"
            aria-label={`Delete task ${task.title}`}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
