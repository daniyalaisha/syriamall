import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Store, CheckCircle } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { z } from "zod";
import { DocumentUpload } from "@/components/vendor/DocumentUpload";

const vendorApplicationSchema = z.object({
  email: z.string().email("Invalid email address").max(255, "Email too long"),
  password: z.string().min(8, "Password must be at least 8 characters").max(100, "Password too long").optional().or(z.literal("")),
  confirmPassword: z.string().optional().or(z.literal("")),
  fullName: z.string().min(2, "Full name required").max(100, "Name too long"),
  phone: z.string().min(10, "Invalid phone number").max(20, "Phone too long"),
  storeName: z.string().min(2, "Store name required").max(100, "Store name too long"),
  storeAddress: z.string().min(5, "Address required").max(200, "Address too long"),
  city: z.string().min(2, "City required").max(50, "City name too long"),
  country: z.string().min(2, "Country required"),
  businessType: z.enum(["Individual", "Company"]),
  storeDescription: z.string().min(20, "Description must be at least 20 characters").max(1000, "Description too long"),
  mainCategory: z.string().min(1, "Category required"),
  plannedProducts: z.number().min(1).max(100000).optional(),
  bankName: z.string().min(2, "Bank name required").max(100, "Bank name too long"),
  accountTitle: z.string().min(2, "Account title required").max(100, "Account title too long"),
  accountNumber: z.string().min(5, "Account number required").max(50, "Account number too long"),
  agreeToTerms: z.boolean().refine(val => val === true, "You must agree to terms"),
}).refine(data => !data.password || data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const BecomeVendor = () => {
  const navigate = useNavigate();
  const { user, role, signUp, refreshRole } = useAuth();
  const [loading, setLoading] = useState(false);
  const [checkingApplication, setCheckingApplication] = useState(true);
  const [hasApplication, setHasApplication] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    phone: "",
    storeName: "",
    storeLogo: "",
    storeBanner: "",
    storeAddress: "",
    city: "",
    country: "Syria",
    businessType: "Individual",
    ntnNumber: "",
    storeDescription: "",
    mainCategory: "",
    subCategory: "",
    plannedProducts: "",
    pricingRange: "",
    bankName: "",
    accountTitle: "",
    accountNumber: "",
    agreeToTerms: false,
    businessLicenseUrl: "",
    ntnCertificateUrl: "",
    idProofUrl: "",
    bankStatementUrl: "",
  });

  // Pre-fill email if user is logged in
  useEffect(() => {
    if (user?.email) {
      setFormData(prev => ({ ...prev, email: user.email || "" }));
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Normalize email
      const normalizedEmail = formData.email.trim().toLowerCase();
      
      // For logged-in users, always use their account email
      const emailToUse = user?.email?.toLowerCase() || normalizedEmail;
      
      // Validate form
      const validatedData = vendorApplicationSchema.parse({
        ...formData,
        email: emailToUse,
        plannedProducts: formData.plannedProducts ? parseInt(formData.plannedProducts) : undefined,
      });
      
      setErrors({});
      setLoading(true);

      let userId = user?.id;

      // Create user account if not logged in
      if (!user) {
        await signUp(normalizedEmail, validatedData.password);

        // Wait for the user to be created and trigger to fire
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Get the newly created user
        const { data: { user: newUser } } = await supabase.auth.getUser();
        
        if (!newUser) {
          throw new Error("Failed to create user account");
        }
        userId = newUser.id;
      }

      // Submit vendor application - always use the logged-in user's email
      const { error: applicationError } = await supabase
        .from("vendor_applications")
        .insert({
          user_id: userId,
          full_name: validatedData.fullName,
          phone: validatedData.phone,
          email: emailToUse, // Use normalized/account email
          store_name: validatedData.storeName,
          store_logo: formData.storeLogo || null,
          store_banner: formData.storeBanner || null,
          store_address: validatedData.storeAddress,
          city: validatedData.city,
          country: validatedData.country,
          business_type: validatedData.businessType,
          ntn_number: formData.ntnNumber || null,
          store_description: validatedData.storeDescription,
          main_category: validatedData.mainCategory,
          sub_category: formData.subCategory || null,
          planned_products: validatedData.plannedProducts || null,
          pricing_range: formData.pricingRange || null,
          bank_name: validatedData.bankName,
          account_title: validatedData.accountTitle,
          account_number: validatedData.accountNumber,
          business_license_url: formData.businessLicenseUrl || null,
          ntn_certificate_url: formData.ntnCertificateUrl || null,
          id_proof_url: formData.idProofUrl || null,
          bank_statement_url: formData.bankStatementUrl || null,
          status: "pending",
        });

      if (applicationError) throw applicationError;

      toast.success("Application submitted successfully! We'll review it soon.");
      navigate("/vendor-status");
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.issues.forEach(err => {
          if (err.path[0]) {
            fieldErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(fieldErrors);
        toast.error("Please fix the form errors");
      } else {
        console.error("Application error:", error);
        toast.error(error.message || "Failed to submit application");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  // Check if user already has vendor role or an application
  useEffect(() => {
    const checkVendorStatus = async () => {
      // First refresh role from database to get latest
      if (user) {
        const currentRole = await refreshRole();
        if (currentRole === 'vendor') {
          navigate("/vendor");
          return;
        }
      } else if (role === 'vendor') {
        navigate("/vendor");
        return;
      }

      if (user) {
        try {
          const { data } = await supabase
            .from("vendor_applications")
            .select("id, status")
            .eq("user_id", user.id)
            .maybeSingle();
          
          if (data) {
            setHasApplication(true);
            setApplicationStatus(data.status);
            // Redirect to status page for pending/rejected, or vendor dashboard if approved
            navigate("/vendor-status");
            return;
          }
        } catch (error) {
          console.error("Error checking application:", error);
        }
      }
      setCheckingApplication(false);
    };

    checkVendorStatus();
  }, [user, role, navigate, refreshRole]);

  if (checkingApplication) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If user has vendor role or has application, they'll be redirected by the useEffect
  if (role === 'vendor' || (user && hasApplication)) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <Store className="w-16 h-16 mx-auto mb-4 text-primary" />
          <h1 className="text-4xl font-bold mb-4">Become a Vendor</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Join SyriaMall and reach thousands of customers. Sell your products on one of the fastest-growing marketplaces.
          </p>
        </div>

        {/* Benefits */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader>
              <CardTitle>Wide Reach</CardTitle>
            </CardHeader>
            <CardContent>
              Connect with customers across Syria and beyond.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Easy Management</CardTitle>
            </CardHeader>
            <CardContent>
              Powerful dashboard to manage your products and orders.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Secure Payments</CardTitle>
            </CardHeader>
            <CardContent>
              Get paid securely with multiple payment options.
            </CardContent>
          </Card>
        </div>

        {/* Application Form */}
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>Vendor Application Form</CardTitle>
            <CardDescription>Fill out the form below to apply as a vendor</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Account Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Account Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      required
                      disabled={!!user}
                      className={user ? "bg-muted" : ""}
                    />
                    {user && <p className="text-xs text-muted-foreground mt-1">Using your account email</p>}
                    {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
                  </div>
                  <div>
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => handleChange("fullName", e.target.value)}
                      required
                    />
                    {errors.fullName && <p className="text-sm text-destructive mt-1">{errors.fullName}</p>}
                  </div>
                </div>
                {!user && (
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="password">Password *</Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => handleChange("password", e.target.value)}
                        required={!user}
                      />
                      {errors.password && <p className="text-sm text-destructive mt-1">{errors.password}</p>}
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword">Confirm Password *</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => handleChange("confirmPassword", e.target.value)}
                        required={!user}
                      />
                      {errors.confirmPassword && <p className="text-sm text-destructive mt-1">{errors.confirmPassword}</p>}
                    </div>
                  </div>
                )}
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    required
                  />
                  {errors.phone && <p className="text-sm text-destructive mt-1">{errors.phone}</p>}
                </div>
              </div>

              {/* Store Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Store Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="storeName">Store Name *</Label>
                    <Input
                      id="storeName"
                      value={formData.storeName}
                      onChange={(e) => handleChange("storeName", e.target.value)}
                      required
                    />
                    {errors.storeName && <p className="text-sm text-destructive mt-1">{errors.storeName}</p>}
                  </div>
                  <div>
                    <Label htmlFor="businessType">Business Type *</Label>
                    <Select value={formData.businessType} onValueChange={(value) => handleChange("businessType", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Individual">Individual</SelectItem>
                        <SelectItem value="Company">Company</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="storeLogo">Store Logo URL</Label>
                    <Input
                      id="storeLogo"
                      type="url"
                      placeholder="https://..."
                      value={formData.storeLogo}
                      onChange={(e) => handleChange("storeLogo", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="storeBanner">Store Banner URL</Label>
                    <Input
                      id="storeBanner"
                      type="url"
                      placeholder="https://..."
                      value={formData.storeBanner}
                      onChange={(e) => handleChange("storeBanner", e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="storeAddress">Store Address *</Label>
                  <Input
                    id="storeAddress"
                    value={formData.storeAddress}
                    onChange={(e) => handleChange("storeAddress", e.target.value)}
                    required
                  />
                  {errors.storeAddress && <p className="text-sm text-destructive mt-1">{errors.storeAddress}</p>}
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleChange("city", e.target.value)}
                      required
                    />
                    {errors.city && <p className="text-sm text-destructive mt-1">{errors.city}</p>}
                  </div>
                  <div>
                    <Label htmlFor="country">Country *</Label>
                    <Input
                      id="country"
                      value={formData.country}
                      onChange={(e) => handleChange("country", e.target.value)}
                      required
                    />
                    {errors.country && <p className="text-sm text-destructive mt-1">{errors.country}</p>}
                  </div>
                </div>
                <div>
                  <Label htmlFor="ntnNumber">NTN Number (Optional)</Label>
                  <Input
                    id="ntnNumber"
                    value={formData.ntnNumber}
                    onChange={(e) => handleChange("ntnNumber", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="storeDescription">Store Description *</Label>
                  <Textarea
                    id="storeDescription"
                    value={formData.storeDescription}
                    onChange={(e) => handleChange("storeDescription", e.target.value)}
                    rows={4}
                    required
                  />
                  {errors.storeDescription && <p className="text-sm text-destructive mt-1">{errors.storeDescription}</p>}
                </div>
              </div>

              {/* Product Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Product Details</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="mainCategory">Main Category *</Label>
                    <Select value={formData.mainCategory} onValueChange={(value) => handleChange("mainCategory", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Electronics">Electronics</SelectItem>
                        <SelectItem value="Fashion">Fashion</SelectItem>
                        <SelectItem value="Home">Home & Living</SelectItem>
                        <SelectItem value="Beauty">Beauty & Health</SelectItem>
                        <SelectItem value="Sports">Sports & Outdoors</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.mainCategory && <p className="text-sm text-destructive mt-1">{errors.mainCategory}</p>}
                  </div>
                  <div>
                    <Label htmlFor="subCategory">Sub Category</Label>
                    <Input
                      id="subCategory"
                      value={formData.subCategory}
                      onChange={(e) => handleChange("subCategory", e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="plannedProducts">Planned Products</Label>
                    <Input
                      id="plannedProducts"
                      type="number"
                      value={formData.plannedProducts}
                      onChange={(e) => handleChange("plannedProducts", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="pricingRange">Average Pricing Range</Label>
                    <Input
                      id="pricingRange"
                      placeholder="e.g. $10 - $100"
                      value={formData.pricingRange}
                      onChange={(e) => handleChange("pricingRange", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Bank Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Bank / Payment Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bankName">Bank Name *</Label>
                    <Input
                      id="bankName"
                      value={formData.bankName}
                      onChange={(e) => handleChange("bankName", e.target.value)}
                      required
                    />
                    {errors.bankName && <p className="text-sm text-destructive mt-1">{errors.bankName}</p>}
                  </div>
                  <div>
                    <Label htmlFor="accountTitle">Account Title *</Label>
                    <Input
                      id="accountTitle"
                      value={formData.accountTitle}
                      onChange={(e) => handleChange("accountTitle", e.target.value)}
                      required
                    />
                    {errors.accountTitle && <p className="text-sm text-destructive mt-1">{errors.accountTitle}</p>}
                  </div>
                </div>
                <div>
                  <Label htmlFor="accountNumber">Account Number / IBAN *</Label>
                  <Input
                    id="accountNumber"
                    value={formData.accountNumber}
                    onChange={(e) => handleChange("accountNumber", e.target.value)}
                    required
                  />
                  {errors.accountNumber && <p className="text-sm text-destructive mt-1">{errors.accountNumber}</p>}
                </div>
              </div>

              {/* KYC Documents */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">KYC Documents (Required for Approval)</h3>
                <p className="text-sm text-muted-foreground">
                  Please upload clear copies of the following documents. All documents are required for vendor approval.
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <DocumentUpload
                    label="Business License"
                    documentType="business_license"
                    currentUrl={formData.businessLicenseUrl}
                    onUploadComplete={(url) => handleChange("businessLicenseUrl", url)}
                    userId={user?.id || "pending"}
                    required
                  />
                  <DocumentUpload
                    label="NTN Certificate"
                    documentType="ntn_certificate"
                    currentUrl={formData.ntnCertificateUrl}
                    onUploadComplete={(url) => handleChange("ntnCertificateUrl", url)}
                    userId={user?.id || "pending"}
                    required
                  />
                  <DocumentUpload
                    label="ID Proof (CNIC/Passport)"
                    documentType="id_proof"
                    currentUrl={formData.idProofUrl}
                    onUploadComplete={(url) => handleChange("idProofUrl", url)}
                    userId={user?.id || "pending"}
                    required
                  />
                  <DocumentUpload
                    label="Bank Statement"
                    documentType="bank_statement"
                    currentUrl={formData.bankStatementUrl}
                    onUploadComplete={(url) => handleChange("bankStatementUrl", url)}
                    userId={user?.id || "pending"}
                    required
                  />
                </div>
              </div>

              {/* Agreement */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onCheckedChange={(checked) => handleChange("agreeToTerms", checked)}
                />
                <Label htmlFor="agreeToTerms" className="cursor-pointer">
                  I agree to the Terms & Conditions *
                </Label>
              </div>
              {errors.agreeToTerms && <p className="text-sm text-destructive">{errors.agreeToTerms}</p>}

              {/* Submit Button */}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting Application...
                  </>
                ) : (
                  "Submit Application"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default BecomeVendor;
