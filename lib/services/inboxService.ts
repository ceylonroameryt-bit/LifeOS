import { InboxItem } from "@/types";
import { list, insert, remove, convertCapture } from "./store";
export const inboxService = {
  async getItems(): Promise<InboxItem[]> {
    return await list<InboxItem>("inbox_items");
  },

  async createItem(
    content: string,
    suggested_type: string = "Task",
  ): Promise<InboxItem> {
    return insert<InboxItem>(
      "inbox_items",
      { content: content.trim(), suggested_type, status: "inbox" },
      "inbox",
    );
  },

  convertToTask: (id: string) => convertCapture("inbox_items", id, "task"),

  convertToIdea: (id: string) => convertCapture("inbox_items", id, "idea"),

  convertToWishlist: (id: string) =>
    convertCapture("inbox_items", id, "wishlist"),

  convertToNote: (id: string) => convertCapture("inbox_items", id, "note"),

  async deleteItem(id: string): Promise<void> {
    await remove("inbox_items", id, "inbox");
  },
};
