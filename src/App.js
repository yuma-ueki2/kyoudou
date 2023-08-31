import React, { useState, useEffect } from 'react';
import { Amplify, API, graphqlOperation } from 'aws-amplify';
import { listTodos } from './graphql/queries';
import { createTodo, deleteTodo } from './graphql/mutations';
import config from './aws-exports';

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
      <div style={{ marginBottom: 30 }}>
        {
          todos.map(todo => (
            <div key={todo.id || todo.name}>
              <h2>{todo.name}</h2>
              <p>{todo.description}</p>
              <button onClick={() => removeTodo(todo.id)}>Delete</button>
            </div>
          ))
        }
      </div>
    </div>
  );
}

export default App;
