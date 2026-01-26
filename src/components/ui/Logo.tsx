import Link from 'next/link';

const Logo = ({ size = "text-2xl", className = "" }: { size?: string; className?: string }) => {
  return (
    <Link href="/" className={`${size} font-bold group ${className}`}>
      <span className="text-slate-800 group-hover:text-orange-500 transition-colors duration-300">
        Dish
      </span>
      <span className="text-orange-500 group-hover:text-slate-800 transition-colors duration-300">
        Wish
      </span>
    </Link>
  );
};

export default Logo;