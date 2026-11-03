import type { Metadata } from 'next';
import { TRPCReactProvider } from '@/trpc/client';
import './globals.css';

export const metadata: Metadata = {
  title: 'TaskManager',
  description: 'A task management technical challenge.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <TRPCReactProvider>{children}</TRPCReactProvider>
      </body>
    </html>
  );
}
