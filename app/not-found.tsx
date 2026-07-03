import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <p className="font-display text-6xl font-extrabold text-brand-200">404</p>
      <h1 className="mt-4 font-display text-2xl font-bold text-brand-950">Page not found</h1>
      <p className="mt-2 max-w-md text-brand-800/70">
        The page you&rsquo;re looking for doesn&rsquo;t exist or has moved.
      </p>
      <Link href="/" className="mt-6 rounded-md bg-accent-500 px-6 py-3 text-sm font-semibold text-brand-950 hover:bg-accent-400">
        Back to home
      </Link>
    </div>
  );
}
