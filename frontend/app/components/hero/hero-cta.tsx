import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function HeroCTA() {
  return (
    <div className="animate-fade-in-delay-400 mt-12 flex flex-col sm:flex-row gap-4 justify-center">
      <Button
        size="lg"
        className="font-body bg-yellow-200 hover:bg-amber-50 text-red-400 text-xl md:text-2xl px-12 py-6 h-full font-bold"
        asChild
      >
        <a href="/register">
          GET STARTED <ArrowRight className="ml-3 h-8 w-8" />
        </a>
      </Button>
      <Button
        size="lg"
        variant="outline"
        className="text-xl md:text-2xl px-12 py-6 h-full font-semibold text-yellow-500"
        asChild
      >
        <a href="/login">
          LOGIN <ArrowRight className="ml-3 h-8 w-8" />
        </a>
      </Button>
    </div>
  );
}
