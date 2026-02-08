import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Web Push crypto helpers using Web Crypto API
async function generateVapidAuthHeader(
  endpoint: string,
  subject: string,
  publicKey: string,
  privateKey: string
) {
  const urlObj = new URL(endpoint);
  const audience = `${urlObj.protocol}//${urlObj.host}`;

  // JWT header and payload
  const header = { typ: "JWT", alg: "ES256" };
  const payload = {
    aud: audience,
    exp: Math.floor(Date.now() / 1000) + 12 * 60 * 60,
    sub: subject,
  };

  const headerB64 = base64urlEncode(JSON.stringify(header));
  const payloadB64 = base64urlEncode(JSON.stringify(payload));
  const unsignedToken = `${headerB64}.${payloadB64}`;

  // Import private key
  const privateKeyBytes = base64urlDecode(privateKey);
  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    convertRawKeyToPkcs8(privateKeyBytes),
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"]
  );

  // Sign
  const signature = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    cryptoKey,
    new TextEncoder().encode(unsignedToken)
  );

  const signatureB64 = base64urlEncodeBuffer(derToRaw(new Uint8Array(signature)));
  const jwt = `${unsignedToken}.${signatureB64}`;

  return {
    authorization: `vapid t=${jwt}, k=${publicKey}`,
  };
}

function convertRawKeyToPkcs8(rawKey: Uint8Array): ArrayBuffer {
  // PKCS#8 wrapper for EC P-256 private key
  const pkcs8Header = new Uint8Array([
    0x30, 0x81, 0x87, 0x02, 0x01, 0x00, 0x30, 0x13, 0x06, 0x07, 0x2a, 0x86,
    0x48, 0xce, 0x3d, 0x02, 0x01, 0x06, 0x08, 0x2a, 0x86, 0x48, 0xce, 0x3d,
    0x03, 0x01, 0x07, 0x04, 0x6d, 0x30, 0x6b, 0x02, 0x01, 0x01, 0x04, 0x20,
  ]);
  const pkcs8Footer = new Uint8Array([
    0xa1, 0x44, 0x03, 0x42, 0x00,
  ]);

  // We need to compute the public key from the private key
  // For simplicity, we'll use just the private key without the public key in PKCS8
  const result = new Uint8Array(pkcs8Header.length + rawKey.length + pkcs8Footer.length + 65);
  result.set(pkcs8Header);
  result.set(rawKey, pkcs8Header.length);
  // We skip the public key part since we don't need it for signing
  
  // Actually, let's use a simpler PKCS8 format without public key
  const simplePkcs8 = new Uint8Array([
    0x30, 0x41, 0x02, 0x01, 0x00, 0x30, 0x13, 0x06, 0x07, 0x2a, 0x86,
    0x48, 0xce, 0x3d, 0x02, 0x01, 0x06, 0x08, 0x2a, 0x86, 0x48, 0xce, 0x3d,
    0x03, 0x01, 0x07, 0x04, 0x27, 0x30, 0x25, 0x02, 0x01, 0x01, 0x04, 0x20,
  ]);
  
  const finalResult = new Uint8Array(simplePkcs8.length + rawKey.length);
  finalResult.set(simplePkcs8);
  finalResult.set(rawKey, simplePkcs8.length);
  return finalResult.buffer;
}

function derToRaw(der: Uint8Array): Uint8Array {
  // DER signature is SEQUENCE { INTEGER r, INTEGER s }
  // We need raw r || s (each 32 bytes for P-256)
  const raw = new Uint8Array(64);
  
  let offset = 2; // Skip SEQUENCE tag and length
  // Parse r
  const rLen = der[offset + 1];
  offset += 2;
  const rStart = rLen > 32 ? offset + (rLen - 32) : offset;
  const rDest = rLen < 32 ? 32 - rLen : 0;
  raw.set(der.slice(rStart, offset + rLen), rDest);
  offset += rLen;
  
  // Parse s
  const sLen = der[offset + 1];
  offset += 2;
  const sStart = sLen > 32 ? offset + (sLen - 32) : offset;
  const sDest = sLen < 32 ? 64 - sLen : 32;
  raw.set(der.slice(sStart, offset + sLen), sDest);
  
  return raw;
}

function base64urlEncode(str: string): string {
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64urlEncodeBuffer(buf: Uint8Array): string {
  let binary = "";
  for (const byte of buf) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64urlDecode(str: string): Uint8Array {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(base64 + padding);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY")!;
    const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY")!;
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const body = await req.json();
    const { old_count, new_count } = body;

    console.log(`Push notification triggered: ${old_count} -> ${new_count}`);

    if (old_count === new_count || old_count === undefined || new_count === undefined) {
      return new Response(JSON.stringify({ sent: 0, reason: "no change" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get all push subscriptions
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
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.keys_p256dh,
            auth: sub.keys_auth,
          },
        };

        // Encrypt payload and send
        const encrypted = await encryptPayload(
          pushSubscription,
          notificationPayload
        );

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
          console.log(`Push sent to ${sub.endpoint.slice(0, 50)}...`);
        } else if (response.status === 404 || response.status === 410) {
          // Subscription expired
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

    // Clean up expired subscriptions
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

// Web Push payload encryption (RFC 8291)
async function encryptPayload(
  subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
  payload: string
): Promise<Uint8Array> {
  const clientPublicKey = base64urlDecode(subscription.keys.p256dh);
  const clientAuth = base64urlDecode(subscription.keys.auth);

  // Generate local ECDH key pair
  const localKeyPair = await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    true,
    ["deriveBits"]
  );

  // Export local public key
  const localPublicKeyRaw = new Uint8Array(
    await crypto.subtle.exportKey("raw", localKeyPair.publicKey)
  );

  // Import client public key
  const clientKey = await crypto.subtle.importKey(
    "raw",
    clientPublicKey,
    { name: "ECDH", namedCurve: "P-256" },
    false,
    []
  );

  // ECDH shared secret
  const sharedSecret = new Uint8Array(
    await crypto.subtle.deriveBits(
      { name: "ECDH", public: clientKey },
      localKeyPair.privateKey,
      256
    )
  );

  // Generate 16-byte salt
  const salt = crypto.getRandomValues(new Uint8Array(16));

  // HKDF to derive encryption key and nonce
  const encoder = new TextEncoder();

  // PRK = HKDF-Extract(auth_secret, shared_secret)
  const authInfo = encoder.encode("Content-Encoding: auth\0");
  const prk = await hkdfExtract(clientAuth, sharedSecret);

  // IKM for final key derivation
  const ikm = await hkdfExpand(prk, createInfo("WebPush: info\0", clientPublicKey, localPublicKeyRaw), 32);

  // Final PRK
  const finalPrk = await hkdfExtract(salt, ikm);

  // Content encryption key (CEK)
  const cek = await hkdfExpand(finalPrk, createCekInfo(), 16);

  // Nonce
  const nonce = await hkdfExpand(finalPrk, createNonceInfo(), 12);

  // Encrypt with AES-128-GCM
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    cek,
    "AES-GCM",
    false,
    ["encrypt"]
  );

  // Pad payload (RFC 8291 section 4)
  const payloadBytes = encoder.encode(payload);
  const paddedPayload = new Uint8Array(payloadBytes.length + 2);
  paddedPayload.set(payloadBytes);
  paddedPayload[payloadBytes.length] = 2; // Delimiter
  // Rest is already 0 (padding)

  const encrypted = new Uint8Array(
    await crypto.subtle.encrypt(
      { name: "AES-GCM", iv: nonce },
      cryptoKey,
      paddedPayload
    )
  );

  // Build aes128gcm header: salt(16) + rs(4) + idlen(1) + keyid(65) + encrypted
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

async function hkdfExtract(
  salt: Uint8Array,
  ikm: Uint8Array
): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw",
    salt.length > 0 ? salt : new Uint8Array(32),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  return new Uint8Array(await crypto.subtle.sign("HMAC", key, ikm));
}

async function hkdfExpand(
  prk: Uint8Array,
  info: Uint8Array,
  length: number
): Promise<Uint8Array> {
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
  const result = new Uint8Array(
    await crypto.subtle.sign("HMAC", key, infoWithCounter)
  );
  return result.slice(0, length);
}

function createInfo(
  type: string,
  clientPublicKey: Uint8Array,
  serverPublicKey: Uint8Array
): Uint8Array {
  const encoder = new TextEncoder();
  const typeBytes = encoder.encode(type);
  const result = new Uint8Array(
    typeBytes.length + clientPublicKey.length + serverPublicKey.length
  );
  result.set(typeBytes);
  result.set(clientPublicKey, typeBytes.length);
  result.set(serverPublicKey, typeBytes.length + clientPublicKey.length);
  return result;
}

function createCekInfo(): Uint8Array {
  return new TextEncoder().encode("Content-Encoding: aes128gcm\0");
}

function createNonceInfo(): Uint8Array {
  return new TextEncoder().encode("Content-Encoding: nonce\0");
}
