# TaskFlow

A clean, full-stack task board application built with React, Node.js + Express, and SQLite with raw SQL queries.

---

## Application URLs & Endpoints

- **Frontend Web UI**: [http://localhost:3000](http://localhost:3000)
- **Backend API Server**: [http://localhost:5000](http://localhost:5000)

### REST API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Backend health check status |
| `GET` | `/api/boards` | Fetch the default board with all columns and tasks |
| `GET` | `/api/boards/:id` | Fetch a specific board with columns and tasks |
| `GET` | `/api/boards/:id/column-task-counts` | **Hand-written SQL Query 1**: Total task counts per column |
| `GET` | `/api/boards/:id/tasks-by-priority?priority=High` | **Hand-written SQL Query 2**: Tasks filtered by priority (`Low`, `Medium`, `High`), newest first |
| `POST` | `/api/tasks` | Create a new task (validates non-empty title, returns 400 on error) |
| `PUT` | `/api/tasks/:id` | Edit an existing task's title, description, or priority |
| `PATCH` | `/api/tasks/:id/move` | Move a task to a different column (`{ column_id }`) |
| `PATCH` | `/api/tasks/:id` | Partial update / move a task |
| `DELETE` | `/api/tasks/:id` | Delete a task |

---

## Setup & Running Instructions

### Prerequisites
- Node.js (v18+ recommended, v20+ supported)
- npm (v9+)

### 1. Backend Setup & Run

Open a terminal and navigate to `/backend`:

```bash
cd backend
npm install
npm run seed      # Initializes schema and seeds sample board & tasks
npm run dev       # Starts Express backend on http://localhost:5000
```

To run the automated test suite:
```bash
npm test          # Runs 9 backend tests via Vitest & Supertest
```

### 2. Frontend Setup & Run

Open a second terminal and navigate to `/frontend`:

```bash
cd frontend
npm install
npm run dev       # Starts Vite React dev server on http://localhost:3000
```

Open [http://localhost:3000](http://localhost:3000) in your browser to use the app.

---

## Project Structure

```
TaskFlow/
├── backend/
│   ├── src/
│   │   ├── app.js            # Express application & middleware
│   │   ├── server.js         # Server entry point & auto-seed
│   │   ├── db/
│   │   │   ├── schema.sql    # SQLite database schema (Board, Column, Task)
│   │   │   ├── database.js   # better-sqlite3 connection & foreign key setup
│   │   │   ├── queries.js    # Hand-written SQL queries & DB helpers
│   │   │   └── seed.js       # Seed script (1 board, 3 columns, 9 tasks)
│   │   └── routes/
│   │       ├── boardRoutes.js# Board & aggregation endpoints
│   │       └── taskRoutes.js # Task CRUD & move endpoints
│   ├── tests/
│   │   ├── tasks.test.js     # API tests (empty title rejection, moves, CRUD)
│   │   └── queries.test.js   # Direct DB tests for hand-written SQL queries
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js     # API client with error handling
│   │   ├── components/
│   │   │   ├── Board.jsx     # Main board container & column layout
│   │   │   ├── Column.jsx    # Column with task count badge & add button
│   │   │   ├── TaskCard.jsx  # Task card with badge, move selector, actions
│   │   │   ├── TaskModal.jsx # Create/Edit task modal with title validation
│   │   │   ├── PriorityFilter.jsx # Priority filter selector (All/Low/Med/High)
│   │   │   └── ErrorBanner.jsx    # Visible error banner for failed calls
│   │   ├── App.jsx           # Main state orchestrator
│   │   ├── main.jsx          # React entry point
│   │   └── index.css         # Plain, tidy, uncluttered CSS
│   ├── index.html
│   ├── vite.config.js        # Vite config with API proxy
│   └── package.json
└── README.md
```

---

## Hand-Written SQL Queries

TaskFlow deliberately bypasses heavy ORMs in favor of direct, hand-written SQL using `better-sqlite3`:

### 1. Count of tasks per column for a given board
```sql
SELECT 
  c.id AS column_id,
  c.name AS column_name,
  c.position,
  COUNT(t.id) AS task_count
FROM columns c
LEFT JOIN tasks t ON c.id = t.column_id
WHERE c.board_id = ?
GROUP BY c.id, c.name, c.position
ORDER BY c.position ASC;
```

### 2. Tasks with a given priority, ordered newest first
```sql
SELECT 
  t.id,
  t.column_id,
  t.title,
  t.description,
  t.priority,
  t.created_at,
  c.name AS column_name,
  c.position AS column_position
FROM tasks t
JOIN columns c ON t.column_id = c.id
WHERE c.board_id = ? AND t.priority = ?
ORDER BY t.created_at DESC, t.id DESC;
```

---

## Assumptions & Design Decisions

1. **Title Validation**: Whitespace-only strings (e.g. `"   "`) are rejected with HTTP 400 and a descriptive error message on the backend, not just trimmed or checked on the client.
2. **Move Controls**: Replaced complex drag-and-drop libraries with an ergonomic native dropdown selector (`Move to...`) on each card, making moving tasks lightweight, accessible, and error-free on mobile and desktop.
3. **Foreign Keys & Cascading**: SQLite foreign keys are explicitly turned on via `PRAGMA foreign_keys = ON;` in `database.js` so `ON DELETE CASCADE` is strictly enforced.
4. **Auto-Seed on Startup**: If the backend boots with an empty database, it automatically runs the seed script to ensure immediate out-of-the-box functionality.

---

## What I'd Add with More Time

- **Column Management**: Ability for users to add, rename, reorder, or delete columns dynamically.
- **Search & Tagging**: Full-text search and color-coded labels/tags for categorizing tasks.
- **Drag-and-Drop**: Smooth drag-and-drop reordering within and between columns using `@dnd-kit`.
- **Activity Log / History**: Audit trail tracking when a task was moved or modified.

---

## Interesting Thing Learned

In SQLite, foreign key constraint enforcement is disabled by default for backward compatibility. Enabling it requires explicitly running `PRAGMA foreign_keys = ON;` on every database connection before executing operations. Combining this with `better-sqlite3`'s synchronous prepared statements provides transactional speed with zero ORM overhead.
