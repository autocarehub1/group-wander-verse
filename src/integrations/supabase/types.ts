export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      accommodation_options: {
        Row: {
          amenities: string[] | null
          capacity: number | null
          check_in_date: string | null
          check_out_date: string | null
          created_at: string | null
          external_data: Json | null
          external_url: string | null
          id: string
          location: string | null
          name: string
          price_per_night: number | null
          suggested_by: string | null
          trip_id: string
          type: string | null
          updated_at: string | null
        }
        Insert: {
          amenities?: string[] | null
          capacity?: number | null
          check_in_date?: string | null
          check_out_date?: string | null
          created_at?: string | null
          external_data?: Json | null
          external_url?: string | null
          id?: string
          location?: string | null
          name: string
          price_per_night?: number | null
          suggested_by?: string | null
          trip_id: string
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          amenities?: string[] | null
          capacity?: number | null
          check_in_date?: string | null
          check_out_date?: string | null
          created_at?: string | null
          external_data?: Json | null
          external_url?: string | null
          id?: string
          location?: string | null
          name?: string
          price_per_night?: number | null
          suggested_by?: string | null
          trip_id?: string
          type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "accommodation_options_suggested_by_fkey"
            columns: ["suggested_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accommodation_options_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      accommodation_votes: {
        Row: {
          accommodation_id: string
          created_at: string | null
          id: string
          user_id: string
          vote_type: string
        }
        Insert: {
          accommodation_id: string
          created_at?: string | null
          id?: string
          user_id: string
          vote_type: string
        }
        Update: {
          accommodation_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
          vote_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "accommodation_votes_accommodation_id_fkey"
            columns: ["accommodation_id"]
            isOneToOne: false
            referencedRelation: "accommodation_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accommodation_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_suggestions: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          estimated_cost: number | null
          estimated_duration: number | null
          external_data: Json | null
          external_id: string | null
          id: string
          location: string | null
          suggested_by: string | null
          title: string
          trip_id: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          estimated_cost?: number | null
          estimated_duration?: number | null
          external_data?: Json | null
          external_id?: string | null
          id?: string
          location?: string | null
          suggested_by?: string | null
          title: string
          trip_id: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          estimated_cost?: number | null
          estimated_duration?: number | null
          external_data?: Json | null
          external_id?: string | null
          id?: string
          location?: string | null
          suggested_by?: string | null
          title?: string
          trip_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_suggestions_suggested_by_fkey"
            columns: ["suggested_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_suggestions_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_votes: {
        Row: {
          activity_id: string
          created_at: string | null
          id: string
          user_id: string
          vote_type: string
        }
        Insert: {
          activity_id: string
          created_at?: string | null
          id?: string
          user_id: string
          vote_type: string
        }
        Update: {
          activity_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
          vote_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_votes_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activity_suggestions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      expense_participants: {
        Row: {
          amount: number
          expense_id: string
          paid: boolean | null
          user_id: string
        }
        Insert: {
          amount: number
          expense_id: string
          paid?: boolean | null
          user_id: string
        }
        Update: {
          amount?: number
          expense_id?: string
          paid?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expense_participants_expense_id_fkey"
            columns: ["expense_id"]
            isOneToOne: false
            referencedRelation: "expenses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expense_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      expense_splits: {
        Row: {
          amount: number
          created_at: string | null
          expense_id: string
          id: string
          is_paid: boolean | null
          paid_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          expense_id: string
          id?: string
          is_paid?: boolean | null
          paid_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          expense_id?: string
          id?: string
          is_paid?: boolean | null
          paid_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expense_splits_expense_id_fkey"
            columns: ["expense_id"]
            isOneToOne: false
            referencedRelation: "trip_expenses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expense_splits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          category: string
          created_at: string | null
          date: string | null
          id: string
          paid_by: string | null
          title: string
          trip_id: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          category: string
          created_at?: string | null
          date?: string | null
          id?: string
          paid_by?: string | null
          title: string
          trip_id?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string | null
          date?: string | null
          id?: string
          paid_by?: string | null
          title?: string
          trip_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expenses_paid_by_fkey"
            columns: ["paid_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      friend_connections: {
        Row: {
          created_at: string | null
          user_id1: string
          user_id2: string
        }
        Insert: {
          created_at?: string | null
          user_id1: string
          user_id2: string
        }
        Update: {
          created_at?: string | null
          user_id1?: string
          user_id2?: string
        }
        Relationships: [
          {
            foreignKeyName: "friend_connections_user_id1_fkey"
            columns: ["user_id1"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friend_connections_user_id2_fkey"
            columns: ["user_id2"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      friend_requests: {
        Row: {
          created_at: string | null
          id: string
          receiver_id: string | null
          sender_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          receiver_id?: string | null
          sender_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          receiver_id?: string | null
          sender_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "friend_requests_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friend_requests_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      itineraries: {
        Row: {
          created_at: string | null
          data: Json
          id: string
          status: string
          trip_id: string | null
          updated_at: string | null
          version: number
        }
        Insert: {
          created_at?: string | null
          data?: Json
          id?: string
          status?: string
          trip_id?: string | null
          updated_at?: string | null
          version?: number
        }
        Update: {
          created_at?: string | null
          data?: Json
          id?: string
          status?: string
          trip_id?: string | null
          updated_at?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "itineraries_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      itinerary_days: {
        Row: {
          created_at: string | null
          created_by: string | null
          day_date: string
          description: string | null
          id: string
          title: string | null
          trip_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          day_date: string
          description?: string | null
          id?: string
          title?: string | null
          trip_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          day_date?: string
          description?: string | null
          id?: string
          title?: string | null
          trip_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "itinerary_days_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itinerary_days_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      itinerary_items: {
        Row: {
          category: string | null
          cost: number | null
          created_at: string | null
          created_by: string | null
          day_id: string
          description: string | null
          end_time: string | null
          id: string
          location: string | null
          order_index: number | null
          start_time: string | null
          status: string | null
          title: string
          trip_id: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          cost?: number | null
          created_at?: string | null
          created_by?: string | null
          day_id: string
          description?: string | null
          end_time?: string | null
          id?: string
          location?: string | null
          order_index?: number | null
          start_time?: string | null
          status?: string | null
          title: string
          trip_id: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          cost?: number | null
          created_at?: string | null
          created_by?: string | null
          day_id?: string
          description?: string | null
          end_time?: string | null
          id?: string
          location?: string | null
          order_index?: number | null
          start_time?: string | null
          status?: string | null
          title?: string
          trip_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "itinerary_items_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itinerary_items_day_id_fkey"
            columns: ["day_id"]
            isOneToOne: false
            referencedRelation: "itinerary_days"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itinerary_items_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string | null
          edited_at: string | null
          file_name: string | null
          file_size: number | null
          file_url: string | null
          id: string
          message_type: string
          reply_to_message_id: string | null
          sender_id: string
          trip_id: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          edited_at?: string | null
          file_name?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          message_type?: string
          reply_to_message_id?: string | null
          sender_id: string
          trip_id: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          edited_at?: string | null
          file_name?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          message_type?: string
          reply_to_message_id?: string | null
          sender_id?: string
          trip_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_reply_to_message_id_fkey"
            columns: ["reply_to_message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          created_at: string
          id: string
          location_name: string
          photos: Json | null
          rating: number
          review_text: string | null
          review_type: string | null
          trip_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          location_name: string
          photos?: Json | null
          rating: number
          review_text?: string | null
          review_type?: string | null
          trip_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          location_name?: string
          photos?: Json | null
          rating?: number
          review_text?: string | null
          review_type?: string | null
          trip_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      trip_documents: {
        Row: {
          created_at: string | null
          description: string | null
          document_type: string | null
          file_name: string
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          is_private: boolean | null
          trip_id: string
          updated_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          document_type?: string | null
          file_name: string
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          is_private?: boolean | null
          trip_id: string
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          document_type?: string | null
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          is_private?: boolean | null
          trip_id?: string
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trip_documents_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trip_documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      trip_expenses: {
        Row: {
          amount: number
          category: string | null
          created_at: string | null
          currency: string | null
          description: string | null
          expense_date: string | null
          id: string
          is_shared: boolean | null
          paid_by: string | null
          receipt_url: string | null
          title: string
          trip_id: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          category?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          expense_date?: string | null
          id?: string
          is_shared?: boolean | null
          paid_by?: string | null
          receipt_url?: string | null
          title: string
          trip_id: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          category?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          expense_date?: string | null
          id?: string
          is_shared?: boolean | null
          paid_by?: string | null
          receipt_url?: string | null
          title?: string
          trip_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trip_expenses_paid_by_fkey"
            columns: ["paid_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trip_expenses_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      trip_invitations: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          invitation_token: string | null
          invite_type: string
          invite_value: string | null
          invited_by: string
          message: string | null
          status: string
          trip_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          invitation_token?: string | null
          invite_type: string
          invite_value?: string | null
          invited_by: string
          message?: string | null
          status?: string
          trip_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          invitation_token?: string | null
          invite_type?: string
          invite_value?: string | null
          invited_by?: string
          message?: string | null
          status?: string
          trip_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trip_invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trip_invitations_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      trip_participants: {
        Row: {
          invitation_id: string | null
          joined_at: string | null
          role: string | null
          status: string | null
          trip_id: string
          user_id: string
        }
        Insert: {
          invitation_id?: string | null
          joined_at?: string | null
          role?: string | null
          status?: string | null
          trip_id: string
          user_id: string
        }
        Update: {
          invitation_id?: string | null
          joined_at?: string | null
          role?: string | null
          status?: string | null
          trip_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trip_participants_invitation_id_fkey"
            columns: ["invitation_id"]
            isOneToOne: false
            referencedRelation: "trip_invitations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trip_participants_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trip_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      trips: {
        Row: {
          budget_total: number | null
          created_at: string | null
          created_by: string | null
          currency: string | null
          description: string | null
          destination: string
          end_date: string | null
          group_settings: Json | null
          id: string
          image_url: string | null
          planning_status: string | null
          start_date: string | null
          status: string | null
          title: string
          trip_type: string | null
          updated_at: string | null
        }
        Insert: {
          budget_total?: number | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          description?: string | null
          destination: string
          end_date?: string | null
          group_settings?: Json | null
          id?: string
          image_url?: string | null
          planning_status?: string | null
          start_date?: string | null
          status?: string | null
          title: string
          trip_type?: string | null
          updated_at?: string | null
        }
        Update: {
          budget_total?: number | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          description?: string | null
          destination?: string
          end_date?: string | null
          group_settings?: Json | null
          id?: string
          image_url?: string | null
          planning_status?: string | null
          start_date?: string | null
          status?: string | null
          title?: string
          trip_type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trips_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          accessibility_needs: Json | null
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          date_of_birth: string | null
          dietary_restrictions: Json | null
          email: string
          emergency_contact: Json | null
          full_name: string | null
          id: string
          notification_preferences: Json | null
          phone: string | null
          privacy_settings: Json | null
          travel_preferences: Json | null
          updated_at: string | null
        }
        Insert: {
          accessibility_needs?: Json | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          dietary_restrictions?: Json | null
          email: string
          emergency_contact?: Json | null
          full_name?: string | null
          id: string
          notification_preferences?: Json | null
          phone?: string | null
          privacy_settings?: Json | null
          travel_preferences?: Json | null
          updated_at?: string | null
        }
        Update: {
          accessibility_needs?: Json | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          dietary_restrictions?: Json | null
          email?: string
          emergency_contact?: Json | null
          full_name?: string | null
          id?: string
          notification_preferences?: Json | null
          phone?: string | null
          privacy_settings?: Json | null
          travel_preferences?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_friend_request: {
        Args: { request_id: string }
        Returns: undefined
      }
      accept_trip_invitation: {
        Args: { invitation_token: string }
        Returns: Json
      }
      check_trip_ownership: {
        Args: { trip_uuid: string; user_uuid: string }
        Returns: boolean
      }
      is_trip_participant: {
        Args: { trip_uuid: string }
        Returns: boolean
      }
      is_trip_participant_check: {
        Args: { trip_uuid: string; user_uuid: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
