// "use client";

// import Navbar from '@/components/Navbar';
// import HeroSection from '@/components/HeroSection';

// export default function HomePage() {

  

//   return (
//     <>
//       <div className="min-h-screen flex flex-col bg-brand-background">
//         <Navbar/>
//         <main className="flex-grow">
//           <HeroSection onOpenLoginModal={function (): void {
//             throw new Error('Function not implemented.');
//           } }/>
//         </main>
//       </div>
//     </>
//   );
// }



import HeroSection from "@/components/shared/HeroSection";

export default function HomePage() {
  return (
    <HeroSection />
  );
}