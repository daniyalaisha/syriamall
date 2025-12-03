import { useState, useRef, DragEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { X, Upload, Image as ImageIcon, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ProductImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  vendorId: string;
  productId?: string;
}

const MAX_IMAGES = 6;
const MAX_SIZE_MB = 1;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
const MIN_DIMENSION = 800;
const ALLOWED_FORMATS = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export default function ProductImageUpload({
  images,
  onImagesChange,
  vendorId,
  productId = "temp",
}: ProductImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const validateImage = async (file: File): Promise<string | null> => {
    // Check file type
    if (!ALLOWED_FORMATS.includes(file.type)) {
      return "Invalid format. Only JPG, JPEG, PNG, and WEBP are allowed.";
    }

    // Check file size
    if (file.size > MAX_SIZE_BYTES) {
      return "Image size cannot exceed 1 MB";
    }

    // Check dimensions
    return new Promise((resolve) => {
      const img = new window.Image();
      img.onload = () => {
        if (img.width < MIN_DIMENSION || img.height < MIN_DIMENSION) {
          resolve(`Image resolution must be at least ${MIN_DIMENSION}×${MIN_DIMENSION} px`);
        } else {
          resolve(null);
        }
      };
      img.onerror = () => resolve("Failed to load image");
      img.src = URL.createObjectURL(file);
    });
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `${vendorId}/${productId}/${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from("product-images")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from("product-images")
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error("Upload error:", error);
      return null;
    }
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const remainingSlots = MAX_IMAGES - images.length;
    if (files.length > remainingSlots) {
      toast({
        title: "Too many images",
        description: `You can only upload ${remainingSlots} more image(s). Maximum ${MAX_IMAGES} images allowed.`,
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    const newImages: string[] = [];
    const totalFiles = files.length;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Validate image
      const validationError = await validateImage(file);
      if (validationError) {
        toast({
          title: "Validation Error",
          description: `${file.name}: ${validationError}`,
          variant: "destructive",
        });
        continue;
      }

      // Upload image
      const imageUrl = await uploadImage(file);
      if (imageUrl) {
        newImages.push(imageUrl);
      } else {
        toast({
          title: "Upload Failed",
          description: `Failed to upload ${file.name}`,
          variant: "destructive",
        });
      }

      // Update progress
      setUploadProgress(((i + 1) / totalFiles) * 100);
    }

    if (newImages.length > 0) {
      onImagesChange([...images, ...newImages]);
      toast({
        title: "Success",
        description: `${newImages.length} image(s) uploaded successfully`,
      });
    }

    setUploading(false);
    setUploadProgress(0);
  };

  const removeImage = async (imageUrl: string, index: number) => {
    try {
      // Extract file path from URL
      const url = new URL(imageUrl);
      const pathParts = url.pathname.split("/product-images/");
      if (pathParts.length > 1) {
        const filePath = pathParts[1];
        await supabase.storage.from("product-images").remove([filePath]);
      }

      const newImages = images.filter((_, i) => i !== index);
      onImagesChange(newImages);
      
      toast({
        title: "Image removed",
        description: "Image has been deleted successfully",
      });
    } catch (error) {
      console.error("Error removing image:", error);
      toast({
        title: "Error",
        description: "Failed to remove image",
        variant: "destructive",
      });
    }
  };

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Images</CardTitle>
        <CardDescription>
          Upload up to {MAX_IMAGES} product images. Max {MAX_SIZE_MB}MB per image.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Guidelines Alert */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm space-y-1">
            <div className="font-medium mb-1">Image Guidelines:</div>
            <ul className="list-disc list-inside space-y-0.5 text-xs">
              <li>Max {MAX_SIZE_MB}MB per image</li>
              <li>Minimum {MIN_DIMENSION}×{MIN_DIMENSION} px (Recommended: 1080×1080 px)</li>
              <li>White or clean background preferred</li>
              <li>No watermarks</li>
              <li>Formats: JPG, JPEG, PNG, WEBP</li>
            </ul>
          </AlertDescription>
        </Alert>

        {/* Upload Area */}
        {images.length < MAX_IMAGES && (
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              dragActive
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary/50"
            }`}
          >
            <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm font-medium mb-1">
              {dragActive ? "Drop images here" : "Drag and drop images or click to browse"}
            </p>
            <p className="text-xs text-muted-foreground">
              {images.length} of {MAX_IMAGES} images uploaded
            </p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={ALLOWED_FORMATS.join(",")}
              onChange={(e) => handleFiles(e.target.files)}
              className="hidden"
            />
          </div>
        )}

        {/* Upload Progress */}
        {uploading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Uploading images...</span>
              <span>{Math.round(uploadProgress)}%</span>
            </div>
            <Progress value={uploadProgress} />
          </div>
        )}

        {/* Image Preview Grid */}
        {images.length > 0 && (
          <div className="grid grid-cols-2 gap-4">
            {images.map((image, index) => (
              <div
                key={index}
                className="relative aspect-square rounded-lg overflow-hidden border bg-muted group"
              >
                <img
                  src={image}
                  alt={`Product image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 bg-background/80 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium">
                  Image {index + 1}
                </div>
                <Button
                  size="icon"
                  variant="destructive"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(image, index);
                  }}
                  disabled={uploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {images.length === 0 && !uploading && (
          <div className="text-center py-8 text-muted-foreground">
            <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No images uploaded yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
