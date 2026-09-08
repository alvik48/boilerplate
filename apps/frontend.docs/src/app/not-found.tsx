import Link from 'next/link';
export default function NotFound() {
  return (
    <main className="mx-auto max-w-2xl p-12">
      <h1 className="text-2xl font-semibold">Document not found</h1>
      <p>
        This page may have moved. <Link href="/docs">Open the documentation index</Link> to find its current location.
      </p>
    </main>
  );
}
