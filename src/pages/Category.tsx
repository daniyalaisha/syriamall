import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/products/ProductCard";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const Category = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<any>(null);
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [paginatedProducts, setPaginatedProducts] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
  const [selectedSubCategories, setSelectedSubCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12;

  useEffect(() => {
    if (slug) {
      fetchCategoryAndProducts();
    }
  }, [slug]);

  useEffect(() => {
    applyFilters();
  }, [products, priceRange, selectedVendors, selectedSubCategories, selectedBrands, sortBy]);

  useEffect(() => {
    // Apply pagination
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    setPaginatedProducts(filteredProducts.slice(startIndex, endIndex));
  }, [filteredProducts, currentPage]);

  useEffect(() => {
    // Reset to page 1 when filters change
    setCurrentPage(1);
  }, [priceRange, selectedVendors, selectedSubCategories, selectedBrands, sortBy]);

  const fetchCategoryAndProducts = async () => {
    try {
      // Fetch category
      const { data: categoryData, error: categoryError } = await supabase
        .from("categories")
        .select("*")
        .eq("slug", slug)
        .single();

      if (categoryError) throw categoryError;
      setCategory(categoryData);

      // Fetch category-specific banners
      const { data: bannersData, error: bannersError } = await supabase
        .from("banners")
        .select("*")
        .eq("is_active", true)
        .or(`category_id.eq.${categoryData.id},category_id.is.null`)
        .order("display_order");

      if (!bannersError) {
        setBanners(bannersData || []);
      }

      // Fetch sub-categories
      const { data: subCategoriesData, error: subCategoriesError } = await supabase
        .from("categories")
        .select("*")
        .eq("parent_id", categoryData.id)
        .eq("is_active", true)
        .order("display_order");

      if (subCategoriesError) throw subCategoriesError;
      setSubCategories(subCategoriesData || []);

      // Fetch products in category and sub-categories
      const categoryIds = [categoryData.id, ...(subCategoriesData?.map(sc => sc.id) || [])];
      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select(`
          *,
          vendors (id, store_name),
          categories (id, name)
        `)
        .in("category_id", categoryIds)
        .eq("is_active", true);

      if (productsError) throw productsError;
      setProducts(productsData || []);

      // Extract unique vendors
      const uniqueVendors = Array.from(
        new Set(productsData?.map((p) => p.vendors?.id))
      ).map((vendorId) => {
        const product = productsData?.find((p) => p.vendors?.id === vendorId);
        return {
          id: vendorId,
          name: product?.vendors?.store_name,
        };
      });
      setVendors(uniqueVendors.filter((v) => v.id && v.name));

      // Extract unique brands from tags
      const allBrands = new Set<string>();
      productsData?.forEach((product) => {
        if (product.tags && Array.isArray(product.tags)) {
          product.tags.forEach((tag: string) => allBrands.add(tag));
        }
      });
      setBrands(Array.from(allBrands).sort());

      // Set initial price range
      if (productsData && productsData.length > 0) {
        const prices = productsData.map((p) => p.price);
        const maxPrice = Math.max(...prices);
        setPriceRange([0, Math.ceil(maxPrice)]);
      }
    } catch (error) {
      console.error("Error fetching category data:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...products];

    // Filter by sub-categories
    if (selectedSubCategories.length > 0) {
      filtered = filtered.filter((p) =>
        selectedSubCategories.includes(p.category_id)
      );
    }

    // Filter by price range
    filtered = filtered.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
    );

    // Filter by selected vendors
    if (selectedVendors.length > 0) {
      filtered = filtered.filter((p) =>
        selectedVendors.includes(p.vendors?.id)
      );
    }

    // Filter by selected brands
    if (selectedBrands.length > 0) {
      filtered = filtered.filter((p) =>
        p.tags && p.tags.some((tag: string) => selectedBrands.includes(tag))
      );
    }

    // Sort
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        filtered.sort((a, b) => (b.rating_average || 0) - (a.rating_average || 0));
        break;
      case "best-sellers":
        filtered.sort((a, b) => (b.sales_count || 0) - (a.sales_count || 0));
        break;
      case "popularity":
        filtered.sort((a, b) => (b.views_count || 0) - (a.views_count || 0));
        break;
      case "newest":
      default:
        filtered.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        break;
    }

    setFilteredProducts(filtered);
  };

  const toggleVendor = (vendorId: string) => {
    setSelectedVendors((prev) =>
      prev.includes(vendorId)
        ? prev.filter((id) => id !== vendorId)
        : [...prev, vendorId]
    );
  };

  const toggleSubCategory = (subCategoryId: string) => {
    setSelectedSubCategories((prev) =>
      prev.includes(subCategoryId)
        ? prev.filter((id) => id !== subCategoryId)
        : [...prev, subCategoryId]
    );
  };

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand)
        ? prev.filter((b) => b !== brand)
        : [...prev, brand]
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-muted/20">
        {/* Category Banner */}
        {category && (
          <div className="relative h-64 md:h-80 bg-gradient-to-br from-primary/20 via-primary/10 to-background overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwgMTA2LCAwLCAwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30" />
            <div className="container mx-auto px-4 h-full flex flex-col justify-center relative">
              <h1 className="font-heading font-bold text-4xl md:text-6xl mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                {category.name}
              </h1>
              {category.description && (
                <p className="text-muted-foreground text-lg md:text-xl max-w-2xl">
                  {category.description}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink onClick={() => navigate("/")} className="cursor-pointer">
                  Home
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{category?.name || "Category"}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Category-Specific Promotional Banners */}
          {banners.length > 0 && (
            <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              {banners.map((banner) => (
                <div
                  key={banner.id}
                  className="relative rounded-lg overflow-hidden bg-gradient-to-r from-primary/10 to-primary/5 p-6 cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => banner.redirect_url && window.open(banner.redirect_url, "_blank")}
                >
                  <h3 className="font-heading font-bold text-2xl mb-2">{banner.title}</h3>
                  {banner.subtitle && (
                    <p className="text-muted-foreground mb-4">{banner.subtitle}</p>
                  )}
                  {banner.image_url && (
                    <img
                      src={banner.image_url}
                      alt={banner.title}
                      className="absolute right-0 top-0 h-full w-1/3 object-cover opacity-20"
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <aside className="lg:w-64 space-y-6">
              <div className="bg-card rounded-lg p-6 space-y-6">
                <h3 className="font-semibold text-lg">Filters</h3>

                {/* Sub-Categories */}
                {subCategories.length > 0 && (
                  <div className="space-y-3 pb-6 border-b">
                    <Label className="text-base font-semibold">Categories</Label>
                    <div className="space-y-2">
                      {subCategories.map((subCategory) => (
                        <div key={subCategory.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={subCategory.id}
                            checked={selectedSubCategories.includes(subCategory.id)}
                            onCheckedChange={() => toggleSubCategory(subCategory.id)}
                          />
                          <label
                            htmlFor={subCategory.id}
                            className="text-sm cursor-pointer hover:text-primary"
                          >
                            {subCategory.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Brands */}
                {brands.length > 0 && (
                  <div className="space-y-3 pb-6 border-b">
                    <Label className="text-base font-semibold">Brands</Label>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {brands.map((brand) => (
                        <div key={brand} className="flex items-center space-x-2">
                          <Checkbox
                            id={brand}
                            checked={selectedBrands.includes(brand)}
                            onCheckedChange={() => toggleBrand(brand)}
                          />
                          <label
                            htmlFor={brand}
                            className="text-sm cursor-pointer hover:text-primary"
                          >
                            {brand}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Price Range */}
                <div className="space-y-3 pb-6 border-b">
                  <Label className="text-base font-semibold">Price Range</Label>
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    max={1000}
                    step={10}
                    className="mb-2"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                  </div>
                </div>

                {/* Vendors */}
                {vendors.length > 0 && (
                  <div className="space-y-3 pb-6">
                    <Label className="text-base font-semibold">Vendors</Label>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {vendors.map((vendor) => (
                        <div key={vendor.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={vendor.id}
                            checked={selectedVendors.includes(vendor.id)}
                            onCheckedChange={() => toggleVendor(vendor.id)}
                          />
                          <label
                            htmlFor={vendor.id}
                            className="text-sm cursor-pointer hover:text-primary"
                          >
                            {vendor.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setSelectedSubCategories([]);
                    setSelectedBrands([]);
                    setSelectedVendors([]);
                    setPriceRange([0, 1000]);
                  }}
                >
                  Clear All Filters
                </Button>
              </div>
            </aside>

            {/* Products Grid */}
            <div className="flex-1">
              {/* Featured Products Section */}
              {filteredProducts.length > 0 && (
                <div className="mb-12 bg-card rounded-lg p-6 border border-border">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-heading font-bold text-2xl">
                      Featured Products
                    </h2>
                    <span className="text-sm text-muted-foreground">
                      Top picks in {category?.name}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {filteredProducts.slice(0, 4).map((product) => (
                      <ProductCard
                        key={product.id}
                        id={product.id}
                        name={product.name}
                        price={product.price}
                        originalPrice={product.sale_price}
                        rating={product.rating_average || 0}
                        reviews={product.rating_count || 0}
                        image={(product.images && product.images[0]) || ""}
                        vendor={product.vendors?.store_name || ""}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center mb-6">
                <p className="text-muted-foreground">
                  Showing {paginatedProducts.length} of {filteredProducts.length} products
                  {filteredProducts.length !== products.length && ` (${products.length} total)`}
                </p>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest Arrivals</SelectItem>
                    <SelectItem value="best-sellers">Best Sellers</SelectItem>
                    <SelectItem value="popularity">Most Popular</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground text-lg">
                    No products found matching your filters
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => {
                      setSelectedSubCategories([]);
                      setSelectedBrands([]);
                      setSelectedVendors([]);
                      setPriceRange([0, 1000]);
                    }}
                  >
                    Clear All Filters
                  </Button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {paginatedProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        id={product.id}
                        name={product.name}
                        price={product.price}
                        originalPrice={product.sale_price}
                        rating={product.rating_average || 0}
                        reviews={product.rating_count || 0}
                        image={(product.images && product.images[0]) || ""}
                        vendor={product.vendors?.store_name || ""}
                      />
                    ))}
                  </div>

                  {/* Pagination */}
                  {filteredProducts.length > productsPerPage && (
                    <div className="mt-8">
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious
                              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                              className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            />
                          </PaginationItem>
                          {Array.from(
                            { length: Math.ceil(filteredProducts.length / productsPerPage) },
                            (_, i) => i + 1
                          ).map((page) => (
                            <PaginationItem key={page}>
                              <PaginationLink
                                onClick={() => setCurrentPage(page)}
                                isActive={currentPage === page}
                                className="cursor-pointer"
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          ))}
                          <PaginationItem>
                            <PaginationNext
                              onClick={() =>
                                setCurrentPage((prev) =>
                                  Math.min(Math.ceil(filteredProducts.length / productsPerPage), prev + 1)
                                )
                              }
                              className={
                                currentPage === Math.ceil(filteredProducts.length / productsPerPage)
                                  ? "pointer-events-none opacity-50"
                                  : "cursor-pointer"
                              }
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Category;
