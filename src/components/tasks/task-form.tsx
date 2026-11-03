'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { useTRPC } from '@/trpc/client';
import type { Task } from '@/types/task';

type TaskFormProps = {
  task?: Task;
};

export function TaskForm({ task }: TaskFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const trpc = useTRPC();
  const [titulo, setTitulo] = useState(task?.titulo ?? '');
  const [descricao, setDescricao] = useState(task?.descricao ?? '');
  const [validationError, setValidationError] = useState<string>();
  const onSuccess = async () => {
    await queryClient.invalidateQueries();
    router.push('/');
    router.refresh();
  };
  const createTask = useMutation(trpc.task.create.mutationOptions({ retry: false, onSuccess }));
  const updateTask = useMutation(trpc.task.update.mutationOptions({ retry: false, onSuccess }));
  const mutation = task ? updateTask : createTask;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedTitle = titulo.trim();

    if (!normalizedTitle) {
      setValidationError('Title is required.');
      return;
    }

    setValidationError(undefined);

    if (task) {
      updateTask.mutate({
        id: task.id,
        titulo: normalizedTitle,
        descricao: descricao === '' ? null : descricao,
      });
      return;
    }

    createTask.mutate({
      titulo: normalizedTitle,
      ...(descricao === '' ? {} : { descricao }),
    });
  }

  return (
    <form className="task-form" onSubmit={submit} noValidate>
      <div className="task-form__field">
        <label htmlFor="task-title">Title</label>
        <input
          id="task-title"
          name="titulo"
          value={titulo}
          onChange={(event) => setTitulo(event.target.value)}
          aria-describedby={validationError ? 'task-title-error' : undefined}
        />
        {validationError ? <p className="task-form__error" id="task-title-error" role="alert">{validationError}</p> : null}
      </div>
      <div className="task-form__field">
        <label htmlFor="task-description">Description</label>
        <textarea
          id="task-description"
          name="descricao"
          value={descricao}
          onChange={(event) => setDescricao(event.target.value)}
        />
      </div>
      {mutation.error ? <p className="task-form__error" role="alert">{mutation.error.message}</p> : null}
      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? 'Saving…' : task ? 'Save changes' : 'Create task'}
      </button>
    </form>
  );
}
