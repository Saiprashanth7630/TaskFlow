import express from 'express';
import { 
  getBoardWithColumnsAndTasks, 
  getFirstBoard, 
  getColumnTaskCounts, 
  getTasksByPriority 
} from '../db/queries.js';

const router = express.Router();

// GET /api/boards - Get first/default board
router.get('/', (req, res) => {
  try {
    const board = getFirstBoard();
    if (!board) {
      return res.status(404).json({ error: 'No boards found' });
    }
    return res.json(board);
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Failed to fetch board' });
  }
});

// GET /api/boards/:id - Get board by ID with columns and tasks
router.get('/:id', (req, res) => {
  try {
    const boardId = parseInt(req.params.id, 10);
    if (isNaN(boardId)) {
      return res.status(400).json({ error: 'Invalid board ID' });
    }

    const board = getBoardWithColumnsAndTasks(boardId);
    if (!board) {
      return res.status(404).json({ error: `Board with ID ${boardId} not found` });
    }

    return res.json(board);
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Failed to fetch board details' });
  }
});

// GET /api/boards/:id/column-task-counts - Hand-written SQL query #1
router.get('/:id/column-task-counts', (req, res) => {
  try {
    const boardId = parseInt(req.params.id, 10);
    if (isNaN(boardId)) {
      return res.status(400).json({ error: 'Invalid board ID' });
    }

    const counts = getColumnTaskCounts(boardId);
    return res.json(counts);
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Failed to fetch column task counts' });
  }
});

// GET /api/boards/:id/tasks-by-priority - Hand-written SQL query #2
router.get('/:id/tasks-by-priority', (req, res) => {
  try {
    const boardId = parseInt(req.params.id, 10);
    if (isNaN(boardId)) {
      return res.status(400).json({ error: 'Invalid board ID' });
    }

    const { priority } = req.query;
    if (!priority || !['Low', 'Medium', 'High'].includes(priority)) {
      return res.status(400).json({ 
        error: "Query parameter 'priority' is required and must be one of: 'Low', 'Medium', 'High'" 
      });
    }

    const tasks = getTasksByPriority(boardId, priority);
    return res.json(tasks);
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Failed to fetch tasks by priority' });
  }
});

export default router;
