import type { DrupalUser } from '../types/drupal';

// Constantes de configuración obtenidas desde las variables de entorno del proyecto
const BASE_URL = import.meta.env.PUBLIC_DRUPAL_BASE_URL; // URL base del sitio Drupal
const tokenUrl = import.meta.env.DRUPAL_TOKEN_URL; // Endpoint específico para la generación de tokens

/**
 * Servicio para autenticar un usuario en Drupal mediante el flujo OAuth2 (Password Grant)
 * * @param username - Nombre de usuario ingresado en el formulario
 * @param password - Contraseña ingresada en el formulario
 * @returns Un objeto JSON con el token de acceso si las credenciales son válidas, o null si falla
 */
export async function loginWithDrupal(username: string, password: string) {
  try {
    // Estructuración de parámetros requeridos por el protocolo OAuth2
    const body = new URLSearchParams();
    body.append("grant_type", "password"); // Tipo de concesión por contraseña
    body.append("client_id", import.meta.env.DRUPAL_CLIENT_ID); // ID de cliente registrado en Drupal       
    body.append("client_secret", import.meta.env.DRUPAL_CLIENT_SECRET); // Clave secreta del cliente
    body.append("username", username);
    body.append("password", password);

    // Ejecución de la solicitud HTTP POST hacia el servidor de autenticación
    const res = await fetch(tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });

    // Control de respuesta errónea (Códigos HTTP distintos a la serie 2xx)
    if (!res.ok) {
      return null;
    }

    // Retorno de los datos deserializados (incluye access_token, expires_in, etc.)
    return await res.json(); 
  } catch (err) {
    // Captura y registro de fallos de red o errores inesperados en la consola del servidor
    console.error("Error en el servicio loginWithDrupal:", err);
    return null;
  }
}

/**
 * Servicio para obtener la lista de usuarios registrados desde un endpoint REST de Drupal
 * * @param token - El token de acceso Bearer válido obtenido en la autenticación
 * @returns Un arreglo con objetos de tipo DrupalUser o null en caso de error
 */
export async function getDrupalUsers(token: string): Promise<DrupalUser[] | null> {
  try {
    // Solicitud HTTP GET al recurso protegido de usuarios en Drupal
    const res = await fetch(`${BASE_URL}/rest/usuarios`, {
      headers: {
        // Inyección del token Bearer necesario para superar la seguridad de la API
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    // Si el endpoint responde con un error (ej: token expirado o denegado), cancela la operación
    if (!res.ok) {
      return null;
    }

    // Retorno del resultado casteado bajo la estructura estricta de DrupalUser[]
    return await res.json() as DrupalUser[];
  } catch (err) {
    // Registro preventivo ante caídas del servidor o fallas de red con la API
    console.error("Error al consultar usuarios en Drupal:", err);
    return null;
  }
}
