export const prerender = false;

import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const formData = await request.formData();
    const username = formData.get('username')?.toString().trim() || '';
    const password = formData.get('password')?.toString() || '';

    if (!username || !password) {
      return new Response(JSON.stringify({ error: 'Campos incompletos' }), { status: 400 });
    }

    const body = new URLSearchParams();
    body.append("grant_type", "password");
    body.append("client_id", import.meta.env.DRUPAL_CLIENT_ID);
    body.append("client_secret", import.meta.env.DRUPAL_CLIENT_SECRET);
    body.append("username", username);
    body.append("password", password);

    const baseUrl = import.meta.env.PUBLIC_DRUPAL_BASE_URL;
    
    const tokenRes = await fetch(`${baseUrl}/oauth/token`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json" // Le exigimos explícitamente JSON a Drupal
      },
      body: body.toString(),
    });

    // LEER COMO TEXTO PRIMERO para evitar que se caiga el servidor si no es un JSON válido
    const responseText = await tokenRes.text();

    if (tokenRes.ok) {
      // Si la respuesta es correcta (status 200), procedemos a parsear el token
      const tokenData = JSON.parse(responseText);
      
      cookies.set('auth_token', tokenData.access_token, {
        path: '/',
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: tokenData.expires_in || 3600
      });

      cookies.set('logged_username', username, { path: '/' });

      return new Response(JSON.stringify({ success: true }), { status: 200 });
    } else {
      // Si Drupal mandó el error "Cross-site...", lo atrapamos limpiamente aquí sin romper el flujo
      console.log("RESPUESTA CRUDA DE ERROR EN DRUPAL:", responseText);
      return new Response(JSON.stringify({ error: 'Error de validación u origen en Drupal OAuth' }), { status: 401 });
    }

  } catch (err) {
    console.error("Error crítico en API Auth:", err);
    return new Response(JSON.stringify({ error: 'Error interno de comunicación' }), { status: 500 });
  }
};