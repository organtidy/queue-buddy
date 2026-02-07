import { useEffect } from "react";

/**
 * Hook that automatically detects and applies Service Worker updates.
 * - On new SW detected: activates immediately (skipWaiting + reload)
 * - Polls every 60s for updates so users never stay on stale versions
 */
export function useServiceWorkerUpdate() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const handleNewSW = (registration: ServiceWorkerRegistration) => {
      const newWorker = registration.waiting || registration.installing;
      if (!newWorker) return;

      const onStateChange = () => {
        if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
          // New version ready — force activate
          newWorker.postMessage({ type: "SKIP_WAITING" });
        }
      };

      newWorker.addEventListener("statechange", onStateChange);
    };

    // When the new SW takes over, reload the page automatically
    let refreshing = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });

    // Check existing registration
    navigator.serviceWorker.getRegistration().then((registration) => {
      if (!registration) return;

      // If there's already a waiting SW, activate it now
      if (registration.waiting) {
        registration.waiting.postMessage({ type: "SKIP_WAITING" });
        return;
      }

      registration.addEventListener("updatefound", () => {
        handleNewSW(registration);
      });

      // Poll for updates every 30 days
      const interval = setInterval(() => {
        registration.update().catch(() => {});
      }, 30 * 24 * 60 * 60 * 1000);

      return () => clearInterval(interval);
    });
  }, []);
}
