import express from 'express';
import { 
  createTask, 
  updateTask, 
  moveTask, 
  deleteTask 
} from '../db/queries.js';

const router = express.Router();

const VALID_PRIORITIES = ['Low', 'Medium', 'High'];

// POST /api/tasks - Create a new task
router.post('/', (req, res) => {
  try {
    const { column_id, title, description, priority } = req.body;

    // Validate title: Reject empty or whitespace-only strings
    if (typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ 
        error: 'Title is required and cannot be empty or whitespace only' 
      });
    }

    // Validate column_id
    const colId = parseInt(column_id, 10);
    if (isNaN(colId) || colId <= 0) {
      return res.status(400).json({ 
        error: 'A valid numeric column_id is required' 
      });
    }

    // Validate priority if provided
    let taskPriority = 'Medium';
    if (priority !== undefined) {
      if (!VALID_PRIORITIES.includes(priority)) {
        return res.status(400).json({ 
          error: `Priority must be one of: ${VALID_PRIORITIES.join(', ')}` 
        });
      }
      taskPriority = priority;
    }

    const newTask = createTask({
      column_id: colId,
      title: title.trim(),
      description: description ? description.trim() : '',
      priority: taskPriority
    });

    return res.status(201).json(newTask);
  } catch (error) {
    if (error.message && error.message.includes('does not exist')) {
      return res.status(404).json({ error: error.message });
    }
    return res.status(500).json({ error: error.message || 'Failed to create task' });
  }
});

// PUT /api/tasks/:id - Edit an existing task
router.put('/:id', (req, res) => {
  try {
    const taskId = parseInt(req.params.id, 10);
    if (isNaN(taskId)) {
      return res.status(400).json({ error: 'Invalid task ID' });
    }

    const { title, description, priority, column_id } = req.body;

    // If title is provided, ensure it is not empty or whitespace
    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim() === '') {
        return res.status(400).json({ 
          error: 'Title cannot be empty or whitespace only' 
        });
      }
    }

    // If priority is provided, ensure it is valid
    if (priority !== undefined && !VALID_PRIORITIES.includes(priority)) {
      return res.status(400).json({ 
        error: `Priority must be one of: ${VALID_PRIORITIES.join(', ')}` 
      });
    }

    const updatedTask = updateTask(taskId, {
      title,
      description,
      priority,
      column_id: column_id !== undefined ? parseInt(column_id, 10) : undefined
    });

    if (!updatedTask) {
      return res.status(404).json({ error: `Task with ID ${taskId} not found` });
    }

    return res.json(updatedTask);
  } catch (error) {
    if (error.message && error.message.includes('does not exist')) {
      return res.status(404).json({ error: error.message });
    }
    return res.status(500).json({ error: error.message || 'Failed to update task' });
  }
});

// PATCH /api/tasks/:id/move - Move task to a different column
router.patch('/:id/move', (req, res) => {
  try {
    const taskId = parseInt(req.params.id, 10);
    if (isNaN(taskId)) {
      return res.status(400).json({ error: 'Invalid task ID' });
    }

    const { column_id } = req.body;
    const colId = parseInt(column_id, 10);
    if (isNaN(colId) || colId <= 0) {
      return res.status(400).json({ error: 'A valid numeric column_id is required' });
    }

    const movedTask = moveTask(taskId, colId);
    if (!movedTask) {
      return res.status(404).json({ error: `Task with ID ${taskId} not found` });
    }

    return res.json(movedTask);
  } catch (error) {
    if (error.message && error.message.includes('does not exist')) {
      return res.status(404).json({ error: error.message });
    }
    return res.status(500).json({ error: error.message || 'Failed to move task' });
  }
});

// PATCH /api/tasks/:id - Generic partial update / move
router.patch('/:id', (req, res) => {
  try {
    const taskId = parseInt(req.params.id, 10);
    if (isNaN(taskId)) {
      return res.status(400).json({ error: 'Invalid task ID' });
    }

    const { column_id, title, description, priority } = req.body;

    if (column_id !== undefined && title === undefined && description === undefined && priority === undefined) {
      const colId = parseInt(column_id, 10);
      if (isNaN(colId) || colId <= 0) {
        return res.status(400).json({ error: 'A valid numeric column_id is required' });
      }
      const movedTask = moveTask(taskId, colId);
      if (!movedTask) {
        return res.status(404).json({ error: `Task with ID ${taskId} not found` });
      }
      return res.json(movedTask);
    }

    if (title !== undefined && (typeof title !== 'string' || title.trim() === '')) {
      return res.status(400).json({ error: 'Title cannot be empty or whitespace only' });
    }

    if (priority !== undefined && !VALID_PRIORITIES.includes(priority)) {
      return res.status(400).json({ error: `Priority must be one of: ${VALID_PRIORITIES.join(', ')}` });
    }

    const updatedTask = updateTask(taskId, {
      title,
      description,
      priority,
      column_id: column_id !== undefined ? parseInt(column_id, 10) : undefined
    });

    if (!updatedTask) {
      return res.status(404).json({ error: `Task with ID ${taskId} not found` });
    }

    return res.json(updatedTask);
  } catch (error) {
    if (error.message && error.message.includes('does not exist')) {
      return res.status(404).json({ error: error.message });
    }
    return res.status(500).json({ error: error.message || 'Failed to update task' });
  }
});

// DELETE /api/tasks/:id - Delete task
router.delete('/:id', (req, res) => {
  try {
    const taskId = parseInt(req.params.id, 10);
    if (isNaN(taskId)) {
      return res.status(400).json({ error: 'Invalid task ID' });
    }

    const deleted = deleteTask(taskId);
    if (!deleted) {
      return res.status(404).json({ error: `Task with ID ${taskId} not found` });
    }

    return res.json({ message: 'Task deleted successfully', id: taskId });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Failed to delete task' });
  }
});

export default router;
