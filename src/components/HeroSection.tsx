import { useEffect, useState } from "react";

export const HeroSection = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className="pt-12 md:pt-20 px-4 flex items-center justify-center relative overflow-hidden">
      <div className="container mx-auto text-center animate-fade-in">
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-4 md:mb-6">
          <span className="gradient-text">Who's owning</span>
          <br className="md:hidden" />
          <span className="text-white"> the reels this week?</span>
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto px-4 md:px-0">
          Live stats powered by <span className="text-arch-green font-semibold">Shuffle</span> & <span className="text-arch-purple font-semibold">ArchSlots</span>
        </p>
        
        {/* Animated background elements with parallax */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div 
            className="absolute top-1/4 left-1/4 w-64 h-64 bg-arch-green/5 rounded-full blur-3xl animate-pulse transform-gpu"
            style={{ transform: `translateY(${scrollY * 0.05}px)` }}
          ></div>
          <div 
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-arch-purple/5 rounded-full blur-3xl animate-pulse transform-gpu" 
            style={{ 
              animationDelay: '1s',
              transform: `translateY(${scrollY * -0.05}px)` 
            }}
          ></div>
        </div>
      </div>
    </section>
  );
};
