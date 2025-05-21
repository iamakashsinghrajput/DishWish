"use client";
import Image from 'next/image';
import { SparklesIcon, PlayCircleIcon, StarIcon } from '@heroicons/react/24/solid';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const HeroSection = () => {
  const { status } = useSession();
  const router = useRouter();

  const handleGenerateRecipeClick = () => {
    if (status === 'authenticated') {
      router.push('/generate-recipe');
    } else {
      router.push('/signup/new');
    }
  };

  return (
    <section className="relative bg-slate-50 pt-12 md:pt-20 pb-24 md:pb-32 overflow-x-clip">
      <div aria-hidden="true" className="absolute top-0 right-0 h-full w-[60vw] sm:w-[55vw] md:w-[50vw] lg:w-[45vw] bg-orange-600 -z-0" style={{ clipPath: 'polygon(25% 0, 100% 0, 100% 100%, 0% 100%)' }} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-x-12 lg:gap-x-16 gap-y-16 items-center">
          <div className="text-center lg:text-left pt-8 lg:pt-0">
            <div className="inline-flex items-center bg-orange-100 text-orange-700 text-sm font-semibold px-4 py-2 rounded-full mb-6 shadow-sm">
              <SparklesIcon className="h-5 w-5 mr-2 text-orange-500" />AI-Powered Culinary Magic!
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-[3.4rem] xl:text-6xl font-extrabold text-slate-800 tracking-tight leading-tight">Craft Your Next <br className="hidden sm:block lg:hidden" /><span className="text-orange-800">Delicious Meal</span><br className="hidden sm:block lg:hidden" /> With AI Precision</h1>
            <p className="mt-6 text-lg text-slate-600 max-w-xl mx-auto lg:mx-0">DishWish AI transforms your ingredients and preferences into unique, easy-to-follow recipes. Explore a world of flavor, personalized just for you.</p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <button onClick={handleGenerateRecipeClick} className="w-full sm:w-auto bg-orange-600 text-white px-8 py-3.5 rounded-lg text-base font-semibold shadow-md hover:bg-orange-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2">
                {status === 'authenticated' ? 'Go To Recipe Generator' : 'Generate My Recipe'}
              </button>
              <a href="/how-it-works" className="w-full sm:w-auto flex items-center justify-center space-x-2 text-slate-700 hover:text-orange-600 border border-slate-300 hover:border-orange-400 px-8 py-3.5 rounded-lg text-base font-semibold transition-colors duration-300 bg-white hover:bg-orange-50 shadow-sm">
                <PlayCircleIcon className="h-6 w-6" /><span>How AI Cooking Works</span>
              </a>
            </div>
            <div className="mt-12 text-center lg:text-left">
              <p className="text-sm text-slate-500">Trusted by 100k+ Food Lovers</p>
              <div className="flex items-center justify-center lg:justify-start mt-2 space-x-0.5">{[...Array(5)].map((_, i) => (<StarIcon key={`star-${i}`} className="h-5 w-5 text-yellow-400" />))}<span className="ml-2 text-sm text-slate-500">4.8/5 (25k+ Reviews)</span></div>
            </div>
          </div>
          <div className="relative flex justify-center lg:justify-end items-center min-h-[380px] sm:min-h-[480px] lg:min-h-[550px]">
            <div className="absolute w-[320px] h-[320px] sm:w-[420px] sm:h-[420px] lg:w-[500px] lg:h-[500px] bg-orange-200 rounded-full opacity-30 -translate-x-5 -translate-y-5 blur-sm"></div>
            <div className="absolute w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] lg:w-[480px] lg:h-[480px] border-4 border-orange-300 rounded-full opacity-40"></div>
            <div className="relative w-[280px] h-[280px] sm:w-[380px] sm:h-[380px] lg:w-[450px] lg:h-[450px] shadow-2xl rounded-full">
              <Image src="/chef_with_food.png" alt="AI generated delicious meal" fill className="object-cover rounded-full" priority />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
export default HeroSection;