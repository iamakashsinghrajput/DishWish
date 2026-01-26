"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect } from "react";
import { CalendarDaysIcon } from "@heroicons/react/24/solid";

export default function MealPlansPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/session/new?callbackUrl=/dashboard/meal-plans");
    }
  }, [status, router]);

  if (status === "loading" || !session) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-theme(space.32))]"><p className="text-xl">Loading Meal Plans...</p></div>;
  }

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-800">My Meal Plans</h1>
        <p className="mt-1 text-sm text-slate-600">
          Organize your weekly or monthly meals. (Feature coming soon!)
        </p>
      </header>
      
      <div className="text-center bg-white shadow-lg rounded-lg p-12">
            <CalendarDaysIcon className="mx-auto h-12 w-12 text-sky-400" />
            <h3 className="mt-2 text-lg font-medium text-slate-900">Meal Planning Coming Soon!</h3>
            <p className="mt-1 text-sm text-gray-500">
              We&apos;re working on an exciting meal planning feature. Stay tuned!
            </p>
      </div>
      <div className="mt-8">
            <Link href="/dashboard" className="text-sm font-medium text-orange-600 hover:text-orange-500">
                ← Back to Overview
            </Link>
        </div>
    </div>
  );
}