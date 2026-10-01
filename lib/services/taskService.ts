import { Task, Priority } from "@/types";
import { list, insert, update, remove } from "./store";
export const taskService = {
  getTasks: () => list<Task>("tasks"),
  createTask: (input: {
    title: string;
    notes?: string;
    due_date?: string;
    due_time?: string | null;
    priority?: Priority;
  }) =>
    insert<Task>(
      "tasks",
      {
        ...input,
        title: input.title.trim(),
        due_date: input.due_date || new Date().toISOString().slice(0, 10),
        priority: input.priority || "Normal",
        completed: false,
      },
      "tasks",
    ),
  async toggleTask(id: string) {
    const task = (await this.getTasks()).find((t) => t.id === id);
    if (!task) throw new Error("Task not found");
    return update<Task>(
      "tasks",
      id,
      {
        completed: !task.completed,
        completed_at: task.completed ? null : new Date().toISOString(),
      },
      "tasks",
    );
  },
  deleteTask: (id: string) => remove("tasks", id, "tasks"),
};
