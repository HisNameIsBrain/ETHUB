"use client";

import { useState } from "react";

type Todo = {
  id: string;
  title: string;
  completed: boolean;
};

export function useTodoListPresenter() {
  const [todos, setTodos] = useState<Todo[]>([]);

  const addTodo = (title: string) => {
    setTodos((prev) => [...prev, { id: crypto.randomUUID(), title, completed: false }]);
  };

  const toggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo))
    );
  };

  return { todos, addTodo, toggleTodo };
}
