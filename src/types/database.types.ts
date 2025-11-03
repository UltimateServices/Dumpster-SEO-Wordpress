export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      geo_locations: {
        Row: {
          id: string
          city: string
          state: string
          state_abbr: string
          county: string | null
          population: number | null
          latitude: number | null
          longitude: number | null
          zip_codes: string[] | null
          priority_rank: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          city: string
          state: string
          state_abbr: string
          county?: string | null
          population?: number | null
          latitude?: number | null
          longitude?: number | null
          zip_codes?: string[] | null
          priority_rank?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          city?: string
          state?: string
          state_abbr?: string
          county?: string | null
          population?: number | null
          latitude?: number | null
          longitude?: number | null
          zip_codes?: string[] | null
          priority_rank?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      research_jobs: {
        Row: {
          id: string
          city_id: string
          page_type: 'main_city' | 'topic' | 'neighborhood'
          topic: string | null
          neighborhood: string | null
          status: 'pending' | 'processing' | 'completed' | 'failed'
          results_json: Json | null
          word_count: number | null
          questions_count: number | null
          error_message: string | null
          created_at: string
          updated_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          city_id: string
          page_type: 'main_city' | 'topic' | 'neighborhood'
          topic?: string | null
          neighborhood?: string | null
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          results_json?: Json | null
          word_count?: number | null
          questions_count?: number | null
          error_message?: string | null
          created_at?: string
          updated_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          city_id?: string
          page_type?: 'main_city' | 'topic' | 'neighborhood'
          topic?: string | null
          neighborhood?: string | null
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          results_json?: Json | null
          word_count?: number | null
          questions_count?: number | null
          error_message?: string | null
          created_at?: string
          updated_at?: string
          completed_at?: string | null
        }
      }
      wordpress_pages: {
        Row: {
          id: string
          city_id: string
          research_job_id: string | null
          wp_post_id: number
          url: string
          page_type: 'main_city' | 'topic' | 'neighborhood'
          topic: string | null
          neighborhood: string | null
          title: string
          slug: string
          parent_post_id: number | null
          status: 'publish' | 'draft' | 'pending'
          published_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          city_id: string
          research_job_id?: string | null
          wp_post_id: number
          url: string
          page_type: 'main_city' | 'topic' | 'neighborhood'
          topic?: string | null
          neighborhood?: string | null
          title: string
          slug: string
          parent_post_id?: number | null
          status?: 'publish' | 'draft' | 'pending'
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          city_id?: string
          research_job_id?: string | null
          wp_post_id?: number
          url?: string
          page_type?: 'main_city' | 'topic' | 'neighborhood'
          topic?: string | null
          neighborhood?: string | null
          title?: string
          slug?: string
          parent_post_id?: number | null
          status?: 'publish' | 'draft' | 'pending'
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      keywords: {
        Row: {
          id: string
          city_id: string
          keyword: string
          search_volume: number | null
          difficulty: number | null
          current_rank: number | null
          target_rank: number
          target_url: string | null
          last_checked: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          city_id: string
          keyword: string
          search_volume?: number | null
          difficulty?: number | null
          current_rank?: number | null
          target_rank?: number
          target_url?: string | null
          last_checked?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          city_id?: string
          keyword?: string
          search_volume?: number | null
          difficulty?: number | null
          current_rank?: number | null
          target_rank?: number
          target_url?: string | null
          last_checked?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      internal_links: {
        Row: {
          id: string
          source_page_id: string
          target_page_id: string
          anchor_text: string
          link_type: 'contextual' | 'navigational' | 'footer'
          created_at: string
        }
        Insert: {
          id?: string
          source_page_id: string
          target_page_id: string
          anchor_text: string
          link_type?: 'contextual' | 'navigational' | 'footer'
          created_at?: string
        }
        Update: {
          id?: string
          source_page_id?: string
          target_page_id?: string
          anchor_text?: string
          link_type?: 'contextual' | 'navigational' | 'footer'
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      page_type: 'main_city' | 'topic' | 'neighborhood'
      job_status: 'pending' | 'processing' | 'completed' | 'failed'
      publish_status: 'publish' | 'draft' | 'pending'
      link_type: 'contextual' | 'navigational' | 'footer'
    }
  }
}
