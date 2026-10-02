import { WishlistItem } from "@/types";
import { list, insert, update, remove } from "./store";
type Row = WishlistItem & { item_name: string };
const map = (row: Row): WishlistItem => ({
  ...row,
  title: row.item_name,
  hours_remaining: Math.max(
    0,
    (new Date(row.available_after).getTime() - Date.now()) / 3600000,
  ),
});
export const wishlistService = {
  async getWishlist() {
    return (await list<Row>("wishlist_items")).map(map);
  },
  async createItem(input: {
    title: string;
    price: number;
    url?: string;
    notes?: string;
    wait_hours?: number;
  }) {
    const hours = input.wait_hours ?? 48;
    return map(
      await insert<Row>(
        "wishlist_items",
        {
          item_name: input.title,
          price: input.price,
          url: input.url,
          notes: input.notes,
          wait_duration_hours: hours,
          available_after: new Date(Date.now() + hours * 3600000).toISOString(),
        },
        "wishlist",
      ),
    );
  },
  updateStatus: (id: string, status: WishlistItem["status"]) =>
    update("wishlist_items", id, { status }, "wishlist"),
  deleteItem: (id: string) => remove("wishlist_items", id, "wishlist"),
};
