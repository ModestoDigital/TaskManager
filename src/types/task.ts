export type Task = {
  id: string;
  titulo: string;
  descricao?: string;
  dataCriacao: string;
};

export type TaskCursor = Pick<Task, 'dataCriacao' | 'id'>;

export type TaskPage = {
  items: Task[];
  nextCursor?: string;
};
