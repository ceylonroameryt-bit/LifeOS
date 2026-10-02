import { Note } from "@/types";
import { list, insert, remove } from "./store";
export const noteService = {
  getNotes: () => list<Note>("notes"),
  createNote: (input: { title: string; body: string }) =>
    insert<Note>("notes", input, "notes"),
  deleteNote: (id: string) => remove("notes", id, "notes"),
};
