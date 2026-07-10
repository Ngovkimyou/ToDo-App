import { useState } from "react";
import { useTasks } from "../context/useTasks";
import BinTaskCard from "../components/BinTaskCard";
import HomeDeleteConfirm from "../components/HomeDeleteConfirm";
import emptyItemIcon from "../assets/empty-item.avif";
import { groupTasksByCategory } from "../utils/tasks";

import "./RecyclingBin.css";

function RecyclingBin() {
  const { deletedTasks, restoreTask, deleteTaskForever, restoreTasks, deleteTasksForever } =
    useTasks();
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [pendingBulkAction, setPendingBulkAction] = useState(null);

  //================ Deleted Task Grouping ================
  const taskGroups = Object.entries(groupTasksByCategory(deletedTasks));

  //================ Bulk Selection Actions ================
  function toggleSelectAll() {
    if (selectMode) {
      setSelectMode(false);
      setSelectedIds(new Set());
    } else {
      setSelectMode(true);
      setSelectedIds(new Set(deletedTasks.map((task) => task.id)));
    }
  }

  function toggleSelectOne(id) {
    setSelectedIds((current) => {
      const next = new Set(current);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  }

  function exitSelectMode() {
    setSelectMode(false);
    setSelectedIds(new Set());
  }

  return (
    <div className="bin-page">
      <h1 className="page-title">Recycling Bin</h1>

      {taskGroups.length === 0 ? (
        <div className="bin-empty-state">
          <img src={emptyItemIcon} alt="" />
          <p>Your Recycling Bin is empty...</p>
        </div>
      ) : (
        <>
          <div className="bin-toolbar">
            <button
              className="bin-select-toggle"
              type="button"
              onClick={toggleSelectAll}
            >
              {selectMode ? "Unselect All" : "Select All"}
            </button>

            {selectMode && (
              <div className="bin-bulk-actions">
                <button
                  className="bin-bulk-button is-restore"
                  type="button"
                  disabled={selectedIds.size === 0}
                  onClick={() => setPendingBulkAction("restore")}
                >
                  Restore
                </button>
                <button
                  className="bin-bulk-button is-danger"
                  type="button"
                  disabled={selectedIds.size === 0}
                  onClick={() => setPendingBulkAction("delete")}
                >
                  Delete
                </button>
              </div>
            )}
          </div>

          <section className="bin-task-list" aria-label="Deleted tasks">
            {taskGroups.map(([category, categoryTasks]) => (
              <BinTaskCard
                key={category}
                category={category}
                tasks={categoryTasks}
                selectMode={selectMode}
                selectedIds={selectedIds}
                onTaskRestore={(task) => restoreTask(task.id)}
                onTaskDelete={setTaskToDelete}
                onTaskToggleSelect={toggleSelectOne}
              />
            ))}
          </section>
        </>
      )}

      <HomeDeleteConfirm
        task={taskToDelete}
        heading="Delete Forever?"
        onCancel={() => setTaskToDelete(null)}
        onConfirm={() => {
          deleteTaskForever(taskToDelete.id);
          setTaskToDelete(null);
        }}
      />

      <HomeDeleteConfirm
        open={pendingBulkAction === "restore"}
        heading="Restore all?"
        confirmVariant="neutral"
        onCancel={() => setPendingBulkAction(null)}
        onConfirm={() => {
          restoreTasks([...selectedIds]);
          setPendingBulkAction(null);
          exitSelectMode();
        }}
      />

      <HomeDeleteConfirm
        open={pendingBulkAction === "delete"}
        heading="Permanently delete all?"
        onCancel={() => setPendingBulkAction(null)}
        onConfirm={() => {
          deleteTasksForever([...selectedIds]);
          setPendingBulkAction(null);
          exitSelectMode();
        }}
      />
    </div>
  );
}

export default RecyclingBin;
