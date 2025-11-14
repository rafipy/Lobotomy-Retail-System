import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function HeroCTA() {
  return (
    <div className="animate-fade-in-delay-400 mt-12 flex flex-col sm:flex-row gap-4 justify-center min-w-[30vw]">
      <Button
        size="lg"
        className="flex-1 grow font-body bg-transparent  border-yellow-200 border-2 shadow-2xl shadow-yellow-200/40 hover:bg-amber-200 hover:text-red-600 hover:text-3xl text-red-400 text-shadow-lg text-shadow-red-400/40 text-xl md:text-2xl px-12 py-6 h-full font-bold"
        asChild
      >
        <a href="/register">
          GET STARTED <ArrowRight className="ml-3 h-8 w-8" />
        </a>
      </Button>
      <Button
        size="lg"
        variant="outline"
        className="flex-1 grow font-body bg-transparent  border-yellow-200 border-2 shadow-2xl shadow-yellow-200/40 hover:bg-amber-200 hover:text-yellow-600 hover:text-3xl text-yellow-200 text-shadow-lg text-shadow-yellow-400/40 text-xl md:text-2xl px-12 py-6 h-full font-bold"
        asChild
      >
        <a href="/login">
          LOGIN <ArrowRight className="ml-3 h-8 w-8" />
        </a>
      </Button>
    </div>
  );
}
