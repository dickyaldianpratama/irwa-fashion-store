"use client";

import { useEffect, useRef } from "react";
import { requestFCMToken, onForegroundMessage } from "@/lib/firebase";
import toast from "react-hot-toast";
import { Bell, ExternalLink } from "lucide-react";

export default function FCMHandler() {
  const lastSeenBroadcastId = useRef<string | null>(null);

  const displayToast = (title: string, body: string, image?: string | null, url?: string | null) => {
    toast.custom(
      (t) => (
        <div
          onClick={() => {
            if (url) {
              window.location.href = url;
            }
            toast.dismiss(t.id);
          }}
          className={`${
            t.visible ? "animate-enter" : "animate-leave"
          } max-w-md w-full bg-white dark:bg-gray-900 shadow-2xl rounded-2xl pointer-events-auto flex flex-col ring-1 ring-black/5 dark:ring-white/10 p-4 border border-primary/30 cursor-pointer hover:border-primary transition-all`}
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5 animate-bounce" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-bold text-gray-900 dark:text-white leading-tight truncate">
                  {title}
                </p>
                <span className="text-[10px] text-primary font-bold flex items-center gap-0.5 shrink-0">
                  Buka <ExternalLink size={10} />
                </span>
              </div>
              {body && (
                <p className="mt-1 text-xs text-gray-600 dark:text-gray-300 line-clamp-2 leading-snug">
                  {body}
                </p>
              )}
            </div>
          </div>

          {image && (
            <div className="mt-2.5 relative w-full h-32 rounded-xl overflow-hidden bg-gray-100">
              <img src={image} alt={title} className="w-full h-full object-cover" />
            </div>
          )}
        </div>
      ),
      { duration: 8000, position: "top-center" }
    );
  };

  useEffect(() => {
    // 1. Request FCM Token & register to DB
    requestFCMToken();

    // 2. Listen for direct foreground FCM SDK messages
    const unsubscribe = onForegroundMessage((payload) => {
      const title = payload?.notification?.title || payload?.data?.title || "Notifikasi Irwa Fashion";
      const body = payload?.notification?.body || payload?.data?.body || "";
      const image = payload?.notification?.image || payload?.data?.image;
      const url = payload?.data?.url || "/promo";

      displayToast(title, body, image, url);
    });

    // 3. Poll for active admin broadcast notifications
    const checkLatestBroadcast = async () => {
      try {
        const res = await fetch("/api/notifikasi/latest-broadcast");
        const json = await res.json();
        const latest = json.data;

        if (latest && latest.id) {
          const storedSeenId = localStorage.getItem("irwa_last_seen_broadcast_id");
          if (storedSeenId !== latest.id && lastSeenBroadcastId.current !== latest.id) {
            lastSeenBroadcastId.current = latest.id;
            localStorage.setItem("irwa_last_seen_broadcast_id", latest.id);
            displayToast(latest.title, latest.body, latest.image, latest.url);
          }
        }
      } catch (err) {
        // Silent error
      }
    };

    checkLatestBroadcast();
    const interval = setInterval(checkLatestBroadcast, 5000);

    return () => {
      clearInterval(interval);
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, []);

  return null;
}
