import React from 'react';
import Column from './Column';
import PriorityFilter from './PriorityFilter';

export default function Board({
  board,
  columnCounts = {},
  selectedPriority,
  onSelectPriority,
  onNewTask,
  onAddTaskToColumn,
  onEditTask,
  onDeleteTask,
  onMoveTask,
  onRefresh,
  loading
}) {
  if (!board) {
    return (
      <div className="board-loading">
        <p>Loading board data...</p>
      </div>
    );
  }

  // Filter tasks in columns based on priority filter
  const filteredColumns = board.columns.map((column) => {
    const filteredTasks = selectedPriority === 'All'
      ? column.tasks
      : column.tasks.filter((t) => t.priority === selectedPriority);

    return {
      ...column,
      tasks: filteredTasks
    };
  });

  return (
    <div className="board-view">
      <header className="board-topbar">
        <div className="board-info">
          <h1 className="board-heading">{board.name || 'Task Board'}</h1>
          <span className="board-subtitle">Simple, reliable task management</span>
        </div>

        <div className="board-controls">
          <PriorityFilter
            selectedPriority={selectedPriority}
            onSelectPriority={onSelectPriority}
          />

          <div className="topbar-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onRefresh}
              disabled={loading}
              title="Refresh board"
            >
              {loading ? 'Refreshing...' : '↻ Refresh'}
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={onNewTask}
            >
              + New Task
            </button>
          </div>
        </div>
      </header>

      <main className="columns-container">
        {filteredColumns.map((col) => {
          // If viewing All, use columnCounts from SQL Query 1; otherwise use filtered count
          const count = selectedPriority === 'All'
            ? (columnCounts[col.id] ?? col.tasks.length)
            : col.tasks.length;

          return (
            <Column
              key={col.id}
              column={col}
              allColumns={board.columns}
              taskCount={count}
              onAddTask={onAddTaskToColumn}
              onEditTask={onEditTask}
              onDeleteTask={onDeleteTask}
              onMoveTask={onMoveTask}
            />
          );
        })}
      </main>
    </div>
  );
}
