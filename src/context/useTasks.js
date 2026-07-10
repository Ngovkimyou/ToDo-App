import { useContext } from "react";
import { TaskContext } from "./task-context";

// Small hook wrapper keeps context access consistent across pages.
export function useTasks() {
  return useContext(TaskContext);
}
