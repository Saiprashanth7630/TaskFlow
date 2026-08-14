import React, { useState, useEffect, useCallback } from 'react';
import { api } from './api/client';
import Board from './components/Board';
import TaskModal from './components/TaskModal';
import ErrorBanner from './components/ErrorBanner';

export default function App() {
  const [board, setBoard] = useState(null);
  const [columnCounts, setColumnCounts] = useState({});
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  
  const [modalState, setModalState] = useState({
    isOpen: false,
    task: null,
    defaultColumnId: null
  });

  // Fetch full board data & column counts (SQL Query 1)
  const fetchBoardData = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const boardData = await api.getBoard();
      setBoard(boardData);

      if (boardData && boardData.id) {
        // Fetch hand-written query #1: Column task counts
        try {
          const countsArray = await api.getColumnTaskCounts(boardData.id);
          const countMap = {};
          countsArray.forEach((c) => {
            countMap[c.column_id] = c.task_count;
          });
          setColumnCounts(countMap);
        } catch (cntErr) {
          console.warn('Failed to load column task counts:', cntErr);
        }
      }
      setErrorMessage('');
    } catch (err) {
      console.error('Failed to load board:', err);
      setErrorMessage(err.message || 'Failed to connect to backend server. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBoardData(true);
  }, [fetchBoardData]);

  // When priority filter changes to a specific priority, we also verify with SQL Query 2 endpoint
  const handleSelectPriority = async (priority) => {
    setSelectedPriority(priority);
    if (priority !== 'All' && board?.id) {
      try {
        // Query hand-written query #2 endpoint
        await api.getTasksByPriority(board.id, priority);
      } catch (err) {
        console.warn('Priority query error:', err);
      }
    }
  };

  // Open modal to create task (optionally for a specific column)
  const handleOpenCreateModal = (defaultColId = null) => {
    setModalState({
      isOpen: true,
      task: null,
      defaultColumnId: defaultColId || (board?.columns[0]?.id || null)
    });
  };

  // Open modal to edit an existing task
  const handleOpenEditModal = (task) => {
    setModalState({
      isOpen: true,
      task,
      defaultColumnId: task.column_id
    });
  };

  const handleCloseModal = () => {
    setModalState({
      isOpen: false,
      task: null,
      defaultColumnId: null
    });
  };

  // Create or Update task submission
  const handleModalSubmit = async (taskFormData) => {
    try {
      if (modalState.task) {
        // Update existing task
        await api.updateTask(modalState.task.id, taskFormData);
      } else {
        // Create new task
        await api.createTask(taskFormData);
      }
      handleCloseModal();
      await fetchBoardData(false);
      setErrorMessage('');
    } catch (err) {
      console.error('Task save error:', err);
      setErrorMessage(err.message || 'Failed to save task.');
    }
  };

  // Move task to a different column
  const handleMoveTask = async (taskId, targetColumnId) => {
    try {
      await api.moveTask(taskId, targetColumnId);
      await fetchBoardData(false);
      setErrorMessage('');
    } catch (err) {
      console.error('Task move error:', err);
      setErrorMessage(err.message || 'Failed to move task.');
    }
  };

  // Delete task
  const handleDeleteTask = async (taskId) => {
    try {
      await api.deleteTask(taskId);
      await fetchBoardData(false);
      setErrorMessage('');
    } catch (err) {
      console.error('Task delete error:', err);
      setErrorMessage(err.message || 'Failed to delete task.');
    }
  };

  return (
    <div className="app-layout">
      <ErrorBanner
        message={errorMessage}
        onClose={() => setErrorMessage('')}
      />

      <Board
        board={board}
        columnCounts={columnCounts}
        selectedPriority={selectedPriority}
        onSelectPriority={handleSelectPriority}
        onNewTask={() => handleOpenCreateModal()}
        onAddTaskToColumn={(colId) => handleOpenCreateModal(colId)}
        onEditTask={handleOpenEditModal}
        onDeleteTask={handleDeleteTask}
        onMoveTask={handleMoveTask}
        onRefresh={() => fetchBoardData(true)}
        loading={loading}
      />

      <TaskModal
        isOpen={modalState.isOpen}
        onClose={handleCloseModal}
        onSubmit={handleModalSubmit}
        task={modalState.task}
        columns={board?.columns || []}
        defaultColumnId={modalState.defaultColumnId}
      />
    </div>
  );
}
