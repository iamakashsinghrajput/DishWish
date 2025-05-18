"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BookOpenIcon,
  SparklesIcon,
  CogIcon,
  PlusCircleIcon,
  TagIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";
import { IRecipe } from "@/models/Recipe";

const fetchDashboardData = async () => {
  // const [statsRes, recentRecipesRes] = await Promise.all([
  //   fetch('/api/dashboard/stats'),
  //   fetch('/api/dashboard/recent-recipes?limit=3')
  // ]);
  // const stats = await statsRes.json();
  // const recentRecipes = await recentRecipesRes.json();
  // return { stats, recentRecipes };

  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay
  return {
    stats: {
      totalRecipes: 12,
      aiGenerated: 5,
      favorites: 3,
      thisMonthGenerated: 2,
    },
    recentRecipes: [
      { _id: "1", name: "AI Tomato Pasta Deluxe", createdAt: new Date().toISOString(), cuisine: "Italian", source: "ai" },
      { _id: "2", name: "Quick Vegan Curry Surprise", createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), cuisine: "Indian", source: "user_created" },
      { _id: "3", name: "Breakfast Smoothie Bowl", createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), cuisine: "Healthy", source: "ai" },
    ] as unknown as Partial<IRecipe>[],
  };
};


export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [dashboardData, setDashboardData] = useState<{
    stats: { totalRecipes: number; aiGenerated: number; favorites: number, thisMonthGenerated: number };
    recentRecipes: Partial<IRecipe>[];
  } | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/session/new?callbackUrl=/dashboard");
    }
    if (status === "authenticated" && !dashboardData) {
        setIsLoadingData(true);
        fetchDashboardData()
            .then(data => setDashboardData(data))
            .catch(err => console.error("Failed to load dashboard data:", err))
            .finally(() => setIsLoadingData(false));
    }
  }, [status, router, dashboardData]);


  if (status === "loading" || (status === "authenticated" && isLoadingData)) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-slate-100">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-500"></div>
        <p className="mt-4 text-xl font-semibold text-slate-700">Loading Dashboard...</p>
      </div>
    );
  }

  if (status === "unauthenticated" || !session) {
    return (
        <div className="flex justify-center items-center min-h-screen"><p className="text-xl">Redirecting to login...</p></div>
    );
  }
  
  if (!dashboardData) {
     return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-slate-100">
        <p className="mt-4 text-xl font-semibold text-slate-700">Preparing your dashboard...</p>
      </div>
    );
  }


  const { stats, recentRecipes } = dashboardData;

  return (
    <div className="bg-slate-100 min-h-screen">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold leading-tight text-slate-900">
            Welcome, {session.user?.name?.split(' ')[0] || 'Chef'}!
          </h1>
          <p className="mt-1 text-sm text-slate-500">Here&apos;s your culinary command center.</p>
        </div>
      </header>

      <main className="py-8">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <StatCard title="Total Recipes" value={stats.totalRecipes.toString()} icon={BookOpenIcon} color="text-sky-500" bgColor="bg-sky-50" />
            <StatCard title="AI Generated" value={stats.aiGenerated.toString()} icon={SparklesIcon} color="text-purple-500" bgColor="bg-purple-50" />
            <StatCard title="Favorites" value={stats.favorites.toString()} icon={TagIcon} color="text-yellow-500" bgColor="bg-yellow-50" />
            <StatCard title="Generated This Month" value={stats.thisMonthGenerated.toString()} icon={CalendarDaysIcon} color="text-green-500" bgColor="bg-green-50" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white shadow-lg rounded-xl p-6">
              <h2 className="text-xl font-semibold text-slate-800 mb-1">Recent Recipes</h2>
              <p className="text-sm text-slate-500 mb-6">Your latest culinary adventures and saved ideas.</p>
              {recentRecipes.length > 0 ? (
                <ul className="space-y-4">
                  {recentRecipes.map((recipe, index) => (
                    <li key={recipe._id?.toString() ?? index} className="p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow">
                      <Link href={`/dashboard/my-recipes/${recipe._id}`} className="block group">
                        <div className="flex justify-between items-center">
                            <h3 className="text-md font-semibold text-orange-600 group-hover:underline">
                            {recipe.name}
                            </h3>
                            {recipe.source === 'ai' && <span className="text-xs bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full font-medium">AI</span>}
                        </div>
                        <p className="text-sm text-slate-500 mt-1">
                          {recipe.cuisine && <span className="mr-2">{recipe.cuisine}</span>}
                          {recipe.createdAt && <span>Saved: {new Date(recipe.createdAt).toLocaleDateString()}</span>}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-slate-500 text-center py-8">No recent recipes to display. Start generating some!</p>
              )}
              <div className="mt-6 text-right">
                <Link href="/dashboard/my-recipes" className="text-sm font-medium text-orange-600 hover:text-orange-500">
                  View All My Recipes →
                </Link>
              </div>
            </div>

            <div className="space-y-8">
              <div className="bg-white shadow-lg rounded-xl p-6">
                <h2 className="text-xl font-semibold text-slate-800 mb-4">Quick Actions</h2>
                <div className="space-y-3">
                  <QuickActionLink href="/generate-recipe" icon={PlusCircleIcon} text="Generate New Recipe" />
                  <QuickActionLink href="/dashboard/my-recipes" icon={BookOpenIcon} text="Manage My Recipes" />
                  <QuickActionLink href="/dashboard/settings" icon={CogIcon} text="Account Settings" />
                </div>
              </div>
               <div className="bg-gradient-to-br from-orange-500 to-red-600 text-white shadow-lg rounded-xl p-6">
                    <SparklesIcon className="h-8 w-8 mb-2 opacity-80"/>
                    <h2 className="text-xl font-semibold mb-2">Unlock Your Inner Chef!</h2>
                    <p className="text-sm opacity-90 mb-4">
                        DishWish AI is here to inspire your next meal. Don&apos;t be afraid to experiment and discover new favorites.
                    </p>
                    <Link href="/how-it-works" className="inline-block bg-white/30 hover:bg-white/40 text-white font-semibold py-2 px-4 rounded-lg text-sm transition-colors">
                        Learn How AI Helps
                    </Link>
                </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

interface StatCardProps { title: string; value: string; icon: React.ElementType; color: string, bgColor: string }
const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color, bgColor }) => (
  <div className={`shadow-lg rounded-xl p-5 ${bgColor}`}>
    <div className="flex items-center">
      <div className={`flex-shrink-0 p-3 rounded-full bg-white shadow-sm`}>
        <Icon className={`h-6 w-6 ${color}`} aria-hidden="true" />
      </div>
      <div className="ml-5 w-0 flex-1">
        <dl>
          <dt className={`text-sm font-medium text-slate-500 truncate ${color.replace('text-', 'text-slate-')}`}>
            {title}
          </dt>
          <dd className="text-2xl font-bold text-slate-800">{value}</dd>
        </dl>
      </div>
    </div>
  </div>
);

interface QuickActionLinkProps { href: string; icon: React.ElementType; text: string; }
const QuickActionLink: React.FC<QuickActionLinkProps> = ({ href, icon: Icon, text }) => (
  <Link href={href} className="group flex items-center p-3 -m-3 text-base font-medium text-slate-700 rounded-lg hover:bg-slate-100 transition ease-in-out duration-150">
    <Icon className="flex-shrink-0 h-6 w-6 text-slate-400 group-hover:text-orange-500" aria-hidden="true" />
    <span className="ml-3">{text}</span>
  </Link>
);
