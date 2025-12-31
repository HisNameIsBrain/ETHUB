export type TodoItem = {
  id: string;
  title: string;
  completed: boolean;
};

export function useTodoListPresenter(): TodoItem[] {
  return [
    { id: "1", title: "Sample todo", completed: false },
    { id: "2", title: "Follow up with customer", completed: true },
  ];
}
