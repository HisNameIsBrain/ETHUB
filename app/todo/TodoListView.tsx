"use client";

import { useMemo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { useTodoListPresenter } from "./useTodoListPresenter";

export default function TodoListView() {
  const items = useTodoListPresenter();
  const active = useMemo(() => items.filter((item) => !item.completed), [items]);
  const done = useMemo(() => items.filter((item) => item.completed), [items]);

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-3">Open tasks</h2>
        <ul className="space-y-2">
          {active.map((item) => (
            <li key={item.id} className="flex items-center gap-2">
              <Checkbox checked={false} aria-label={`Mark ${item.title} complete`} />
              <span>{item.title}</span>
            </li>
          ))}
          {active.length === 0 && <p className="text-sm text-muted-foreground">No open tasks.</p>}
        </ul>
      </Card>
      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-3">Completed</h2>
        <ul className="space-y-2">
          {done.map((item) => (
            <li key={item.id} className="flex items-center gap-2 opacity-70">
              <Checkbox checked readOnly aria-label={`Mark ${item.title} incomplete`} />
              <span className="line-through">{item.title}</span>
            </li>
          ))}
          {done.length === 0 && <p className="text-sm text-muted-foreground">No completed tasks yet.</p>}
        </ul>
      </Card>
    </div>
  );
}
