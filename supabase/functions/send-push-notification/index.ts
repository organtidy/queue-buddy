import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// --- VAPID Auth ---

async function generateVapidAuthHeader(
  endpoint: string,
  subject: string,
  publicKey: string,
  privateKey: string
) {
  const urlObj = new URL(endpoint);
  const audience = `${urlObj.protocol}//${urlObj.host}`;

  const header = { typ: "JWT", alg: "ES256" };
  const payload = {
    aud: audience,
    exp: Math.floor(Date.now() / 1000) + 12 * 60 * 60,
    sub: subject,
  };

  const headerB64 = b64url(JSON.stringify(header));
  const payloadB64 = b64url(JSON.stringify(payload));
  const unsignedToken = `${headerB64}.${payloadB64}`;

  // Import private key via JWK (avoids PKCS8 encoding issues)
  const pubKeyBytes = b64urlDecode(publicKey);
  const x = b64urlBuf(pubKeyBytes.slice(1, 33));
  const y = b64urlBuf(pubKeyBytes.slice(33, 65));
  const d = privateKey; // already base64url

  const cryptoKey = await crypto.subtle.importKey(
    "jwk",
    { kty: "EC", crv: "P-256", x, y, d },
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    cryptoKey,
    new TextEncoder().encode(unsignedToken)
  );

  const sigBytes = new Uint8Array(signature);
  // Web Crypto ECDSA returns IEEE P1363 (raw r||s) format, not DER
  const rawSig = sigBytes.length === 64 ? sigBytes : derToRaw(sigBytes);
  const signatureB64 = b64urlBuf(rawSig);
  const jwt = `${unsignedToken}.${signatureB64}`;

  return { authorization: `vapid t=${jwt}, k=${publicKey}` };
}

function derToRaw(der: Uint8Array): Uint8Array {
  const raw = new Uint8Array(64);
  let offset = 2;
  const rLen = der[offset + 1];
  offset += 2;
  const rStart = rLen > 32 ? offset + (rLen - 32) : offset;
  const rDest = rLen < 32 ? 32 - rLen : 0;
  raw.set(der.slice(rStart, offset + rLen), rDest);
  offset += rLen;
  const sLen = der[offset + 1];
  offset += 2;
  const sStart = sLen > 32 ? offset + (sLen - 32) : offset;
  const sDest = sLen < 32 ? 64 - sLen : 32;
  raw.set(der.slice(sStart, offset + sLen), sDest);
  return raw;
}

// --- Base64url helpers ---

function b64url(str: string): string {
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlBuf(buf: Uint8Array): string {
  let b = "";
  for (const byte of buf) b += String.fromCharCode(byte);
  return btoa(b).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlDecode(str: string): Uint8Array {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(base64 + padding);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

// --- Web Push Encryption (RFC 8291) ---

async function encryptPayload(
  subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
  payload: string
): Promise<Uint8Array> {
  const clientPublicKey = b64urlDecode(subscription.keys.p256dh);
  const clientAuth = b64urlDecode(subscription.keys.auth);

  const localKeyPair = await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    true,
    ["deriveBits"]
  );

  const localPublicKeyRaw = new Uint8Array(
    await crypto.subtle.exportKey("raw", localKeyPair.publicKey)
  );

  const clientKey = await crypto.subtle.importKey(
    "raw",
    clientPublicKey,
    { name: "ECDH", namedCurve: "P-256" },
    false,
    []
  );

  const sharedSecret = new Uint8Array(
    await crypto.subtle.deriveBits(
      { name: "ECDH", public: clientKey },
      localKeyPair.privateKey,
      256
    )
  );

  const salt = crypto.getRandomValues(new Uint8Array(16));

  const prk = await hkdfExtract(clientAuth, sharedSecret);
  const ikm = await hkdfExpand(
    prk,
    createInfo("WebPush: info\0", clientPublicKey, localPublicKeyRaw),
    32
  );
  const finalPrk = await hkdfExtract(salt, ikm);
  const cek = await hkdfExpand(finalPrk, createCekInfo(), 16);
  const nonce = await hkdfExpand(finalPrk, createNonceInfo(), 12);

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    cek,
    "AES-GCM",
    false,
    ["encrypt"]
  );

  const encoder = new TextEncoder();
  const payloadBytes = encoder.encode(payload);
  const paddedPayload = new Uint8Array(payloadBytes.length + 2);
  paddedPayload.set(payloadBytes);
  paddedPayload[payloadBytes.length] = 2;

  const encrypted = new Uint8Array(
    await crypto.subtle.encrypt(
      { name: "AES-GCM", iv: nonce },
      cryptoKey,
      paddedPayload
    )
  );

  const rs = 4096;
  const header = new Uint8Array(16 + 4 + 1 + localPublicKeyRaw.length);
  header.set(salt, 0);
  new DataView(header.buffer).setUint32(16, rs, false);
  header[20] = localPublicKeyRaw.length;
  header.set(localPublicKeyRaw, 21);

  const result = new Uint8Array(header.length + encrypted.length);
  result.set(header);
  result.set(encrypted, header.length);
  return result;
}

async function hkdfExtract(salt: Uint8Array, ikm: Uint8Array): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw",
    salt.length > 0 ? salt : new Uint8Array(32),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  return new Uint8Array(await crypto.subtle.sign("HMAC", key, ikm));
}

async function hkdfExpand(prk: Uint8Array, info: Uint8Array, length: number): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw",
    prk,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const infoWithCounter = new Uint8Array(info.length + 1);
  infoWithCounter.set(info);
  infoWithCounter[info.length] = 1;
  const result = new Uint8Array(await crypto.subtle.sign("HMAC", key, infoWithCounter));
  return result.slice(0, length);
}

function createInfo(type: string, clientPub: Uint8Array, serverPub: Uint8Array): Uint8Array {
  const t = new TextEncoder().encode(type);
  const r = new Uint8Array(t.length + clientPub.length + serverPub.length);
  r.set(t);
  r.set(clientPub, t.length);
  r.set(serverPub, t.length + clientPub.length);
  return r;
}

function createCekInfo(): Uint8Array {
  return new TextEncoder().encode("Content-Encoding: aes128gcm\0");
}

function createNonceInfo(): Uint8Array {
  return new TextEncoder().encode("Content-Encoding: nonce\0");
}

// --- Main Handler ---

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY")!;
    const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY")!;
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const { old_count, new_count } = await req.json();
    console.log(`Push notification triggered: ${old_count} -> ${new_count}`);

    if (old_count === new_count || old_count === undefined || new_count === undefined) {
      return new Response(JSON.stringify({ sent: 0, reason: "no change" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: subscriptions, error: fetchError } = await supabase
      .from("push_subscriptions")
      .select("*");

    if (fetchError) {
      console.error("Error fetching subscriptions:", fetchError);
      throw fetchError;
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log("No push subscriptions found");
      return new Response(JSON.stringify({ sent: 0, reason: "no subscribers" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Sending to ${subscriptions.length} subscribers`);

    const isIncrease = new_count > old_count;
    const notificationPayload = JSON.stringify({
      title: "Filômetro Ásperus",
      body: isIncrease
        ? `Nova pessoa na fila! Agora são ${new_count} na fila.`
        : `Alguém saiu da fila. Agora são ${new_count} na fila.`,
      icon: "/pwa-192x192.png",
      badge: "/pwa-192x192.png",
      tag: "queue-update",
      data: { count: new_count, url: "/" },
    });

    let sent = 0;
    let failed = 0;
    const expiredEndpoints: string[] = [];

    for (const sub of subscriptions) {
      try {
        const pushSub = {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.keys_p256dh, auth: sub.keys_auth },
        };

        const encrypted = await encryptPayload(pushSub, notificationPayload);

        const vapidHeaders = await generateVapidAuthHeader(
          sub.endpoint,
          "mailto:organtidy@gmail.com",
          VAPID_PUBLIC_KEY,
          VAPID_PRIVATE_KEY
        );

        const response = await fetch(sub.endpoint, {
          method: "POST",
          headers: {
            ...vapidHeaders,
            "Content-Encoding": "aes128gcm",
            "Content-Type": "application/octet-stream",
            TTL: "86400",
            Urgency: "high",
          },
          body: encrypted,
        });

        if (response.status === 201 || response.status === 200) {
          sent++;
          console.log(`Push sent successfully to ${sub.endpoint.slice(0, 50)}...`);
        } else if (response.status === 404 || response.status === 410) {
          expiredEndpoints.push(sub.endpoint);
          failed++;
          console.log(`Subscription expired: ${sub.endpoint.slice(0, 50)}...`);
        } else {
          failed++;
          const text = await response.text();
          console.error(`Push failed (${response.status}): ${text}`);
        }
      } catch (err) {
        failed++;
        console.error(`Error sending push to ${sub.endpoint.slice(0, 50)}:`, err);
      }
    }

    if (expiredEndpoints.length > 0) {
      const { error: deleteError } = await supabase
        .from("push_subscriptions")
        .delete()
        .in("endpoint", expiredEndpoints);
      if (deleteError) console.error("Error cleaning expired subs:", deleteError);
      else console.log(`Cleaned ${expiredEndpoints.length} expired subscriptions`);
    }

    return new Response(JSON.stringify({ sent, failed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Push notification error:", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
