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
            leads: {
                Row: {
                    id: string
                    created_at: string
                    nombre: string
                    email: string | null
                    telefono: string | null
                    empresa: string | null
                    estado: string
                    fuente_id: string | null
                    asignado_a: string | null
                    calificacion: string | null
                    notas: string | null
                    updated_at: string
                }
                Insert: {
                    id?: string
                    created_at?: string
                    nombre: string
                    email?: string | null
                    telefono?: string | null
                    empresa?: string | null
                    estado?: string
                    fuente_id?: string | null
                    asignado_a?: string | null
                    calificacion?: string | null
                    notas?: string | null
                    updated_at?: string
                }
                Update: {
                    id?: string
                    created_at?: string
                    nombre?: string
                    email?: string | null
                    telefono?: string | null
                    empresa?: string | null
                    estado?: string
                    fuente_id?: string | null
                    asignado_a?: string | null
                    calificacion?: string | null
                    notas?: string | null
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "leads_asignado_a_fkey"
                        columns: ["asignado_a"]
                        referencedRelation: "usuarios"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "leads_fuente_id_fkey"
                        columns: ["fuente_id"]
                        referencedRelation: "fuentes_leads"
                        referencedColumns: ["id"]
                    }
                ]
            }
            fuentes_leads: {
                Row: {
                    id: string
                    created_at: string
                    nombre: string
                    descripcion: string | null
                }
                Insert: {
                    id?: string
                    created_at?: string
                    nombre: string
                    descripcion?: string | null
                }
                Update: {
                    id?: string
                    created_at?: string
                    nombre?: string
                    descripcion?: string | null
                }
                Relationships: []
            }
            usuarios: {
                Row: {
                    id: string
                    created_at: string
                    email: string
                    nombre_completo: string | null
                    rol_id: string | null
                    avatar_url: string | null
                    estado: string
                }
                Insert: {
                    id: string
                    created_at?: string
                    email: string
                    nombre_completo?: string | null
                    rol_id?: string | null
                    avatar_url?: string | null
                    estado?: string
                }
                Update: {
                    id?: string
                    created_at?: string
                    email?: string
                    nombre_completo?: string | null
                    rol_id?: string | null
                    avatar_url?: string | null
                    estado?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "usuarios_rol_id_fkey"
                        columns: ["rol_id"]
                        referencedRelation: "roles"
                        referencedColumns: ["id"]
                    }
                ]
            }
            roles: {
                Row: {
                    id: string
                    created_at: string
                    nombre: string
                    descripcion: string | null
                    permisos: Json
                }
                Insert: {
                    id?: string
                    created_at?: string
                    nombre: string
                    descripcion?: string | null
                    permisos?: Json
                }
                Update: {
                    id?: string
                    created_at?: string
                    nombre?: string
                    descripcion?: string | null
                    permisos?: Json
                }
                Relationships: []
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            get_dashboard_stats: {
                Args: {
                    p_usuario_id: string
                }
                Returns: {
                    leads_nuevos: number
                    leads_convertidos: number
                    citas_programadas: number
                    valor_oportunidades: number
                    conversaciones_activas: number
                    actividades_pendientes: number
                }
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
