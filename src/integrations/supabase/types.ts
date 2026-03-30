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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      cities: {
        Row: {
          country: string | null
          created_at: string
          id: string
          name: string
          slug: string
        }
        Insert: {
          country?: string | null
          created_at?: string
          id?: string
          name: string
          slug: string
        }
        Update: {
          country?: string | null
          created_at?: string
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      cuisines: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      job_applications: {
        Row: {
          cover_letter: string | null
          created_at: string
          id: string
          job_id: string
          status: Database["public"]["Enums"]["application_status"] | null
          user_id: string
        }
        Insert: {
          cover_letter?: string | null
          created_at?: string
          id?: string
          job_id: string
          status?: Database["public"]["Enums"]["application_status"] | null
          user_id: string
        }
        Update: {
          cover_letter?: string | null
          created_at?: string
          id?: string
          job_id?: string
          status?: Database["public"]["Enums"]["application_status"] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_categories: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      job_seekers: {
        Row: {
          about: string | null
          city: string | null
          created_at: string
          full_name: string
          id: string
          job_categories: string[] | null
          phone: string | null
          schedule_types: string[] | null
          title: string | null
          updated_at: string
          user_id: string
          visibility_status:
            | Database["public"]["Enums"]["visibility_status"]
            | null
        }
        Insert: {
          about?: string | null
          city?: string | null
          created_at?: string
          full_name: string
          id?: string
          job_categories?: string[] | null
          phone?: string | null
          schedule_types?: string[] | null
          title?: string | null
          updated_at?: string
          user_id: string
          visibility_status?:
            | Database["public"]["Enums"]["visibility_status"]
            | null
        }
        Update: {
          about?: string | null
          city?: string | null
          created_at?: string
          full_name?: string
          id?: string
          job_categories?: string[] | null
          phone?: string | null
          schedule_types?: string[] | null
          title?: string | null
          updated_at?: string
          user_id?: string
          visibility_status?:
            | Database["public"]["Enums"]["visibility_status"]
            | null
        }
        Relationships: []
      }
      jobs: {
        Row: {
          city: string | null
          created_at: string
          currency: string | null
          description: string | null
          employment_type: string | null
          id: string
          published_at: string | null
          restaurant_id: string
          salary_max: number | null
          salary_min: number | null
          slug: string
          status: Database["public"]["Enums"]["job_status"] | null
          title: string
        }
        Insert: {
          city?: string | null
          created_at?: string
          currency?: string | null
          description?: string | null
          employment_type?: string | null
          id?: string
          published_at?: string | null
          restaurant_id: string
          salary_max?: number | null
          salary_min?: number | null
          slug: string
          status?: Database["public"]["Enums"]["job_status"] | null
          title: string
        }
        Update: {
          city?: string | null
          created_at?: string
          currency?: string | null
          description?: string | null
          employment_type?: string | null
          id?: string
          published_at?: string | null
          restaurant_id?: string
          salary_max?: number | null
          salary_min?: number | null
          slug?: string
          status?: Database["public"]["Enums"]["job_status"] | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "jobs_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_categories: {
        Row: {
          created_at: string
          description: string | null
          icon_name: string
          id: string
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon_name?: string
          id?: string
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          icon_name?: string
          id?: string
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      posts: {
        Row: {
          author_id: string | null
          category: string | null
          content: string | null
          cover_image: string | null
          created_at: string
          excerpt: string | null
          id: string
          is_featured: boolean | null
          published_at: string | null
          read_time: number | null
          slug: string
          status: string
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          category?: string | null
          content?: string | null
          cover_image?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          is_featured?: boolean | null
          published_at?: string | null
          read_time?: number | null
          slug: string
          status?: string
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          category?: string | null
          content?: string | null
          cover_image?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          is_featured?: boolean | null
          published_at?: string | null
          read_time?: number | null
          slug?: string
          status?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      properties: {
        Row: {
          address: string | null
          area_sqm: number | null
          city: string | null
          contact_email: string | null
          contact_phone: string | null
          cover_image: string | null
          created_at: string
          currency: string | null
          description: string | null
          id: string
          images: string[] | null
          is_published: boolean | null
          listing_type: string
          owner_user_id: string
          price: number | null
          property_type: string
          slug: string
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          area_sqm?: number | null
          city?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          cover_image?: string | null
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          images?: string[] | null
          is_published?: boolean | null
          listing_type: string
          owner_user_id: string
          price?: number | null
          property_type: string
          slug: string
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          area_sqm?: number | null
          city?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          cover_image?: string | null
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          images?: string[] | null
          is_published?: boolean | null
          listing_type?: string
          owner_user_id?: string
          price?: number | null
          property_type?: string
          slug?: string
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      real_estate_agents: {
        Row: {
          city: string | null
          company_name: string
          created_at: string
          id: string
          owner_user_id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          city?: string | null
          company_name: string
          created_at?: string
          id?: string
          owner_user_id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          city?: string | null
          company_name?: string
          created_at?: string
          id?: string
          owner_user_id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      restaurants: {
        Row: {
          address: string | null
          city: string | null
          created_at: string
          cuisine_tags: string[] | null
          description: string | null
          id: string
          is_published: boolean | null
          name: string
          owner_user_id: string
          phone: string | null
          price_level: number | null
          slug: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string
          cuisine_tags?: string[] | null
          description?: string | null
          id?: string
          is_published?: boolean | null
          name: string
          owner_user_id: string
          phone?: string | null
          price_level?: number | null
          slug?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string
          cuisine_tags?: string[] | null
          description?: string | null
          id?: string
          is_published?: boolean | null
          name?: string
          owner_user_id?: string
          phone?: string | null
          price_level?: number | null
          slug?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      rfq_responses: {
        Row: {
          created_at: string
          currency: string | null
          id: string
          message: string | null
          price_estimate: number | null
          responder_type: string
          responder_user_id: string
          rfq_id: string
        }
        Insert: {
          created_at?: string
          currency?: string | null
          id?: string
          message?: string | null
          price_estimate?: number | null
          responder_type: string
          responder_user_id: string
          rfq_id: string
        }
        Update: {
          created_at?: string
          currency?: string | null
          id?: string
          message?: string | null
          price_estimate?: number | null
          responder_type?: string
          responder_user_id?: string
          rfq_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rfq_responses_rfq_id_fkey"
            columns: ["rfq_id"]
            isOneToOne: false
            referencedRelation: "rfqs"
            referencedColumns: ["id"]
          },
        ]
      }
      rfqs: {
        Row: {
          category: string | null
          created_at: string
          deadline: string | null
          description: string | null
          id: string
          restaurant_id: string
          rfq_type: Database["public"]["Enums"]["rfq_type"]
          status: Database["public"]["Enums"]["rfq_status"]
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          id?: string
          restaurant_id: string
          rfq_type?: Database["public"]["Enums"]["rfq_type"]
          status?: Database["public"]["Enums"]["rfq_status"]
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          id?: string
          restaurant_id?: string
          rfq_type?: Database["public"]["Enums"]["rfq_type"]
          status?: Database["public"]["Enums"]["rfq_status"]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      service_provider_categories: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      service_provider_offers: {
        Row: {
          created_at: string
          currency: string | null
          description: string | null
          id: string
          is_active: boolean | null
          price_from: number | null
          service_provider_id: string
          title: string
          type: Database["public"]["Enums"]["offer_type"] | null
        }
        Insert: {
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          price_from?: number | null
          service_provider_id: string
          title: string
          type?: Database["public"]["Enums"]["offer_type"] | null
        }
        Update: {
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          price_from?: number | null
          service_provider_id?: string
          title?: string
          type?: Database["public"]["Enums"]["offer_type"] | null
        }
        Relationships: [
          {
            foreignKeyName: "service_provider_offers_service_provider_id_fkey"
            columns: ["service_provider_id"]
            isOneToOne: false
            referencedRelation: "service_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      service_providers: {
        Row: {
          address: string | null
          categories: string[] | null
          city: string | null
          coverage_areas: string[] | null
          created_at: string
          description: string | null
          id: string
          is_published: boolean | null
          name: string
          owner_user_id: string
          phone: string | null
          slug: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          categories?: string[] | null
          city?: string | null
          coverage_areas?: string[] | null
          created_at?: string
          description?: string | null
          id?: string
          is_published?: boolean | null
          name: string
          owner_user_id: string
          phone?: string | null
          slug?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          categories?: string[] | null
          city?: string | null
          coverage_areas?: string[] | null
          created_at?: string
          description?: string | null
          id?: string
          is_published?: boolean | null
          name?: string
          owner_user_id?: string
          phone?: string | null
          slug?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          billing_period: Database["public"]["Enums"]["subscription_billing"]
          created_at: string
          id: string
          plan: Database["public"]["Enums"]["subscription_plan"]
          updated_at: string
          user_id: string
        }
        Insert: {
          billing_period?: Database["public"]["Enums"]["subscription_billing"]
          created_at?: string
          id?: string
          plan?: Database["public"]["Enums"]["subscription_plan"]
          updated_at?: string
          user_id: string
        }
        Update: {
          billing_period?: Database["public"]["Enums"]["subscription_billing"]
          created_at?: string
          id?: string
          plan?: Database["public"]["Enums"]["subscription_plan"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      supplier_categories: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      supplier_offers: {
        Row: {
          created_at: string
          currency: string | null
          description: string | null
          id: string
          is_active: boolean | null
          price_from: number | null
          supplier_id: string
          title: string
          type: Database["public"]["Enums"]["offer_type"] | null
        }
        Insert: {
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          price_from?: number | null
          supplier_id: string
          title: string
          type?: Database["public"]["Enums"]["offer_type"] | null
        }
        Update: {
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          price_from?: number | null
          supplier_id?: string
          title?: string
          type?: Database["public"]["Enums"]["offer_type"] | null
        }
        Relationships: [
          {
            foreignKeyName: "supplier_offers_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          address: string | null
          categories: string[] | null
          city: string | null
          coverage_areas: string[] | null
          created_at: string
          description: string | null
          id: string
          is_published: boolean | null
          name: string
          owner_user_id: string
          phone: string | null
          slug: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          categories?: string[] | null
          city?: string | null
          coverage_areas?: string[] | null
          created_at?: string
          description?: string | null
          id?: string
          is_published?: boolean | null
          name: string
          owner_user_id: string
          phone?: string | null
          slug?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          categories?: string[] | null
          city?: string | null
          coverage_areas?: string[] | null
          created_at?: string
          description?: string | null
          id?: string
          is_published?: boolean | null
          name?: string
          owner_user_id?: string
          phone?: string | null
          slug?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_active_subscription: { Args: { _user_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role:
        | "restaurant"
        | "supplier"
        | "jobseeker"
        | "admin"
        | "serviceprovider"
        | "realestate"
      application_status:
        | "APPLIED"
        | "SHORTLISTED"
        | "INTERVIEW"
        | "OFFERED"
        | "REJECTED"
        | "HIRED"
      job_status: "DRAFT" | "PUBLISHED" | "CLOSED"
      offer_type: "PRODUCT" | "SERVICE"
      rfq_status: "OPEN" | "CLOSED" | "AWARDED"
      rfq_type: "GOODS" | "SERVICES"
      subscription_billing: "monthly" | "annual"
      subscription_plan: "free" | "standard" | "premium"
      visibility_status: "PRIVATE" | "PUBLIC"
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
      app_role: [
        "restaurant",
        "supplier",
        "jobseeker",
        "admin",
        "serviceprovider",
        "realestate",
      ],
      application_status: [
        "APPLIED",
        "SHORTLISTED",
        "INTERVIEW",
        "OFFERED",
        "REJECTED",
        "HIRED",
      ],
      job_status: ["DRAFT", "PUBLISHED", "CLOSED"],
      offer_type: ["PRODUCT", "SERVICE"],
      rfq_status: ["OPEN", "CLOSED", "AWARDED"],
      rfq_type: ["GOODS", "SERVICES"],
      subscription_billing: ["monthly", "annual"],
      subscription_plan: ["free", "standard", "premium"],
      visibility_status: ["PRIVATE", "PUBLIC"],
    },
  },
} as const
