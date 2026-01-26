import Image from 'next/image';
import Link from 'next/link';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  welcomeTitle?: string;
  welcomeSubtitle?: string;
}

const AUTH_GRAPHIC_SRC = "/DishWish_Graphics.png";

export default function AuthLayout({
  children,
  title,
  subtitle,
  welcomeTitle = "Welcome to DishWish",
  welcomeSubtitle = "Craft Your Next Delicious Meal With AI Precision"
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex bg-slate-50">
      <div className="hidden lg:flex flex-col justify-center items-center w-1/2 bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-100 p-12 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <pattern id="wavy" patternUnits="userSpaceOnUse" width="100" height="100">
                        <path d="M0 50 Q 25 0, 50 50 T 100 50" stroke="#a0c3ff" strokeWidth="2" fill="none"/>
                        <path d="M0 60 Q 25 10, 50 60 T 100 60" stroke="#d0e0ff" strokeWidth="1.5" fill="none" />
                        <path d="M0 40 Q 25 -10, 50 40 T 100 40" stroke="#d0e0ff" strokeWidth="1.5" fill="none" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#wavy)"/>
            </svg>
        </div>
        <div className="relative z-10">
          <Link href="/" className="text-4xl font-bold group mb-12 inline-block">
            <span className="text-blue-600 group-hover:text-orange-500 transition-colors duration-300">Dish</span>
            <span className="text-orange-500 group-hover:text-blue-600 transition-colors duration-300">Wish</span>
          </Link>
           {/* <div className="my-12 mx-[168px] rounded-full">
             <Image src={AUTH_GRAPHIC_SRC} alt="DishWish Graphic" width={300} height={200} />
           </div>
            */}

            <div className="relative flex justify-center lg:justify-center items-center min-h-[380px] sm:min-h-[480px] lg:min-h-[550px]">
                <div className="absolute w-[320px] h-[320px] sm:w-[420px] sm:h-[420px] lg:w-[500px] lg:h-[500px] bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-100 rounded-full opacity-30 -translate-x-5 -translate-y-5 blur-sm"></div>
                <div className="absolute w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] lg:w-[480px] lg:h-[480px] border-4 border-blue-300 rounded-full opacity-40"></div>
                <div className="relative w-[280px] h-[280px] sm:w-[380px] sm:h-[380px] lg:w-[450px] lg:h-[450px] shadow-2xl rounded-full">
                    <Image src={AUTH_GRAPHIC_SRC} alt="AI generated delicious meal" fill className="object-contain rounded-full" priority />
                </div>
            </div>
          <h2 className="text-3xl font-semibold text-slate-700 mb-3">{welcomeTitle}</h2>
          <p className="text-slate-600 text-lg max-w-md mx-auto">{welcomeSubtitle}</p>
          <p className="text-sm text-slate-500 mt-8">
            Sign in to enhance your work life (This text seems to be from QuantaCore, adapt as needed for DishWish).
            <br />
          </p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-xl shadow-2xl">
          <div className="text-center lg:hidden mb-8">
             <Link href="/" className="text-3xl font-bold group inline-block">
                <span className="text-blue-600 group-hover:text-orange-500 transition-colors duration-300">Dish</span>
                <span className="text-orange-500 group-hover:text-blue-600 transition-colors duration-300">Wish</span>
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2 text-center">{title}</h1>
          {subtitle && <p className="text-slate-600 mb-8 text-center">{subtitle}</p>}
          {children}
        </div>
      </div>
    </div>
  );
}