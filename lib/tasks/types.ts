export type Task = {
  id: string;
  title: string;
  description: string;
  dueDate: string | null;
  assigneeId: string | null;
  completed: boolean;
  createdAt: string;
};
