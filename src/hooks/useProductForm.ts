import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ProductFormData {
  name: string;
  sku: string;
  category_id: string;
  description: string;
  price: number;
  sale_price: number | null;
  stock_quantity: number;
  low_stock_threshold: number;
  seo_title: string;
  seo_description: string;
  tags: string[];
  is_active: boolean;
  auto_disable_out_of_stock: boolean;
  images: string[];
  variants: any[];
  faqs: Array<{ question: string; answer: string }>;
}

export function useProductForm() {
  const navigate = useNavigate();
  const { id: productId } = useParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [vendorId, setVendorId] = useState<string>("");
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);

  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    sku: "",
    category_id: "",
    description: "",
    price: 0,
    sale_price: null,
    stock_quantity: 0,
    low_stock_threshold: 5,
    seo_title: "",
    seo_description: "",
    tags: [],
    is_active: true,
    auto_disable_out_of_stock: false,
    images: [],
    variants: [],
    faqs: [],
  });

  useEffect(() => {
    fetchVendorId();
    fetchCategories();
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const fetchVendorId = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: vendor } = await supabase
        .from("vendors")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (vendor) {
        setVendorId(vendor.id);
      }
    } catch (error) {
      console.error("Error fetching vendor:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          name: data.name,
          sku: data.sku || "",
          category_id: data.category_id || "",
          description: data.description || "",
          price: data.price,
          sale_price: data.sale_price,
          stock_quantity: data.stock_quantity || 0,
          low_stock_threshold: data.low_stock_threshold || 5,
          seo_title: data.seo_title || "",
          seo_description: data.seo_description || "",
          tags: data.tags || [],
          is_active: data.is_active ?? true,
          auto_disable_out_of_stock: data.auto_disable_out_of_stock ?? false,
          images: (data.images as string[]) || [],
          variants: (data.variants as any[]) || [],
          faqs: (data.faqs as any[]) || [],
        });
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      toast({
        title: "Error",
        description: "Failed to load product",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: keyof ProductFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const saveProduct = async () => {
    try {
      setLoading(true);

      // Validation
      if (!formData.name || !formData.sku || !formData.category_id || !vendorId) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }

      if (formData.price <= 0) {
        toast({
          title: "Validation Error",
          description: "Price must be greater than 0",
          variant: "destructive",
        });
        return;
      }

      // Generate slug
      const slug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

      const productData = {
        name: formData.name,
        slug,
        sku: formData.sku,
        category_id: formData.category_id,
        description: formData.description,
        price: formData.price,
        sale_price: formData.sale_price,
        stock_quantity: formData.stock_quantity,
        low_stock_threshold: formData.low_stock_threshold,
        seo_title: formData.seo_title,
        seo_description: formData.seo_description,
        tags: formData.tags,
        is_active: formData.is_active,
        auto_disable_out_of_stock: formData.auto_disable_out_of_stock,
        images: formData.images,
        variants: formData.variants,
        faqs: formData.faqs,
        vendor_id: vendorId,
      };

      if (productId) {
        // Update existing product
        const { error } = await supabase
          .from("products")
          .update(productData)
          .eq("id", productId);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Product updated successfully",
        });
      } else {
        // Create new product
        const { error } = await supabase.from("products").insert([productData]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Product created successfully",
        });
      }

      navigate("/vendor/products");
    } catch (error: any) {
      console.error("Error saving product:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save product",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    updateFormData,
    saveProduct,
    loading,
    vendorId,
    categories,
    isEditing: !!productId,
  };
}
