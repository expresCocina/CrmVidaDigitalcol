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
            clientes: {
                Row: {
                    id: string
                    created_at: string
                    nombre: string
                    email: string | null
                    telefono: string | null
                    empresa: string | null
                    estado: string
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
                    updated_at?: string
                }
                Relationships: []
            }
            conversaciones: {
                Row: {
                    id: string
                    created_at: string
                    canal: string
                    identificador_externo: string | null
                    estado: string
                    ultimo_mensaje_at: string
                    lead_id: string | null
                    cliente_id: string | null
                    metadata: Json | null
                }
                Insert: {
                    id?: string
                    created_at?: string
                    canal: string
                    identificador_externo?: string | null
                    estado?: string
                    ultimo_mensaje_at?: string
                    lead_id?: string | null
                    cliente_id?: string | null
                    metadata?: Json | null
                }
                Update: {
                    id?: string
                    created_at?: string
                    canal?: string
                    identificador_externo?: string | null
                    estado?: string
                    ultimo_mensaje_at?: string
                    lead_id?: string | null
                    cliente_id?: string | null
                    metadata?: Json | null
                }
                Relationships: [
                    {
                        foreignKeyName: "conversaciones_lead_id_fkey"
                        columns: ["lead_id"]
                        referencedRelation: "leads"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "conversaciones_cliente_id_fkey"
                        columns: ["cliente_id"]
                        referencedRelation: "clientes"
                        referencedColumns: ["id"]
                    }
                ]
            }
            mensajes: {
                Row: {
                    id: string
                    created_at: string
                    conversacion_id: string
                    contenido: string
                    tipo: string
                    direccion: string
                    leido: boolean
                    entregado: boolean
                    enviado_por: string | null
                    metadata: Json | null
                }
                Insert: {
                    id?: string
                    created_at?: string
                    conversacion_id: string
                    contenido: string
                    tipo?: string
                    direccion: string
                    leido?: boolean
                    entregado?: boolean
                    enviado_por?: string | null
                    metadata?: Json | null
                }
                Update: {
                    id?: string
                    created_at?: string
                    conversacion_id?: string
                    contenido?: string
                    tipo?: string
                    direccion?: string
                    leido?: boolean
                    entregado?: boolean
                    enviado_por?: string | null
                    metadata?: Json | null
                }
                Relationships: [
                    {
                        foreignKeyName: "mensajes_conversacion_id_fkey"
                        columns: ["conversacion_id"]
                        referencedRelation: "conversaciones"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "mensajes_enviado_por_fkey"
                        columns: ["enviado_por"]
                        referencedRelation: "usuarios"
                        referencedColumns: ["id"]
                    }
                ]
            }
            guiones_chat: {
                Row: {
                    id: string
                    created_at: string
                    titulo: string
                    contenido: string
                    uso_count: number
                    categoria: string | null
                }
                Insert: {
                    id?: string
                    created_at?: string
                    titulo: string
                    contenido: string
                    uso_count?: number
                    categoria?: string | null
                }
                Update: {
                    id?: string
                    created_at?: string
                    titulo?: string
                    contenido?: string
                    uso_count?: number
                    categoria?: string | null
                }
                Relationships: []
            }
            citas: {
                Row: {
                    id: string
                    created_at: string
                    titulo: string
                    descripcion: string | null
                    fecha_inicio: string
                    fecha_fin: string
                    tipo: string
                    estado: string
                    ubicacion: string | null
                    lead_id: string | null
                    cliente_id: string | null
                    usuario_id: string
                }
                Insert: {
                    id?: string
                    created_at?: string
                    titulo: string
                    descripcion?: string | null
                    fecha_inicio: string
                    fecha_fin: string
                    tipo: string
                    estado?: string
                    ubicacion?: string | null
                    lead_id?: string | null
                    cliente_id?: string | null
                    usuario_id: string
                }
                Update: {
                    id?: string
                    created_at?: string
                    titulo?: string
                    descripcion?: string | null
                    fecha_inicio?: string
                    fecha_fin?: string
                    tipo?: string
                    estado?: string
                    ubicacion?: string | null
                    lead_id?: string | null
                    cliente_id?: string | null
                    usuario_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "citas_lead_id_fkey"
                        columns: ["lead_id"]
                        referencedRelation: "leads"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "citas_cliente_id_fkey"
                        columns: ["cliente_id"]
                        referencedRelation: "clientes"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "citas_usuario_id_fkey"
                        columns: ["usuario_id"]
                        referencedRelation: "usuarios"
                        referencedColumns: ["id"]
                    }
                ]
            }
            integraciones: {
                Row: {
                    id: string
                    created_at: string
                    nombre: string
                    tipo: string
                    activo: boolean
                    credenciales: Json
                    configuracion: Json
                }
                Insert: {
                    id?: string
                    created_at?: string
                    nombre: string
                    tipo: string
                    activo?: boolean
                    credenciales?: Json
                    configuracion?: Json
                }
                Update: {
                    id?: string
                    created_at?: string
                    nombre?: string
                    tipo?: string
                    activo?: boolean
                    credenciales?: Json
                    configuracion?: Json
                }
                Relationships: []
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
