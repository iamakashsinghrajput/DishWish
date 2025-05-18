import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-slate-800 text-slate-300">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8 xl:col-span-1">
            <Link href="/" className="text-3xl font-bold group">
              <span className="text-slate-100 group-hover:text-orange-400 transition-colors duration-300">Dish</span>
              <span className="text-orange-400 group-hover:text-slate-100 transition-colors duration-300">Wish</span>
              <span className="text-slate-100 text-3xl"> AI</span>
            </Link>
            <p className="text-slate-400 text-base">
              Craft your next delicious meal with AI precision. Explore a world of flavor, personalized just for you.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-2">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-slate-200 tracking-wider uppercase">Navigation</h3>
                <ul role="list" className="mt-4 space-y-4">
                  <li><Link href="/" className="text-base text-slate-400 hover:text-orange-400">Home</Link></li>
                  <li><Link href="/about" className="text-base text-slate-400 hover:text-orange-400">About Us</Link></li>
                  <li><Link href="/how-it-works" className="text-base text-slate-400 hover:text-orange-400">How It Works</Link></li>
                </ul>
              </div>
              <div className="mt-12 md:mt-0">
                <h3 className="text-sm font-semibold text-slate-200 tracking-wider uppercase">Features</h3>
                <ul role="list" className="mt-4 space-y-4">
                  <li><Link href="/generate-recipe" className="text-base text-slate-400 hover:text-orange-400">Generate Recipe</Link></li>
                  <li><Link href="/dashboard/my-recipes" className="text-base text-slate-400 hover:text-orange-400">My Recipes</Link></li>
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-slate-200 tracking-wider uppercase">Legal & Support</h3>
                <ul role="list" className="mt-4 space-y-4">
                  <li><Link href="/contact" className="text-base text-slate-400 hover:text-orange-400">Contact Us</Link></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-slate-700 pt-8">
          <p className="text-base text-slate-400 xl:text-center">
            © {currentYear} DishWish AI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}