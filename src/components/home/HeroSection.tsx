import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import heroBanner from "@/assets/hero-banner.jpg";

const HeroSection = () => {
  const navigate = useNavigate();
  const [banners, setBanners] = useState<any[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const { data, error } = await supabase
        .from("banners")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (error) throw error;
      
      // Use database banners if available, otherwise use default hero banner
      if (data && data.length > 0) {
        setBanners(data);
      } else {
        setBanners([
          {
            id: "default",
            title: "Welcome to SyriaMall",
            subtitle: "Discover premium electronics and lifestyle products",
            image_url: heroBanner,
            redirect_url: "/category/electronics",
          },
        ]);
      }
    } catch (error) {
      console.error("Error fetching banners:", error);
      // Fallback to default banner on error
      setBanners([
        {
          id: "default",
          title: "Welcome to SyriaMall",
          subtitle: "Discover premium electronics and lifestyle products",
          image_url: heroBanner,
          redirect_url: "/category/electronics",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  const previousSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  useEffect(() => {
    if (banners.length > 1) {
      const timer = setInterval(nextSlide, 5000);
      return () => clearInterval(timer);
    }
  }, [banners.length]);

  if (loading) {
    return (
      <section className="relative w-full bg-background">
        <div className="container mx-auto px-4 py-6">
          <div className="h-[450px] md:h-[550px] lg:h-[600px] rounded-xl bg-muted animate-pulse" />
        </div>
      </section>
    );
  }

  return (
    <section className="relative w-full bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="relative h-[450px] md:h-[550px] lg:h-[600px] overflow-hidden rounded-xl shadow-xl">
          {banners.map((banner, index) => (
            <div
              key={banner.id}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                index === currentSlide ? "opacity-100" : "opacity-0"
              }`}
            >
              <img
                src={banner.image_url}
                alt={banner.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent flex items-center">
                <div className="container mx-auto px-8 md:px-12 lg:px-16">
                  <div className="max-w-2xl space-y-6 text-white">
                    <h1 className="font-heading font-bold text-5xl md:text-6xl lg:text-7xl leading-tight tracking-tight">
                      {banner.title}
                    </h1>
                    {banner.subtitle && (
                      <p className="text-xl md:text-2xl font-light leading-relaxed text-white/90">
                        {banner.subtitle}
                      </p>
                    )}
                    {banner.redirect_url && (
                      <Button
                        size="lg"
                        className="mt-6 text-lg px-8 py-6 shadow-orange hover:shadow-xl transition-all duration-300"
                        onClick={() => navigate(banner.redirect_url || "/")}
                      >
                        Shop Now
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {banners.length > 1 && (
            <>
              <button
                onClick={previousSlide}
                className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3 transition-all duration-300 hover:scale-110 shadow-lg"
                aria-label="Previous slide"
              >
                <ChevronLeft className="h-6 w-6 text-foreground" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3 transition-all duration-300 hover:scale-110 shadow-lg"
                aria-label="Next slide"
              >
                <ChevronRight className="h-6 w-6 text-foreground" />
              </button>

              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3">
                {banners.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === currentSlide ? "bg-primary w-10" : "bg-white/70 w-2 hover:bg-white"
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
