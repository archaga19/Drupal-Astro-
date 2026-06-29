export const prerender = false;

import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ cookies }) => {
  const token = cookies.get('auth_token')?.value;

  // Si no hay token en las cookies del servidor, rechazamos inmediatamente
  if (!token) {
    return new Response(
      JSON.stringify({ error: 'Acceso no autorizado' }), 
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const baseUrl = import.meta.env.PUBLIC_DRUPAL_BASE_URL;
    
    const res = await fetch(`${baseUrl}/rest/usuarios`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      return new Response(
        JSON.stringify({ error: 'La sesión en Drupal ha expirado o es inválida' }), 
        { status: res.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data = await res.json();
    
    return new Response(
      JSON.stringify(data), 
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error("Error crítico en API Usuarios:", err);
    return new Response(
      JSON.stringify({ error: 'No se pudo conectar con el servicio de base de datos' }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};