import React, { useState, useEffect } from 'react';
import { Amplify, API, graphqlOperation } from 'aws-amplify';
import { listTodos } from './graphql/queries';
import { createTodo, deleteTodo } from './graphql/mutations';
import config from './aws-exports';
import './App.css';

Amplify.configure(config);

function App() {
  const [todos, setTodos] = useState([]);
  const [formData, setFormData] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const todoData = await API.graphql(graphqlOperation(listTodos));
      setTodos(todoData.data.listTodos.items);
    } catch (err) {
      console.error('Error fetching todos:', err);
    }
  }

  const addTodo = async () => {
    try {
      if (!formData.name || !formData.description) return;
      await API.graphql(graphqlOperation(createTodo, { input: formData }));
      fetchTodos();  // Refresh the list after adding
      setFormData({ name: '', description: '' });  // Clear the form
    } catch (err) {
      console.error('Error adding todo:', err);
    }
  }

  const removeTodo = async (id) => {
    try {
      await API.graphql(graphqlOperation(deleteTodo, { input: { id } }));
      fetchTodos();  // Refresh the list after deleting
    } catch (err) {
      console.error('Error deleting todo:', err);
    }
  }

  const removeAllTodos = async () => {
    try {
      for (const todo of todos) {
        await API.graphql(graphqlOperation(deleteTodo, { input: { id: todo.id } }));
      }
      setTodos([]);  // Clear the list in the UI
    } catch (err) {
      console.error('Error deleting all todos:', err);
    }
  }

  return (
    <div className="App">
      <h1>My Todos</h1>
      <input
        value={formData.name}
        onChange={e => setFormData({ ...formData, 'name': e.target.value })}
        placeholder="Todo name"
      />
      <input
        value={formData.description}
        onChange={e => setFormData({ ...formData, 'description': e.target.value })}
        placeholder="Todo description"
      />
      <button onClick={addTodo}>Add Todo</button>
      <button onClick={removeAllTodos}>Delete All Todos</button>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {
            todos.map(todo => (
              <tr key={todo.id}>
                <td>{todo.name}</td>
                <td>{todo.description}</td>
                <td><button onClick={() => removeTodo(todo.id)}>Delete</button></td>
              </tr>
            ))
          }
        </tbody>
      </table>
    </div>
  );
}

export default App;