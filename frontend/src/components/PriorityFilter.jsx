import React from 'react';

const PRIORITIES = ['All', 'Low', 'Medium', 'High'];

export default function PriorityFilter({ selectedPriority, onSelectPriority }) {
  return (
    <div className="priority-filter-group" role="group" aria-label="Filter tasks by priority">
      <span className="filter-label">Filter Priority:</span>
      <div className="filter-buttons">
        {PRIORITIES.map(priority => {
          const isActive = selectedPriority === priority;
          return (
            <button
              key={priority}
              type="button"
              className={`filter-btn ${isActive ? 'active' : ''} priority-${priority.toLowerCase()}`}
              onClick={() => onSelectPriority(priority)}
              aria-pressed={isActive}
            >
              {priority}
            </button>
          );
        })}
      </div>
    </div>
  );
}
