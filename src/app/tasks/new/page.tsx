import Link from 'next/link';
import { TaskForm } from '@/components/tasks/task-form';

export default function NewTaskPage() {
  return (
    <main className="task-page">
      <Link className="back-link" href="/">← Back to tasks</Link>
      <h1>Create task</h1>
      <TaskForm />
    </main>
  );
}
