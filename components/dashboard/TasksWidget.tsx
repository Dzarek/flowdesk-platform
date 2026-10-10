import Link from "next/link";
import {
  MdOutlineArrowForward,
  MdOutlineCheckCircle,
  MdOutlineSchedule,
} from "react-icons/md";

type Task = {
  id: number;
  title: string;
  dueDate: string;
  completed: boolean;
};

type TasksWidgetProps = {
  tasks: Task[];
};

export default function TasksWidget({ tasks }: TasksWidgetProps) {
  const activeTasks = tasks.filter((task) => !task.completed);
  const visibleTasks = activeTasks.slice(0, 3);
  const remainingTasks = activeTasks.length - visibleTasks.length;

  return (
    <Link
      href="/tasks"
      className="
        group
        flex
        h-full
        flex-col
        rounded-3xl
        border
        border-border
        bg-card
        p-6
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-primary/40
        hover:shadow-lg
      "
    >
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <MdOutlineCheckCircle size={24} />
        </div>

        <div>
          <h2 className="font-semibold">Zadania</h2>

          <p className="text-sm text-muted-foreground">
            {activeTasks.length > 0
              ? `${activeTasks.length} do wykonania`
              : "Wszystko zrobione"}
          </p>
        </div>
      </div>

      {/* Tasks */}
      <div className="flex-1 space-y-3">
        {visibleTasks.length === 0 ? (
          <div className="rounded-xl bg-muted p-4 text-sm text-muted-foreground">
            🎉 Wszystkie zadania wykonane.
          </div>
        ) : (
          visibleTasks.map((task) => (
            <div
              key={task.id}
              className="flex items-start gap-3 rounded-xl bg-muted/50 p-3"
            >
              <div className="mt-0.5 h-4 w-4 shrink-0 rounded-full border-2 border-primary/60" />

              <div className="min-w-0">
                <p className="truncate font-medium">{task.title}</p>

                <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <MdOutlineSchedule size={14} />

                  {task.dueDate}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Remaining tasks */}
      {remainingTasks > 0 && (
        <p className="mt-4 text-sm text-muted-foreground">
          + {remainingTasks} kolejne zadania
        </p>
      )}

      {/* Footer */}
      <div className="mt-6 flex items-center gap-2 text-sm font-medium text-primary">
        Zobacz wszystkie zadania
        <MdOutlineArrowForward
          size={18}
          className="transition-transform duration-300 group-hover:translate-x-1"
        />
      </div>
    </Link>
  );
}
