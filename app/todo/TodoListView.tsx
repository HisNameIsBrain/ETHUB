"use client";

import { useTodoListPresenter } from "./useTodoListPresenter";

export function TodoListView() {
  const { todos, toggleTodo, addTodo } = useTodoListPresenter();

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-xl font-semibold">Todos</h1>
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          const title = String(formData.get("title") || "").trim();
          if (title) addTodo(title);
          e.currentTarget.reset();
        }}
      >
        <input
          name="title"
          className="flex-1 rounded border border-slate-300 px-3 py-2 text-sm"
          placeholder="Add a new todo"
        />
        <button className="rounded bg-blue-600 px-3 py-2 text-sm text-white" type="submit">
          Add
        </button>
      </form>

      <ul className="space-y-2">
        {todos.map((todo) => (
          <li key={todo.id} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
            />
            <span className={todo.completed ? "line-through text-slate-500" : ""}>{todo.title}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
