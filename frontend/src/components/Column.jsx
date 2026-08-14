import React from 'react';
import TaskCard from './TaskCard';

export default function Column({
  column,
  allColumns,
  taskCount,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onMoveTask
}) {
  const tasks = column.tasks || [];
  const countToDisplay = taskCount !== undefined ? taskCount : tasks.length;

  return (
    <section className="board-column" aria-labelledby={`col-heading-${column.id}`}>
      <div className="column-header">
        <div className="column-title-wrap">
          <h3 id={`col-heading-${column.id}`} className="column-title">
            {column.name}
          </h3>
          <span className="task-count-badge" title={`${countToDisplay} tasks`}>
            {countToDisplay}
          </span>
        </div>
        <button
          type="button"
          className="add-task-btn"
          onClick={() => onAddTask(column.id)}
          title={`Add task to ${column.name}`}
          aria-label={`Add task to ${column.name}`}
        >
          + Add
        </button>
      </div>

      <div className="task-list">
        {tasks.length === 0 ? (
          <div className="empty-column-state">
            <span>No tasks</span>
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              columns={allColumns}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
              onMove={onMoveTask}
            />
          ))
        )}
      </div>
    </section>
  );
}
