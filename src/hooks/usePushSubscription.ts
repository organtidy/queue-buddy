import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

const VAPID_PUBLIC_KEY = "BCNtQp4zqfJPRAYqZn3TDrs-Sj2cfZmNbJUS0h904rlVBYfY1DsavMQGJDtehVCv3hgi9x89qHpQoixTpige1_s";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function usePushSubscription() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const supported = "serviceWorker" in navigator && "PushManager" in window;
    setIsSupported(supported);

    if (supported) {
      checkExistingSubscription();
    }
  }, []);

  const checkExistingSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (err) {
      console.log("Error checking push subscription:", err);
    }
  };

  const subscribe = useCallback(async () => {
    if (!isSupported || isLoading) return;
    setIsLoading(true);

    try {
      // First request notification permission
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        console.log("Notification permission denied");
        setIsLoading(false);
        return;
      }

      // Register the custom service worker for push
      const registration = await navigator.serviceWorker.register("/custom-sw.js", {
        scope: "/",
      });
      await navigator.serviceWorker.ready;

      // Subscribe to push
      const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey.buffer as ArrayBuffer,
      });

      const subJson = subscription.toJSON();
      
      // Save to Supabase
      const { error } = await supabase.from("push_subscriptions").upsert(
        {
          endpoint: subJson.endpoint!,
          keys_p256dh: subJson.keys!.p256dh!,
          keys_auth: subJson.keys!.auth!,
        },
        { onConflict: "endpoint" }
      );

      if (error) {
        console.error("Error saving push subscription:", error);
      } else {
        setIsSubscribed(true);
        console.log("Push subscription saved successfully");
      }
    } catch (err) {
      console.error("Error subscribing to push:", err);
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, isLoading]);

  const unsubscribe = useCallback(async () => {
    if (!isSupported || isLoading) return;
    setIsLoading(true);

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        const endpoint = subscription.endpoint;
        await subscription.unsubscribe();

        // Remove from Supabase
        await supabase.from("push_subscriptions").delete().eq("endpoint", endpoint);
      }

      setIsSubscribed(false);
    } catch (err) {
      console.error("Error unsubscribing from push:", err);
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, isLoading]);

  return {
    isSubscribed,
    isSupported,
    isLoading,
    subscribe,
    unsubscribe,
  };
}
