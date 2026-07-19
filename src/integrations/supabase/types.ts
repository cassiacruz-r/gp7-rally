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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      biblioteca: {
        Row: {
          created_at: string
          descricao: string | null
          id: string
          nome: string
          tamanho_bytes: number | null
          tipo: string
          url: string
        }
        Insert: {
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
          tamanho_bytes?: number | null
          tipo: string
          url: string
        }
        Update: {
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string
          tamanho_bytes?: number | null
          tipo?: string
          url?: string
        }
        Relationships: []
      }
      blocos_pauta: {
        Row: {
          created_at: string
          descricao: string | null
          id: string
          midia_tipo: string | null
          midia_url: string | null
          observacoes: string | null
          ordem: number
          pauta_id: string
          tempo_minutos: number
          titulo: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          descricao?: string | null
          id?: string
          midia_tipo?: string | null
          midia_url?: string | null
          observacoes?: string | null
          ordem?: number
          pauta_id: string
          tempo_minutos?: number
          titulo: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          descricao?: string | null
          id?: string
          midia_tipo?: string | null
          midia_url?: string | null
          observacoes?: string | null
          ordem?: number
          pauta_id?: string
          tempo_minutos?: number
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "blocos_pauta_pauta_id_fkey"
            columns: ["pauta_id"]
            isOneToOne: false
            referencedRelation: "pautas"
            referencedColumns: ["id"]
          },
        ]
      }
      configuracoes: {
        Row: {
          chave: string
          updated_at: string
          valor: Json
        }
        Insert: {
          chave: string
          updated_at?: string
          valor: Json
        }
        Update: {
          chave?: string
          updated_at?: string
          valor?: Json
        }
        Relationships: []
      }
      historico: {
        Row: {
          acao: string
          created_at: string
          descricao: string | null
          entidade: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          acao: string
          created_at?: string
          descricao?: string | null
          entidade?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          acao?: string
          created_at?: string
          descricao?: string | null
          entidade?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      kpis: {
        Row: {
          created_at: string
          id: string
          meta: number
          nome: string
          observacao: string | null
          ordem: number
          pontuacao: number
          resultado: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          meta?: number
          nome: string
          observacao?: string | null
          ordem?: number
          pontuacao?: number
          resultado?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          meta?: number
          nome?: string
          observacao?: string | null
          ordem?: number
          pontuacao?: number
          resultado?: number
          updated_at?: string
        }
        Relationships: []
      }
      metas: {
        Row: {
          created_at: string
          id: string
          observacao: string | null
          periodo: string
          realizado: number
          tipo: string
          titulo: string
          updated_at: string
          valor: number
        }
        Insert: {
          created_at?: string
          id?: string
          observacao?: string | null
          periodo?: string
          realizado?: number
          tipo: string
          titulo: string
          updated_at?: string
          valor?: number
        }
        Update: {
          created_at?: string
          id?: string
          observacao?: string | null
          periodo?: string
          realizado?: number
          tipo?: string
          titulo?: string
          updated_at?: string
          valor?: number
        }
        Relationships: []
      }
      pautas: {
        Row: {
          created_at: string
          descricao: string | null
          dia_semana: string
          id: string
          titulo: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          descricao?: string | null
          dia_semana: string
          id?: string
          titulo: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          descricao?: string | null
          dia_semana?: string
          id?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          foto_url: string | null
          id: string
          nome: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          foto_url?: string | null
          id: string
          nome?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          foto_url?: string | null
          id?: string
          nome?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      vendedores: {
        Row: {
          created_at: string
          equipe: string | null
          foto_url: string | null
          id: string
          meta: number
          nome: string
          observacao: string | null
          pontuacao: number
          posicao_podio: number | null
          resultado: number
          setor: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          equipe?: string | null
          foto_url?: string | null
          id?: string
          meta?: number
          nome: string
          observacao?: string | null
          pontuacao?: number
          posicao_podio?: number | null
          resultado?: number
          setor?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          equipe?: string | null
          foto_url?: string | null
          id?: string
          meta?: number
          nome?: string
          observacao?: string | null
          pontuacao?: number
          posicao_podio?: number | null
          resultado?: number
          setor?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
