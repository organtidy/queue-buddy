import { useEffect } from "react";

/**
 * Hook that automatically detects and applies Service Worker updates.
 * - On new SW detected: activates immediately (skipWaiting + reload)
 * - Polls every 60s for updates so users never stay on stale versions
 */
export function useServiceWorkerUpdate() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    let hadController = Boolean(navigator.serviceWorker.controller);
    let refreshing = false;

    // When a NEW SW takes over an existing controller, reload the page
    const onControllerChange = () => {
      if (!hadController) {
        hadController = true;
        return;
      }
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    };

    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);

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

    let checkInterval: NodeJS.Timeout | null = null;

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

      // Poll for updates every 15 minutes
      checkInterval = setInterval(() => {
        registration.update().catch(() => {});
      }, 15 * 60 * 1000);

      // Check on tab visibility change (e.g. user resumes app)
      const onVisibilityChange = () => {
        if (document.visibilityState === "visible") {
          registration.update().catch(() => {});
        }
      };
      document.addEventListener("visibilitychange", onVisibilityChange);
    });

    return () => {
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
      if (checkInterval) clearInterval(checkInterval);
    };
  }, []);
}
