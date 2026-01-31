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
            usuarios: {
                Row: {
                    id: string
                    email: string
                    nombre_completo: string
                    avatar_url: string | null
                    rol_id: string | null
                    activo: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    email: string
                    nombre_completo: string
                    avatar_url?: string | null
                    rol_id?: string | null
                    activo?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    email?: string
                    nombre_completo?: string
                    avatar_url?: string | null
                    rol_id?: string | null
                    activo?: boolean
                    created_at?: string
                    updated_at?: string
                }
            }
            leads: {
                Row: {
                    id: string
                    nombre: string
                    email: string | null
                    telefono: string | null
                    empresa: string | null
                    cargo: string | null
                    fuente: string | null
                    estado: string
                    calificacion: string | null
                    asignado_a: string | null
                    notas: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    nombre: string
                    email?: string | null
                    telefono?: string | null
                    empresa?: string | null
                    cargo?: string | null
                    fuente?: string | null
                    estado?: string
                    calificacion?: string | null
                    asignado_a?: string | null
                    notas?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    nombre?: string
                    email?: string | null
                    telefono?: string | null
                    empresa?: string | null
                    cargo?: string | null
                    fuente?: string | null
                    estado?: string
                    calificacion?: string | null
                    asignado_a?: string | null
                    notas?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            clientes: {
                Row: {
                    id: string
                    nombre: string
                    email: string | null
                    telefono: string | null
                    empresa: string | null
                    direccion: string | null
                    ciudad: string | null
                    pais: string
                    tipo_cliente: string
                    estado: string
                    asignado_a: string | null
                    valor_total: number
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    nombre: string
                    email?: string | null
                    telefono?: string | null
                    empresa?: string | null
                    direccion?: string | null
                    ciudad?: string | null
                    pais?: string
                    tipo_cliente?: string
                    estado?: string
                    asignado_a?: string | null
                    valor_total?: number
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    nombre?: string
                    email?: string | null
                    telefono?: string | null
                    empresa?: string | null
                    direccion?: string | null
                    ciudad?: string | null
                    pais?: string
                    tipo_cliente?: string
                    estado?: string
                    asignado_a?: string | null
                    valor_total?: number
                    created_at?: string
                    updated_at?: string
                }
            }
            citas: {
                Row: {
                    id: string
                    titulo: string
                    descripcion: string | null
                    fecha_inicio: string
                    fecha_fin: string
                    ubicacion: string | null
                    tipo: string
                    estado: string
                    cliente_id: string | null
                    lead_id: string | null
                    asignado_a: string | null
                    recordatorio_enviado: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    titulo: string
                    descripcion?: string | null
                    fecha_inicio: string
                    fecha_fin: string
                    ubicacion?: string | null
                    tipo?: string
                    estado?: string
                    cliente_id?: string | null
                    lead_id?: string | null
                    asignado_a?: string | null
                    recordatorio_enviado?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    titulo?: string
                    descripcion?: string | null
                    fecha_inicio?: string
                    fecha_fin?: string
                    ubicacion?: string | null
                    tipo?: string
                    estado?: string
                    cliente_id?: string | null
                    lead_id?: string | null
                    asignado_a?: string | null
                    recordatorio_enviado?: boolean
                    created_at?: string
                    updated_at?: string
                }
            }
            conversaciones: {
                Row: {
                    id: string
                    cliente_id: string | null
                    lead_id: string | null
                    canal: string
                    estado: string
                    asignado_a: string | null
                    ultimo_mensaje_at: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    cliente_id?: string | null
                    lead_id?: string | null
                    canal: string
                    estado?: string
                    asignado_a?: string | null
                    ultimo_mensaje_at?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    cliente_id?: string | null
                    lead_id?: string | null
                    canal?: string
                    estado?: string
                    asignado_a?: string | null
                    ultimo_mensaje_at?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            mensajes: {
                Row: {
                    id: string
                    conversacion_id: string
                    contenido: string
                    tipo: string
                    direccion: string
                    enviado_por: string | null
                    leido: boolean
                    metadata: Json | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    conversacion_id: string
                    contenido: string
                    tipo?: string
                    direccion: string
                    enviado_por?: string | null
                    leido?: boolean
                    metadata?: Json | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    conversacion_id?: string
                    contenido?: string
                    tipo?: string
                    direccion?: string
                    enviado_por?: string | null
                    leido?: boolean
                    metadata?: Json | null
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
            [_ in never]: never
        }
    }
}
