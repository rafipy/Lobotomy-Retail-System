import Image from "next/image";

export function HeroHeadline() {
  return (
    <div className="animate-fade-in text-center space-y-6">
      {/* Logo */}
      <div className="flex justify-center mb-6">
        <Image
          src="/logo.jpg"
          alt="Lobotomy Retail Logo"
          width={200}
          height={200}
          className="object-contain animate-float"
        />
      </div>

      {/* Headline */}
      <h1 className="font-heading text-6xl md:text-8xl font-bold tracking-tight text-yellow-200">
        Lobotomy Retail
      </h1>
      <p className="font-body text-xl md:text-2xl text-red-400 font-semibold">
        FACE THE ITEMS. BUILD THE SHOPPING CART.
      </p>
    </div>
  );
}
