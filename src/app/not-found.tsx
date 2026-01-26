import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center text-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          {/* Optional: Add a relevant image like a confused chef or empty plate */}
          {/* <Image src="/path-to-your-404-image.svg" alt="Page Not Found" width={200} height={200} className="mx-auto" /> */}
          <h1 className="mt-6 text-6xl font-extrabold text-orange-600">404</h1>
          <h2 className="mt-2 text-3xl font-bold text-slate-800">Oops! Page Not Found.</h2>
          <p className="mt-4 text-lg text-slate-600">
            It seems the recipe for this page doesn&apos;t exist, or maybe it got moved to a different cookbook.
          </p>
        </div>
        <div className="mt-10">
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
          >
            Go back to Homepage
          </Link>
        </div>
        <p className="mt-8 text-sm text-slate-500">
          If you think this is an error, please{' '}
          <Link href="/contact" className="font-medium text-orange-500 hover:text-orange-400">
            contact support
          </Link>.
        </p>
      </div>
    </div>
  );
}