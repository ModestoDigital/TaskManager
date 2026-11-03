import Link from 'next/link';
import { TaskEditForm } from '@/components/tasks/task-edit-form';

export default async function EditTaskPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <main>
      <Link href="/">Back to tasks</Link>
      <h1>Edit task</h1>
      <TaskEditForm id={id} />
    </main>
  );
}
