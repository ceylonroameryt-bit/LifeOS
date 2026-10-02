import { Profile } from "@/types";
import { list, update, reportError } from "./store";
export const profileService = {
  async getProfile(): Promise<Profile> {
    const rows = await list<Profile>("profiles");
    if (!rows[0])
      return reportError("Profile is missing. Apply the database migrations.");
    return rows[0];
  },
  async updateName(name: string): Promise<Profile> {
    const profile = await this.getProfile();
    return update<Profile>(
      "profiles",
      profile.id,
      { name: name.trim() },
      "profile",
    );
  },
};
