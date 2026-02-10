/**
 * Utilidades para manejo de fechas en zona horaria de Colombia (America/Bogota, GMT-5)
 */

/**
 * Obtiene la fecha y hora actual en zona horaria de Colombia
 * @returns Date object con la hora de Colombia
 */
export function getNowColombia(): Date {
    return new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Bogota' }));
}

/**
 * Convierte una fecha UTC a zona horaria de Colombia
 * @param date - Fecha en UTC
 * @returns Date object en zona horaria de Colombia
 */
export function toColombiaTime(date: Date | string): Date {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Date(d.toLocaleString('en-US', { timeZone: 'America/Bogota' }));
}

/**
 * Obtiene el inicio del día actual en Colombia (00:00:00)
 * @returns Date object con el inicio del día en Colombia
 */
export function getStartOfDayColombia(): Date {
    const now = getNowColombia();
    now.setHours(0, 0, 0, 0);
    return now;
}

/**
 * Obtiene el fin del día actual en Colombia (23:59:59)
 * @returns Date object con el fin del día en Colombia
 */
export function getEndOfDayColombia(): Date {
    const now = getNowColombia();
    now.setHours(23, 59, 59, 999);
    return now;
}

/**
 * Convierte una fecha de Colombia a ISO string para guardar en BD
 * @param date - Fecha en zona horaria de Colombia
 * @returns ISO string en UTC para la base de datos
 */
export function toUTCString(date: Date): string {
    return date.toISOString();
}

/**
 * Obtiene la fecha y hora actual en formato ISO para guardar en BD
 * Usa la hora de Colombia pero la convierte a UTC
 * @returns ISO string en UTC
 */
export function getNowUTC(): string {
    return new Date().toISOString();
}

/**
 * Formatea una fecha para mostrar en la UI con zona horaria de Colombia
 * @param date - Fecha a formatear
 * @param format - Formato deseado ('short' | 'long' | 'time' | 'datetime' | 'short-datetime')
 * @returns String formateado
 */
export function formatColombiaDate(
    date: Date | string,
    format: 'short' | 'long' | 'time' | 'datetime' | 'short-datetime' = 'short'
): string {
    const d = typeof date === 'string' ? new Date(date) : date;

    const options: Intl.DateTimeFormatOptions = {
        timeZone: 'America/Bogota',
        ...(format === 'short' && {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }),
        ...(format === 'long' && {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }),
        ...(format === 'time' && {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        }),
        ...(format === 'datetime' && {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        }),
        ...(format === 'short-datetime' && {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        })
    };

    return d.toLocaleString('es-CO', options);
}
