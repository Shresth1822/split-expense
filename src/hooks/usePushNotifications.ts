import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

// Helper to convert VAPID key
function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function usePushNotifications() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [permission, setPermission] =
    useState<NotificationPermission>("default");

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

    setPermission(Notification.permission);

    navigator.serviceWorker.ready.then(async (registration) => {
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    });
  }, []);

  const subscribe = async () => {
    // VAPID Key check
    const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;
    if (!VAPID_PUBLIC_KEY) {
      toast.error("VAPID Public Key not configured!");
      console.error("Missing VITE_VAPID_PUBLIC_KEY in .env");
      return;
    }

    setLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;

      // Request Permission
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== "granted") {
        throw new Error("Notification permission denied");
      }

      // Subscribe
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      // Save to Supabase
      const { error } = await supabase.from("push_subscriptions").upsert(
        {
          user_id: (await supabase.auth.getUser()).data.user?.id,
          endpoint: subscription.endpoint,
          keys: subscription.toJSON().keys,
          user_agent: navigator.userAgent,
        },
        { onConflict: "user_id, endpoint" },
      );

      if (error) throw error;

      setIsSubscribed(true);
      toast.success("Notifications enabled!");
    } catch (error: any) {
      console.error("Failed to subscribe:", error);
      toast.error("Failed to enable notifications: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const unsubscribe = async () => {
    setLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();

        // Remove from Supabase
        await supabase
          .from("push_subscriptions")
          .delete()
          .match({ endpoint: subscription.endpoint });

        setIsSubscribed(false);
        toast.success("Notifications disabled.");
      }
    } catch (error: any) {
      console.error("Failed to unsubscribe:", error);
    } finally {
      setLoading(false);
    }
  };

  return { isSubscribed, subscribe, unsubscribe, loading, permission };
}
