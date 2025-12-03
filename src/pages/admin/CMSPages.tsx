import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Save, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function AdminCMSPages() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pages, setPages] = useState<any[]>([]);

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const { data, error } = await supabase
        .from("cms_pages")
        .select("*")
        .order("page_key", { ascending: true });

      if (error) throw error;
      setPages(data || []);
    } catch (error) {
      console.error("Error fetching pages:", error);
      toast({
        title: "Error",
        description: "Failed to load CMS pages",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (pageId: string, content: string, title: string) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("cms_pages")
        .update({ content, title })
        .eq("id", pageId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Page updated successfully",
      });

      fetchPages();
    } catch (error) {
      console.error("Error saving page:", error);
      toast({
        title: "Error",
        description: "Failed to save page",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const updatePageContent = (pageKey: string, field: string, value: string) => {
    setPages((prev) =>
      prev.map((page) => (page.page_key === pageKey ? { ...page, [field]: value } : page))
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold">CMS Pages Editor</h1>
        <p className="text-muted-foreground">Edit static pages content</p>
      </div>

      <Tabs defaultValue="about_us" className="space-y-4">
        <TabsList>
          {pages.map((page) => (
            <TabsTrigger key={page.page_key} value={page.page_key}>
              {page.title}
            </TabsTrigger>
          ))}
        </TabsList>

        {pages.map((page) => (
          <TabsContent key={page.page_key} value={page.page_key}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {page.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Page Title</Label>
                  <Input
                    value={page.title}
                    onChange={(e) => updatePageContent(page.page_key, "title", e.target.value)}
                    placeholder="Page title..."
                  />
                </div>

                <div>
                  <Label>Page Content (HTML)</Label>
                  <Textarea
                    value={page.content || ""}
                    onChange={(e) => updatePageContent(page.page_key, "content", e.target.value)}
                    placeholder="Enter page content (HTML supported)..."
                    rows={15}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    You can use HTML tags for formatting
                  </p>
                </div>

                <div>
                  <Label>Meta Description (SEO)</Label>
                  <Textarea
                    value={page.meta_description || ""}
                    onChange={(e) =>
                      updatePageContent(page.page_key, "meta_description", e.target.value)
                    }
                    placeholder="Meta description for SEO..."
                    rows={2}
                  />
                </div>

                <Button
                  onClick={() => handleSave(page.id, page.content, page.title)}
                  disabled={saving}
                  className="w-full"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Saving..." : "Save Changes"}
                </Button>

                <Card className="mt-4 bg-muted">
                  <CardHeader>
                    <CardTitle className="text-sm">Preview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: page.content || "" }}
                    />
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
