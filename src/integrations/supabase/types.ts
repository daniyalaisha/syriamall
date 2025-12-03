export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      addresses: {
        Row: {
          address_title: string
          building_unit: string | null
          city: string
          country: string
          created_at: string
          full_name: string
          id: string
          is_default: boolean
          phone: string
          postal_code: string | null
          state_province: string
          street_address: string
          updated_at: string
          user_id: string
        }
        Insert: {
          address_title: string
          building_unit?: string | null
          city: string
          country?: string
          created_at?: string
          full_name: string
          id?: string
          is_default?: boolean
          phone: string
          postal_code?: string | null
          state_province: string
          street_address: string
          updated_at?: string
          user_id: string
        }
        Update: {
          address_title?: string
          building_unit?: string | null
          city?: string
          country?: string
          created_at?: string
          full_name?: string
          id?: string
          is_default?: boolean
          phone?: string
          postal_code?: string | null
          state_province?: string
          street_address?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      admin_invite_codes: {
        Row: {
          code: string
          created_at: string | null
          created_by: string | null
          expires_at: string
          id: string
          is_used: boolean | null
          used_at: string | null
          used_by: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          created_by?: string | null
          expires_at: string
          id?: string
          is_used?: boolean | null
          used_at?: string | null
          used_by?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          created_by?: string | null
          expires_at?: string
          id?: string
          is_used?: boolean | null
          used_at?: string | null
          used_by?: string | null
        }
        Relationships: []
      }
      banners: {
        Row: {
          category_id: string | null
          created_at: string | null
          display_order: number | null
          end_date: string | null
          id: string
          image_url: string
          is_active: boolean | null
          redirect_url: string | null
          start_date: string | null
          subtitle: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          display_order?: number | null
          end_date?: string | null
          id?: string
          image_url: string
          is_active?: boolean | null
          redirect_url?: string | null
          start_date?: string | null
          subtitle?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          display_order?: number | null
          end_date?: string | null
          id?: string
          image_url?: string
          is_active?: boolean | null
          redirect_url?: string | null
          start_date?: string | null
          subtitle?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "banners_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      cart_items: {
        Row: {
          created_at: string | null
          id: string
          product_id: string
          quantity: number
          updated_at: string | null
          user_id: string
          variant_details: Json | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id: string
          quantity: number
          updated_at?: string | null
          user_id: string
          variant_details?: Json | null
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string
          quantity?: number
          updated_at?: string | null
          user_id?: string
          variant_details?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          parent_id: string | null
          slug: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          parent_id?: string | null
          slug: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          parent_id?: string | null
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      cms_pages: {
        Row: {
          content: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          meta_description: string | null
          page_key: string
          title: string
          updated_at: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          meta_description?: string | null
          page_key: string
          title: string
          updated_at?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          meta_description?: string | null
          page_key?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          title: string
          type?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string | null
          id: string
          order_id: string
          product_id: string | null
          product_name: string
          product_sku: string | null
          quantity: number
          subtotal: number
          unit_price: number
          variant_details: Json | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          order_id: string
          product_id?: string | null
          product_name: string
          product_sku?: string | null
          quantity: number
          subtotal: number
          unit_price: number
          variant_details?: Json | null
        }
        Update: {
          created_at?: string | null
          id?: string
          order_id?: string
          product_id?: string | null
          product_name?: string
          product_sku?: string | null
          quantity?: number
          subtotal?: number
          unit_price?: number
          variant_details?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          commission_amount: number | null
          created_at: string | null
          customer_id: string | null
          customer_notes: string | null
          id: string
          order_number: string
          payment_method: string | null
          payment_status: string | null
          shipping_address: Json
          shipping_cost: number | null
          status: string | null
          subtotal: number
          total: number
          updated_at: string | null
          vendor_id: string | null
          vendor_notes: string | null
        }
        Insert: {
          commission_amount?: number | null
          created_at?: string | null
          customer_id?: string | null
          customer_notes?: string | null
          id?: string
          order_number: string
          payment_method?: string | null
          payment_status?: string | null
          shipping_address: Json
          shipping_cost?: number | null
          status?: string | null
          subtotal: number
          total: number
          updated_at?: string | null
          vendor_id?: string | null
          vendor_notes?: string | null
        }
        Update: {
          commission_amount?: number | null
          created_at?: string | null
          customer_id?: string | null
          customer_notes?: string | null
          id?: string
          order_number?: string
          payment_method?: string | null
          payment_status?: string | null
          shipping_address?: Json
          shipping_cost?: number | null
          status?: string | null
          subtotal?: number
          total?: number
          updated_at?: string | null
          vendor_id?: string | null
          vendor_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      payout_requests: {
        Row: {
          admin_notes: string | null
          amount: number
          bank_details: Json | null
          created_at: string | null
          id: string
          processed_at: string | null
          processed_by: string | null
          status: string
          vendor_id: string
        }
        Insert: {
          admin_notes?: string | null
          amount: number
          bank_details?: Json | null
          created_at?: string | null
          id?: string
          processed_at?: string | null
          processed_by?: string | null
          status?: string
          vendor_id: string
        }
        Update: {
          admin_notes?: string | null
          amount?: number
          bank_details?: Json | null
          created_at?: string | null
          id?: string
          processed_at?: string | null
          processed_by?: string | null
          status?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payout_requests_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          auto_disable_out_of_stock: boolean | null
          category_id: string | null
          created_at: string | null
          description: string | null
          faqs: Json | null
          id: string
          images: Json | null
          is_active: boolean | null
          low_stock_threshold: number | null
          name: string
          price: number
          rating_average: number | null
          rating_count: number | null
          sale_price: number | null
          sales_count: number | null
          seo_description: string | null
          seo_title: string | null
          sku: string | null
          slug: string
          stock_quantity: number | null
          tags: string[] | null
          updated_at: string | null
          variants: Json | null
          vendor_id: string
          views_count: number | null
        }
        Insert: {
          auto_disable_out_of_stock?: boolean | null
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          faqs?: Json | null
          id?: string
          images?: Json | null
          is_active?: boolean | null
          low_stock_threshold?: number | null
          name: string
          price: number
          rating_average?: number | null
          rating_count?: number | null
          sale_price?: number | null
          sales_count?: number | null
          seo_description?: string | null
          seo_title?: string | null
          sku?: string | null
          slug: string
          stock_quantity?: number | null
          tags?: string[] | null
          updated_at?: string | null
          variants?: Json | null
          vendor_id: string
          views_count?: number | null
        }
        Update: {
          auto_disable_out_of_stock?: boolean | null
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          faqs?: Json | null
          id?: string
          images?: Json | null
          is_active?: boolean | null
          low_stock_threshold?: number | null
          name?: string
          price?: number
          rating_average?: number | null
          rating_count?: number | null
          sale_price?: number | null
          sales_count?: number | null
          seo_description?: string | null
          seo_title?: string | null
          sku?: string | null
          slug?: string
          stock_quantity?: number | null
          tags?: string[] | null
          updated_at?: string | null
          variants?: Json | null
          vendor_id?: string
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string | null
          customer_id: string | null
          id: string
          is_reported: boolean | null
          is_verified_purchase: boolean | null
          order_id: string | null
          product_id: string
          rating: number
          updated_at: string | null
          vendor_response: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          customer_id?: string | null
          id?: string
          is_reported?: boolean | null
          is_verified_purchase?: boolean | null
          order_id?: string | null
          product_id: string
          rating: number
          updated_at?: string | null
          vendor_response?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          customer_id?: string | null
          id?: string
          is_reported?: boolean | null
          is_verified_purchase?: boolean | null
          order_id?: string | null
          product_id?: string
          rating?: number
          updated_at?: string | null
          vendor_response?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      settlements: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          notes: string | null
          paid_at: string | null
          payment_method: string | null
          reference_number: string | null
          status: string | null
          vendor_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          notes?: string | null
          paid_at?: string | null
          payment_method?: string | null
          reference_number?: string | null
          status?: string | null
          vendor_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          notes?: string | null
          paid_at?: string | null
          payment_method?: string | null
          reference_number?: string | null
          status?: string | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "settlements_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_history: {
        Row: {
          change_amount: number
          created_at: string | null
          created_by: string | null
          id: string
          new_quantity: number
          product_id: string
          reason: string | null
        }
        Insert: {
          change_amount: number
          created_at?: string | null
          created_by?: string | null
          id?: string
          new_quantity: number
          product_id: string
          reason?: string | null
        }
        Update: {
          change_amount?: number
          created_at?: string | null
          created_by?: string | null
          id?: string
          new_quantity?: number
          product_id?: string
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_history_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          admin_response: string | null
          created_at: string | null
          id: string
          message: string
          priority: string | null
          status: string | null
          subject: string
          updated_at: string | null
          vendor_id: string
        }
        Insert: {
          admin_response?: string | null
          created_at?: string | null
          id?: string
          message: string
          priority?: string | null
          status?: string | null
          subject: string
          updated_at?: string | null
          vendor_id: string
        }
        Update: {
          admin_response?: string | null
          created_at?: string | null
          id?: string
          message?: string
          priority?: string | null
          status?: string | null
          subject?: string
          updated_at?: string | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          setting_key: string
          setting_type: string
          setting_value: Json
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          setting_key: string
          setting_type?: string
          setting_value?: Json
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          setting_key?: string
          setting_type?: string
          setting_value?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vendor_applications: {
        Row: {
          account_number: string
          account_title: string
          admin_notes: string | null
          bank_name: string
          bank_statement_url: string | null
          business_license_url: string | null
          business_type: string
          city: string | null
          country: string | null
          created_at: string | null
          email: string
          full_name: string
          id: string
          id_proof_url: string | null
          main_category: string
          ntn_certificate_url: string | null
          ntn_number: string | null
          other_documents: Json | null
          phone: string
          planned_products: number | null
          pricing_range: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          store_address: string | null
          store_banner: string | null
          store_description: string | null
          store_logo: string | null
          store_name: string
          sub_category: string | null
          user_id: string
        }
        Insert: {
          account_number: string
          account_title: string
          admin_notes?: string | null
          bank_name: string
          bank_statement_url?: string | null
          business_license_url?: string | null
          business_type: string
          city?: string | null
          country?: string | null
          created_at?: string | null
          email: string
          full_name: string
          id?: string
          id_proof_url?: string | null
          main_category: string
          ntn_certificate_url?: string | null
          ntn_number?: string | null
          other_documents?: Json | null
          phone: string
          planned_products?: number | null
          pricing_range?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          store_address?: string | null
          store_banner?: string | null
          store_description?: string | null
          store_logo?: string | null
          store_name: string
          sub_category?: string | null
          user_id: string
        }
        Update: {
          account_number?: string
          account_title?: string
          admin_notes?: string | null
          bank_name?: string
          bank_statement_url?: string | null
          business_license_url?: string | null
          business_type?: string
          city?: string | null
          country?: string | null
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          id_proof_url?: string | null
          main_category?: string
          ntn_certificate_url?: string | null
          ntn_number?: string | null
          other_documents?: Json | null
          phone?: string
          planned_products?: number | null
          pricing_range?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          store_address?: string | null
          store_banner?: string | null
          store_description?: string | null
          store_logo?: string | null
          store_name?: string
          sub_category?: string | null
          user_id?: string
        }
        Relationships: []
      }
      vendors: {
        Row: {
          address: string | null
          bank_details: Json | null
          commission_rate: number | null
          created_at: string | null
          email: string | null
          id: string
          is_approved: boolean | null
          phone: string | null
          social_links: Json | null
          store_banner: string | null
          store_description: string | null
          store_logo: string | null
          store_name: string
          updated_at: string | null
          user_id: string
          wallet_balance: number | null
          working_hours: string | null
        }
        Insert: {
          address?: string | null
          bank_details?: Json | null
          commission_rate?: number | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_approved?: boolean | null
          phone?: string | null
          social_links?: Json | null
          store_banner?: string | null
          store_description?: string | null
          store_logo?: string | null
          store_name: string
          updated_at?: string | null
          user_id: string
          wallet_balance?: number | null
          working_hours?: string | null
        }
        Update: {
          address?: string | null
          bank_details?: Json | null
          commission_rate?: number | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_approved?: boolean | null
          phone?: string | null
          social_links?: Json | null
          store_banner?: string | null
          store_description?: string | null
          store_logo?: string | null
          store_name?: string
          updated_at?: string | null
          user_id?: string
          wallet_balance?: number | null
          working_hours?: string | null
        }
        Relationships: []
      }
      wishlist_items: {
        Row: {
          created_at: string | null
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      approve_vendor_application: {
        Args: { application_id: string }
        Returns: undefined
      }
      generate_order_number: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      use_admin_invite_code: {
        Args: { _code: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "vendor" | "customer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "vendor", "customer"],
    },
  },
} as const
