import { NavBar } from "@/components/NavBar";
import { HeroSection } from "@/components/HeroSection";
import { RecentWinsTicker } from "@/components/RecentWinsTicker";
import { LeaderboardSection } from "@/components/LeaderboardSection";
import { StreamClipCarousel } from "@/components/StreamClipCarousel";
// import { PastWinnersAccordion } from "@/components/PastWinnersAccordion";
import { SignupCTA } from "@/components/SignupCTA";
import { Footer } from "@/components/Footer";
import { MobileStickyCTA } from "@/components/MobileStickyCTA";

const Index = () => {
  return (
    <div className="min-h-screen bg-arch-black text-white">
      <NavBar />
      <RecentWinsTicker />
      <main className="flex flex-col space-y-16 md:space-y-24">
        <section className="py-16 md:py-24">
          <HeroSection />
        </section>
        <section className="py-16 md:py-24">
          <LeaderboardSection />
        </section>
        <StreamClipCarousel />
        {/* <PastWinnersAccordion /> */}
        <section className="py-16 md:py-24">
          <SignupCTA />
        </section>
      </main>
      <Footer />
      <MobileStickyCTA />
    </div>
  );
};

export default Index;
