import { Idea } from "@/types";
import { list, insert, update, remove, convertCapture } from "./store";
import { taskService } from "./taskService";
export const ideaService = {
  getIdeas: () => list<Idea>("ideas"),
  createIdea: (input: { title: string; content?: string; category?: string }) =>
    insert<Idea>(
      "ideas",
      { ...input, category: input.category || "General", status: "Saved" },
      "ideas",
    ),
  updateStatus: (id: string, status: Idea["status"]) =>
    update<Idea>("ideas", id, { status }, "ideas"),
  deleteIdea: (id: string) => remove("ideas", id, "ideas"),
  convertToTask: (id: string) => convertCapture("ideas", id, "task"),
};
