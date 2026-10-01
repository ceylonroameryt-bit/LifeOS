import { Goal } from "@/types";
import { list, insert, update } from "./store";
export const goalService = {
  getGoals: () => list<Goal>("goals"),
  createGoal: (input: {
    title: string;
    category: Goal["category"];
    target_value?: string;
    next_action?: string;
  }) =>
    insert<Goal>(
      "goals",
      { ...input, current_value: "", progress_percentage: 0 },
      "goals",
    ),
  updateProgress: (id: string, progress: number) =>
    update<Goal>(
      "goals",
      id,
      { progress_percentage: Math.min(100, Math.max(0, progress)) },
      "goals",
    ),
};
