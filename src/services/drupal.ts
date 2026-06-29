import type { DrupalUser } from '../types/drupal';

const BASE_URL = import.meta.env.PUBLIC_DRUPAL_BASE_URL;

/**
 * Solicita el token de acceso a Drupal utilizando credenciales de usuario (OAuth2)
 */
export async function loginWithDrupal(username: string, password: string) {
  try {
    const body = new URLSearchParams();
    body.append("grant_type", "password");
    body.append("client_id", import.meta.env.DRUPAL_CLIENT_ID);       
    body.append("client_secret", import.meta.env.DRUPAL_CLIENT_SECRET); 
    body.append("username", username);
    body.append("password", password);

    const res = await fetch(`${BASE_URL}/oauth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });

    if (!res.ok) {
      return null;
    }

    return await res.json(); // Retorna el objeto con access_token y expires_in
  } catch (err) {
    console.error("Error en el servicio loginWithDrupal:", err);
    return null;
  }
}

/**
 * Obtiene el listado completo de usuarios desde la vista REST de Drupal
 */
export async function getDrupalUsers(token: string): Promise<DrupalUser[] | null> {
  try {
    const res = await fetch(`${BASE_URL}/rest/usuarios`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      return null;
    }

    return await res.json() as DrupalUser[];
  } catch (err) {
    console.error("Error al consultar usuarios en Drupal:", err);
    return null;
  }
}