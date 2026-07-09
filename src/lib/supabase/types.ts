// AVOID UPDATING THIS FILE DIRECTLY. It is automatically generated.
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.5'
  }
  public: {
    Tables: {
      gym_settings: {
        Row: {
          id: string
          target_completion_rate: number
          updated_at: string
        }
        Insert: {
          id?: string
          target_completion_rate?: number
          updated_at?: string
        }
        Update: {
          id?: string
          target_completion_rate?: number
          updated_at?: string
        }
        Relationships: []
      }
      maintenance_tickets: {
        Row: {
          created_at: string
          created_by: string | null
          description: string
          id: string
          status: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description: string
          id?: string
          status?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string
          id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: 'maintenance_tickets_created_by_fkey'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read: boolean
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read?: boolean
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'notifications_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          role: Database['public']['Enums']['user_role_enum']
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          role?: Database['public']['Enums']['user_role_enum']
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          role?: Database['public']['Enums']['user_role_enum']
        }
        Relationships: []
      }
      shopping_list: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          is_purchased: boolean
          item_name: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_purchased?: boolean
          item_name: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_purchased?: boolean
          item_name?: string
        }
        Relationships: [
          {
            foreignKeyName: 'shopping_list_created_by_fkey'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      stock_items: {
        Row: {
          id: string
          name: string
          quantity: number
          unit: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          quantity?: number
          unit?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          quantity?: number
          unit?: string
          updated_at?: string
        }
        Relationships: []
      }
      task_categories: {
        Row: {
          created_at: string
          end_time: string | null
          id: string
          name: string
          start_time: string | null
        }
        Insert: {
          created_at?: string
          end_time?: string | null
          id?: string
          name: string
          start_time?: string | null
        }
        Update: {
          created_at?: string
          end_time?: string | null
          id?: string
          name?: string
          start_time?: string | null
        }
        Relationships: []
      }
      task_completions: {
        Row: {
          completed_at: string
          completed_by: string | null
          id: string
          notes: string | null
          task_id: string
        }
        Insert: {
          completed_at?: string
          completed_by?: string | null
          id?: string
          notes?: string | null
          task_id: string
        }
        Update: {
          completed_at?: string
          completed_by?: string | null
          id?: string
          notes?: string | null
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'task_completions_completed_by_fkey'
            columns: ['completed_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'task_completions_task_id_fkey'
            columns: ['task_id']
            isOneToOne: false
            referencedRelation: 'tasks'
            referencedColumns: ['id']
          },
        ]
      }
      task_exceptions: {
        Row: {
          id: string
          reason: string
          skipped_at: string
          skipped_by: string | null
          task_id: string
        }
        Insert: {
          id?: string
          reason: string
          skipped_at?: string
          skipped_by?: string | null
          task_id: string
        }
        Update: {
          id?: string
          reason?: string
          skipped_at?: string
          skipped_by?: string | null
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'task_exceptions_skipped_by_fkey'
            columns: ['skipped_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'task_exceptions_task_id_fkey'
            columns: ['task_id']
            isOneToOne: false
            referencedRelation: 'tasks'
            referencedColumns: ['id']
          },
        ]
      }
      tasks: {
        Row: {
          category: string
          category_id: string | null
          created_at: string
          description: string | null
          expected_time: string | null
          id: string
          is_active: boolean
          is_recurring: boolean
          priority: string
          recurrence_days: string[] | null
          recurrence_type: string | null
          title: string
        }
        Insert: {
          category: string
          category_id?: string | null
          created_at?: string
          description?: string | null
          expected_time?: string | null
          id?: string
          is_active?: boolean
          is_recurring?: boolean
          priority?: string
          recurrence_days?: string[] | null
          recurrence_type?: string | null
          title: string
        }
        Update: {
          category?: string
          category_id?: string | null
          created_at?: string
          description?: string | null
          expected_time?: string | null
          id?: string
          is_active?: boolean
          is_recurring?: boolean
          priority?: string
          recurrence_days?: string[] | null
          recurrence_type?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: 'tasks_category_id_fkey'
            columns: ['category_id']
            isOneToOne: false
            referencedRelation: 'task_categories'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role_enum: 'owner' | 'receptionist'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      user_role_enum: ['owner', 'receptionist'],
    },
  },
} as const
