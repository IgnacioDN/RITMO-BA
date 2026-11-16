import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

const OTP_TYPES: EmailOtpType[] = ["email", "signup", "recovery"];

/**
 * Destino de los links de los mails (confirmar cuenta, cambiar contraseña).
 * Acepta dos formas:
 *  - `?token_hash=...&type=...`: funciona aunque el mail se abra en otro
 *    navegador o en el celular (es el que usan nuestras plantillas de mail).
 *  - `?code=...`: el flujo PKCE, que solo funciona en el mismo navegador donde
 *    se pidió el mail.
 * Si sale bien, el usuario queda con la sesión iniciada. Si algo falla, lo
 * llevamos al login con un aviso en vez de dejarlo en una pantalla en blanco.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  // A dónde ir después (por ejemplo, la pantalla de contraseña nueva). Solo
  // se aceptan rutas internas: "//otro-sitio.com" sería un redirect abierto.
  const nextParam = searchParams.get("next");
  const next = nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/";

  // Detrás del proxy de Vercel, la dirección pública viene en este header.
  const forwardedHost = request.headers.get("x-forwarded-host");
  const base = forwardedHost ? `https://${forwardedHost}` : origin;

  if (tokenHash && type && OTP_TYPES.includes(type)) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
      if (!error) return NextResponse.redirect(`${base}${type === "recovery" ? "/auth/reset" : next}`);
      console.error("[auth] verifyOtp falló:", error.message);
    } catch (err) {
      console.error("[auth] callback falló:", err);
    }
    return NextResponse.redirect(`${base}/auth?error=${type === "recovery" ? "recuperacion" : "confirmacion"}`);
  }

  if (code) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) return NextResponse.redirect(`${base}${next}`);
      console.error("[auth] exchangeCodeForSession falló:", error.message);
    } catch (err) {
      console.error("[auth] callback falló:", err);
    }
  }

  // Con `code` el mail ya fue verificado por Supabase: lo que falló fue iniciar
  // la sesión (otro navegador). Sin `code`, el link directamente no sirve.
  const reason = next === "/auth/reset" ? "recuperacion" : code ? "confirmacion" : "link";
  return NextResponse.redirect(`${base}/auth?error=${reason}`);
}
