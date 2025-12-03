import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, X, Loader2, Plus, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useProductForm } from "@/hooks/useProductForm";
import ProductImageUpload from "@/components/vendor/ProductImageUpload";

export default function ProductForm() {
  const { formData, updateFormData, saveProduct, loading, vendorId, categories, isEditing } = useProductForm();
  const [currentTag, setCurrentTag] = useState("");

  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      updateFormData("tags", [...formData.tags, currentTag.trim()]);
      setCurrentTag("");
    }
  };

  const removeTag = (tag: string) => {
    updateFormData("tags", formData.tags.filter((t) => t !== tag));
  };

  const addFAQ = () => {
    const faqs = formData.faqs || [];
    updateFormData("faqs", [...faqs, { question: "", answer: "" }]);
  };

  const updateFAQ = (index: number, field: "question" | "answer", value: string) => {
    const faqs = [...(formData.faqs || [])];
    faqs[index] = { ...faqs[index], [field]: value };
    updateFormData("faqs", faqs);
  };

  const removeFAQ = (index: number) => {
    const faqs = (formData.faqs || []).filter((_, i) => i !== index);
    updateFormData("faqs", faqs);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/vendor/products">
          <Button variant="outline" size="sm" disabled={loading}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">{isEditing ? "Edit Product" : "Add New Product"}</h1>
          <p className="text-muted-foreground">
            {isEditing ? "Update product information" : "Create a new product in your catalog"}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter product name"
                  value={formData.name}
                  onChange={(e) => updateFormData("name", e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU *</Label>
                  <Input
                    id="sku"
                    placeholder="e.g., WH-001"
                    value={formData.sku}
                    onChange={(e) => updateFormData("sku", e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) => updateFormData("category_id", value)}
                    disabled={loading}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  rows={6}
                  placeholder="Enter product description"
                  value={formData.description}
                  onChange={(e) => updateFormData("description", e.target.value)}
                  disabled={loading}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pricing & Inventory</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="price">Price *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.price || ""}
                    onChange={(e) => updateFormData("price", parseFloat(e.target.value) || 0)}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sale_price">Sale Price</Label>
                  <Input
                    id="sale_price"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.sale_price || ""}
                    onChange={(e) =>
                      updateFormData("sale_price", e.target.value ? parseFloat(e.target.value) : null)
                    }
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="stock">Stock Quantity *</Label>
                  <Input
                    id="stock"
                    type="number"
                    placeholder="0"
                    value={formData.stock_quantity || ""}
                    onChange={(e) => updateFormData("stock_quantity", parseInt(e.target.value) || 0)}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="low_stock">Low Stock Alert</Label>
                  <Input
                    id="low_stock"
                    type="number"
                    placeholder="5"
                    value={formData.low_stock_threshold || ""}
                    onChange={(e) =>
                      updateFormData("low_stock_threshold", parseInt(e.target.value) || 5)
                    }
                    disabled={loading}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>SEO</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="seo_title">SEO Title</Label>
                <Input
                  id="seo_title"
                  placeholder="Enter SEO title"
                  value={formData.seo_title}
                  onChange={(e) => updateFormData("seo_title", e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seo_desc">SEO Description</Label>
                <Textarea
                  id="seo_desc"
                  rows={3}
                  placeholder="Enter SEO description"
                  value={formData.seo_description}
                  onChange={(e) => updateFormData("seo_description", e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <div className="flex gap-2">
                  <Input
                    id="tags"
                    placeholder="Add tag and press Enter"
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                    disabled={loading}
                  />
                  <Button type="button" variant="outline" onClick={addTag} disabled={loading}>
                    Add
                  </Button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:text-destructive"
                          disabled={loading}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Product FAQs</CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={addFAQ} disabled={loading}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add FAQ
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {(!formData.faqs || formData.faqs.length === 0) ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No FAQs added yet. Click "Add FAQ" to create one.
                </p>
              ) : (
                <div className="space-y-4">
                  {formData.faqs.map((faq: any, index: number) => (
                    <Card key={index} className="border-2">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-muted-foreground">
                            FAQ #{index + 1}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFAQ(index)}
                            disabled={loading}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                        <div className="space-y-2">
                          <Label>Question</Label>
                          <Input
                            placeholder="Enter question"
                            value={faq.question}
                            onChange={(e) => updateFAQ(index, "question", e.target.value)}
                            disabled={loading}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Answer</Label>
                          <Textarea
                            placeholder="Enter answer"
                            rows={3}
                            value={faq.answer}
                            onChange={(e) => updateFAQ(index, "answer", e.target.value)}
                            disabled={loading}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <ProductImageUpload
            images={formData.images}
            onImagesChange={(images) => updateFormData("images", images)}
            vendorId={vendorId}
            productId={isEditing ? formData.name : "temp"}
          />

          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="active">Active</Label>
                <Switch
                  id="active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => updateFormData("is_active", checked)}
                  disabled={loading}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="auto_disable">Auto-disable when out of stock</Label>
                <Switch
                  id="auto_disable"
                  checked={formData.auto_disable_out_of_stock}
                  onCheckedChange={(checked) => updateFormData("auto_disable_out_of_stock", checked)}
                  disabled={loading}
                />
              </div>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <Button className="w-full" onClick={saveProduct} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Update Product" : "Save Product"}
            </Button>
            <Link to="/vendor/products" className="block">
              <Button variant="outline" className="w-full" disabled={loading}>
                Cancel
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
