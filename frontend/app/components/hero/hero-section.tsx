import { HeroHeadline } from "./hero-headline";
import { HeroCTA } from "./hero-cta";

export function HeroSection() {
  return (
    <section className="min-h-screen relative overflow-hidden">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black z-10" />

      <div className="relative z-20 min-h-screen flex items-center justify-center">
        <div className="container px-8 md:px-16">
          <div className="mx-auto text-center">
            <HeroHeadline />
            <HeroCTA />
          </div>
        </div>
      </div>
    </section>
  );
}
