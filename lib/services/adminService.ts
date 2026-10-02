import { AdminItem, AdminCategory } from "@/types";
import { list, insert, update, remove } from "./store";
export const adminService = {
  async getAdminItems() {
    return (await list<AdminItem>("admin_items")).map((item) => ({
      ...item,
      days_remaining: Math.max(
        0,
        Math.ceil((new Date(item.due_date).getTime() - Date.now()) / 86400000),
      ),
    }));
  },
  createItem: (input: {
    title: string;
    category: AdminCategory;
    due_date: string;
    cost?: string;
    notes?: string;
  }) => insert<AdminItem>("admin_items", input, "admin"),
  async toggleStatus(id: string) {
    const item = (await this.getAdminItems()).find((i) => i.id === id);
    if (!item) throw new Error("Item not found");
    await update(
      "admin_items",
      id,
      { status: item.status === "active" ? "completed" : "active" },
      "admin",
    );
  },
  deleteItem: (id: string) => remove("admin_items", id, "admin"),
};
