import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Banner {
  id: number;
  title: string;
  subtitle: string;
  cta: string;
  badge?: string;
  endDate?: Date;
  gradient: string;
}

const banners: Banner[] = [
  {
    id: 1,
    title: "Flash Sale",
    subtitle: "Up to 70% OFF on Electronics",
    cta: "Shop Now",
    badge: "Limited Time",
    endDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
    gradient: "from-orange-500 via-red-500 to-pink-500",
  },
  {
    id: 2,
    title: "New Arrivals",
    subtitle: "Discover the Latest Products",
    cta: "Explore",
    badge: "New",
    gradient: "from-blue-500 via-purple-500 to-pink-500",
  },
  {
    id: 3,
    title: "Summer Sale",
    subtitle: "Refresh Your Wardrobe",
    cta: "Shop Collection",
    badge: "Hot Deal",
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    gradient: "from-yellow-500 via-orange-500 to-red-500",
  },
];

const PromotionalBanner = () => {
  const [currentBanner, setCurrentBanner] = useState(0);
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const updateCountdown = () => {
      const banner = banners[currentBanner];
      if (banner.endDate) {
        const now = new Date().getTime();
        const distance = banner.endDate.getTime() - now;

        if (distance > 0) {
          const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((distance % (1000 * 60)) / 1000);
          setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
        } else {
          setTimeLeft("Expired");
        }
      } else {
        setTimeLeft("");
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [currentBanner]);

  const banner = banners[currentBanner];

  return (
    <section className={`relative bg-gradient-to-r ${banner.gradient} text-white overflow-hidden`}>
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="container mx-auto px-4 py-12 md:py-16 relative z-10">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          {banner.badge && (
            <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 text-sm px-4 py-1">
              {banner.badge}
            </Badge>
          )}
          <h2 className="font-heading font-bold text-4xl md:text-6xl">
            {banner.title}
          </h2>
          <p className="text-xl md:text-2xl font-medium">
            {banner.subtitle}
          </p>
          {timeLeft && (
            <div className="flex items-center justify-center gap-2 text-lg">
              <Clock className="h-5 w-5" />
              <span className="font-semibold">Ends in: {timeLeft}</span>
            </div>
          )}
          <Button
            size="lg"
            className="bg-white text-foreground hover:bg-white/90 font-semibold text-lg px-8 shadow-lg"
          >
            {banner.cta}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Banner Indicators */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentBanner(index)}
            className={`h-2 rounded-full transition-all ${
              index === currentBanner ? "w-8 bg-white" : "w-2 bg-white/50"
            }`}
            aria-label={`Go to banner ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default PromotionalBanner;
