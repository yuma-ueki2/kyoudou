import React, { useState, useEffect } from 'react';
import {Amplify,  API, graphqlOperation } from 'aws-amplify';
import { listTodos } from './graphql/queries';
import { createTodo, deleteTodo } from './graphql/mutations';
import config from './aws-exports';
import './App.css';

Amplify.configure(config);

function App() {
  const [todos, setTodos] = useState([]);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [selectedTodos, setSelectedTodos] = useState([]);

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
      if (!formData.name) return;
      await API.graphql(graphqlOperation(createTodo, { input: formData }));
      setTodos([...todos, formData]);
      setFormData({ name: '', description: '' });
    } catch (err) {
      console.error('Error adding todo:', err);
    }
  }

  const removeTodo = async (id) => {
    try {
      await API.graphql(graphqlOperation(deleteTodo, { input: { id } }));
      const newTodos = todos.filter(todo => todo.id !== id);
      setTodos(newTodos);
    } catch (err) {
      console.error('Error deleting todo:', err);
    }
  }

  const toggleSelected = id => {
    const isAlreadySelected = selectedTodos.includes(id);
    setSelectedTodos(prev => isAlreadySelected ? prev.filter(todoId => todoId !== id) : [...prev, id]);
  };

  const deleteSelectedTodos = async () => {
    for (const id of selectedTodos) {
      await removeTodo(id);
    }
    setSelectedTodos([]);  // Clear selections
  };

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
      <button onClick={fetchTodos}>Fetch Todos</button>

      <table>
        <thead>
          <tr>
            <th>Select</th>
            <th>Name</th>
            <th>Description</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {
            todos.map(todo => (
              <tr key={todo.id || todo.name}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedTodos.includes(todo.id)}
                    onChange={() => toggleSelected(todo.id)}
                  />
                </td>
                <td>{todo.name}</td>
                <td>{todo.description}</td>
                <td><button onClick={() => removeTodo(todo.id)}>Delete</button></td>
              </tr>
            ))
          }
        </tbody>
      </table>
      <button onClick={deleteSelectedTodos}>Delete Selected</button>
    </div>
  );
}


export default App;