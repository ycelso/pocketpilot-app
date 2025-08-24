import React from 'react';

interface PageHeaderProps {
  title: string;
  children?: React.ReactNode;
}

export default function PageHeader({ title, children }: PageHeaderProps) {
  return (
    <div className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-card px-4 sm:px-6">
      <h1 className="text-xl font-bold font-headline">{title}</h1>
      <div>{children}</div>
    </div>
  );
}
