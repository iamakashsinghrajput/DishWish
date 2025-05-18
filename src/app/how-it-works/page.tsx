import { CogIcon, BeakerIcon, UserCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export const metadata = {
  title: "How DishWish AI Works | AI Recipe Generation Explained",
  description: "Discover the magic behind DishWish AI. Learn how our artificial intelligence transforms your ingredients and preferences into delicious, easy-to-follow recipes.",
};

const steps = [
  {
    id: 1,
    name: 'You Provide the Inputs',
    description: 'Tell us about the ingredients you have on hand, your dietary restrictions (e.g., vegetarian, gluten-free), preferred cuisine types, and even your cooking skill level.',
    icon: UserCircleIcon,
  },
  {
    id: 2,
    name: 'AI Works Its Magic',
    description: 'Our sophisticated AI algorithms analyze your inputs, cross-referencing a vast database of culinary knowledge, cooking techniques, and flavor pairings.',
    icon: CogIcon,
  },
  {
    id: 3,
    name: 'Recipe Generation',
    description: 'DishWish AI crafts a unique recipe tailored specifically to you. This includes step-by-step instructions, ingredient quantities, and sometimes even nutritional information.',
    icon: BeakerIcon,
  },
  {
    id: 4,
    name: 'Enjoy Your Meal!',
    description: 'Follow the easy instructions and enjoy a delicious, personalized meal. You can save your favorite recipes, rate them, and help our AI learn your tastes even better.',
    icon: CheckCircleIcon,
  },
];

export default function HowItWorksPage() {
  return (
    <div className="bg-white py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-base font-semibold text-orange-600 tracking-wide uppercase">The Process</h2>
          <p className="mt-1 text-4xl font-extrabold text-slate-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
            How DishWish AI Crafts Your Recipes
          </p>
          <p className="max-w-2xl mt-5 mx-auto text-xl text-slate-600">
            Turning simple ingredients into culinary masterpieces is easier than you think. Here’s a peek behind the curtain.
          </p>
        </div>

        <div className="mt-20">
          <div className="flow-root">
            <ul role="list" className="-mb-8">
              {steps.map((step, stepIdx) => (
                <li key={step.id}>
                  <div className="relative pb-8">
                    {stepIdx !== steps.length - 1 ? (
                      <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                    ) : null}
                    <div className="relative flex space-x-3 items-start">
                      <div>
                        <span className="h-10 w-10 rounded-full bg-orange-500 flex items-center justify-center ring-8 ring-white">
                          <step.icon className="h-6 w-6 text-white" aria-hidden="true" />
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 pt-1.5">
                        <h3 className="text-xl font-semibold text-slate-800">{step.name}</h3>
                        <p className="mt-1 text-md text-slate-600">{step.description}</p>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-24 text-center">
            <h3 className="text-3xl font-extrabold text-slate-800 mb-4">Ready to Get Started?</h3>
            <p className="max-w-xl mt-5 mx-auto text-xl text-slate-600 mb-8">
                Experience the future of cooking today. Let DishWish AI inspire your next meal.
            </p>
            <a
              href="/generate-recipe"
              className="inline-flex items-center justify-center px-8 py-3.5 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-orange-600 hover:bg-orange-700 transition-colors"
            >
              Generate My First Recipe
            </a>
        </div>
      </div>
    </div>
  );
}