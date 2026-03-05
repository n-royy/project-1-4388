import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Todo } from '../../shared/schema';

const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodoTitle, setNewTodoTitle] = useState<string>('');
  const [editingTodoId, setEditingTodoId] = useState<number | null>(null);
  const [editingTodoTitle, setEditingTodoTitle] = useState<string>('');

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const response = await axios.get<Todo[]>('/api/todos');
      setTodos(response.data);
    } catch (error) {
      console.error('Error fetching todos:', error);
    }
  };

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodoTitle.trim() === '') return;
    try {
      const response = await axios.post<Todo>('/api/todos', { title: newTodoTitle });
      setTodos([...todos, response.data]);
      setNewTodoTitle('');
    } catch (error) {
      console.error('Error adding todo:', error);
    }
  };

  const toggleTodoCompleted = async (id: number, completed: boolean) => {
    try {
      const response = await axios.put<Todo>(`/api/todos/${id}`, { completed: !completed });
      setTodos(todos.map((todo) => (todo.id === id ? response.data : todo)));
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  };

  const deleteTodo = async (id: number) => {
    try {
      await axios.delete(`/api/todos/${id}`);
      setTodos(todos.filter((todo) => todo.id !== id));
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  const startEditing = (todo: Todo) => {
    setEditingTodoId(todo.id);
    setEditingTodoTitle(todo.title);
  };

  const saveEditing = async (id: number) => {
    if (editingTodoTitle.trim() === '') return;
    try {
      const response = await axios.put<Todo>(`/api/todos/${id}`, { title: editingTodoTitle });
      setTodos(todos.map((todo) => (todo.id === id ? response.data : todo)));
      setEditingTodoId(null);
      setEditingTodoTitle('');
    } catch (error) {
      console.error('Error saving todo title:', error);
    }
  };

  const cancelEditing = () => {
    setEditingTodoId(null);
    setEditingTodoTitle('');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-8">Todo App</h1>

        <form onSubmit={addTodo} className="flex gap-2 mb-8">
          <input
            type="text"
            className="flex-grow p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
            placeholder="Add a new todo..."
            value={newTodoTitle}
            onChange={(e) => setNewTodoTitle(e.target.value)}
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-5 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
          >
            Add
          </button>
        </form>

        <ul className="space-y-4">
          {todos.map((todo) => (
            <li
              key={todo.id}
              className="flex items-center bg-gray-50 p-4 rounded-lg shadow-sm transition-all duration-200 ease-in-out"
            >
              <input
                type="checkbox"
                checked={todo.completed === 1}
                onChange={() => toggleTodoCompleted(todo.id, todo.completed === 1)}
                className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
              />
              {
                editingTodoId === todo.id ? (
                  <input
                    type="text"
                    value={editingTodoTitle}
                    onChange={(e) => setEditingTodoTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveEditing(todo.id);
                      if (e.key === 'Escape') cancelEditing();
                    }}
                    className="flex-grow mx-4 p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-400 text-gray-800"
                    autoFocus
                  />
                ) : (
                  <span
                    className={`flex-grow mx-4 text-lg ${todo.completed === 1 ? 'line-through text-gray-500' : 'text-gray-800'}`}
                    onDoubleClick={() => startEditing(todo)}
                  >
                    {todo.title}
                  </span>
                )
              }

              <div className="flex space-x-2 ml-auto">
                {
                  editingTodoId === todo.id ? (
                    <>
                      <button
                        onClick={() => saveEditing(todo.id)}
                        className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-md transition duration-200"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="bg-gray-400 hover:bg-gray-500 text-white p-2 rounded-md transition duration-200"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => startEditing(todo)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white p-2 rounded-md transition duration-200"
                    >
                      Edit
                    </button>
                  )
                }
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-md transition duration-200"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default App;
