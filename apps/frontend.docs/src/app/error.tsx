'use client';

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="p-12">
      <h1>Documentation could not load</h1>
      <button onClick={reset}>Try again</button>
    </main>
  );
}
