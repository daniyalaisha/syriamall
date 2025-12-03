import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, File, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DocumentUploadProps {
  label: string;
  documentType: string;
  currentUrl?: string;
  onUploadComplete: (url: string) => void;
  userId: string;
  required?: boolean;
}

export const DocumentUpload = ({
  label,
  documentType,
  currentUrl,
  onUploadComplete,
  userId,
  required = false,
}: DocumentUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [fileUrl, setFileUrl] = useState(currentUrl || "");
  const [fileName, setFileName] = useState("");

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    // Validate file type (PDF, JPG, PNG)
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only PDF, JPG, and PNG files are allowed");
      return;
    }

    setUploading(true);
    setFileName(file.name);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}/${documentType}_${Date.now()}.${fileExt}`;

      const { error: uploadError, data } = await supabase.storage
        .from("vendor-documents")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("vendor-documents").getPublicUrl(fileName);

      setFileUrl(publicUrl);
      onUploadComplete(publicUrl);
      toast.success("Document uploaded successfully");
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setFileUrl("");
    setFileName("");
    onUploadComplete("");
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={documentType}>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      {fileUrl ? (
        <div className="flex items-center gap-2 p-3 border rounded-md bg-muted">
          <File className="h-4 w-4 text-primary" />
          <span className="flex-1 text-sm truncate">{fileName || "Uploaded document"}</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            disabled={uploading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={uploading}
            onClick={() => document.getElementById(documentType)?.click()}
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload {label}
              </>
            )}
          </Button>
          <input
            id={documentType}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      )}
      <p className="text-xs text-muted-foreground">
        Accepted formats: PDF, JPG, PNG (Max 5MB)
      </p>
    </div>
  );
};
