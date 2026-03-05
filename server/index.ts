import express from 'express';
import Database from 'better-sqlite3';
import cors from 'cors';

const app = express();
const PORT = 3001;

// Initialize SQLite database
const db = new Database('todos.db');

// Create todos table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    completed INTEGER DEFAULT 0
  )
`);

// Middleware
app.use(cors());
app.use(express.json());

// API Routes

// Get all todos
app.get('/api/todos', (req, res) => {
  try {
    const todos = db.prepare('SELECT * FROM todos').all();
    res.json(todos);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Add a new todo
app.post('/api/todos', (req, res) => {
  const { title } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }
  try {
    const info = db.prepare('INSERT INTO todos (title) VALUES (?)').run(title);
    const newTodo = db.prepare('SELECT * FROM todos WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json(newTodo);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update a todo
app.put('/api/todos/:id', (req, res) => {
  const { id } = req.params;
  const { title, completed } = req.body;

  let queryParts: string[] = [];
  const params: (string | number)[] = [];

  if (title !== undefined) {
    queryParts.push('title = ?');
    params.push(title);
  }
  if (completed !== undefined) {
    queryParts.push('completed = ?');
    params.push(completed ? 1 : 0);
  }

  if (queryParts.length === 0) {
    return res.status(400).json({ error: 'No fields to update provided' });
  }

  const query = `UPDATE todos SET ${queryParts.join(', ')} WHERE id = ?`;
  params.push(id);

  try {
    const info = db.prepare(query).run(...params);
    if (info.changes === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    const updatedTodo = db.prepare('SELECT * FROM todos WHERE id = ?').get(id);
    res.json(updatedTodo);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a todo
app.delete('/api/todos/:id', (req, res) => {
  const { id } = req.params;
  try {
    const info = db.prepare('DELETE FROM todos WHERE id = ?').run(id);
    if (info.changes === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    res.status(204).send(); // No content for successful deletion
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
