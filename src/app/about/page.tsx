import Image from 'next/image';
import { UsersIcon, LightBulbIcon, SparklesIcon } from '@heroicons/react/24/outline';

export const metadata = {
  title: "About DishWish AI | Our Story and Mission",
  description: "Learn more about DishWish AI, the team behind it, and our mission to revolutionize home cooking with artificial intelligence.",
};

export default function AboutPage() {
  return (
    <div className="bg-slate-50 py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-base font-semibold text-orange-600 tracking-wide uppercase">Who We Are</h2>
          <p className="mt-1 text-4xl font-extrabold text-slate-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
            About DishWish AI
          </p>
          <p className="max-w-xl mt-5 mx-auto text-xl text-slate-600">
            We are a passionate team of food lovers, technologists, and AI enthusiasts dedicated to making your culinary journey exciting and effortless.
          </p>
        </div>

        <div className="mt-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <h3 className="text-3xl font-extrabold text-slate-800 mb-4">Our Mission</h3>
              <p className="text-lg text-slate-600 mb-6">
                At DishWish AI, our mission is to empower home cooks of all skill levels to discover new flavors, reduce food waste, and enjoy the art of cooking. We believe that with the help of AI, anyone can create delicious, personalized meals tailored to their ingredients, dietary needs, and taste preferences.
              </p>
              <p className="text-lg text-slate-600">
                We aim to take the guesswork out of meal planning and inspire creativity in the kitchen, one recipe at a time.
              </p>
            </div>
            <div className="relative h-96 rounded-lg shadow-xl overflow-hidden">
              <Image
                src="/chef_with_food.png"
                alt="DishWish AI Mission"
                fill
                className="object-cover"
              />
               <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            </div>
          </div>
        </div>

        <div className="mt-24">
          <h3 className="text-3xl font-extrabold text-slate-800 text-center mb-12">Why DishWish AI?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-orange-500 text-white mb-4">
                <SparklesIcon className="h-6 w-6" />
              </div>
              <h4 className="text-xl font-semibold text-slate-800 mb-2">AI-Powered Innovation</h4>
              <p className="text-slate-600">
                Leveraging cutting-edge AI to generate unique and practical recipes based on your inputs.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-orange-500 text-white mb-4">
                <UsersIcon className="h-6 w-6" />
              </div>
              <h4 className="text-xl font-semibold text-slate-800 mb-2">User-Centric Design</h4>
              <p className="text-slate-600">
                Focused on an intuitive and delightful experience for every home cook.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-orange-500 text-white mb-4">
                <LightBulbIcon className="h-6 w-6" />
              </div>
              <h4 className="text-xl font-semibold text-slate-800 mb-2">Endless Possibilities</h4>
              <p className="text-slate-600">
                From utilizing leftover ingredients to exploring new cuisines, we inspire culinary creativity.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}