import { HeroHeadline } from "./hero-headline";
import { HeroCTA } from "./hero-cta";

export function HeroSection() {
  return (
    <section className="min-h-screen relative overflow-hidden bg-black">
      <div className="min-h-screen flex items-center justify-center">
        <div className="container px-10 md:px-16">
          <div className="mx-auto text-center flex flex-col items-center">
            <HeroHeadline />
            <HeroCTA />
          </div>
        </div>
      </div>
    </section>
  );
}
