"use client";

import { useEffect } from "react";
import { requestFCMToken, onForegroundMessage } from "@/lib/firebase";
import toast from "react-hot-toast";
import { Bell } from "lucide-react";

export default function FCMHandler() {
  useEffect(() => {
    // Request permission & get token on client mount
    requestFCMToken();

    // Listen for foreground notification messages
    const unsubscribe = onForegroundMessage((payload) => {
      const title = payload?.notification?.title || payload?.data?.title || "Notifikasi Irwa Fashion";
      const body = payload?.notification?.body || payload?.data?.body || "";

      // Display attractive custom toast pop-up at top center
      toast.custom(
        (t) => (
          <div
            className={`${
              t.visible ? "animate-enter" : "animate-leave"
            } max-w-md w-full bg-white dark:bg-gray-900 shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-black/5 dark:ring-white/10 p-4 border border-primary/20`}
          >
            <div className="flex-1 w-0 flex items-center">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Bell className="w-5 h-5" />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-xs font-bold text-gray-900 dark:text-white leading-tight">
                  {title}
                </p>
                {body && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-snug">
                    {body}
                  </p>
                )}
              </div>
            </div>
            <div className="flex border-l border-gray-100 dark:border-gray-800 ml-3 pl-3">
              <button
                onClick={() => toast.dismiss(t.id)}
                className="w-full text-xs font-semibold text-primary hover:text-primary-dark transition-colors focus:outline-none"
              >
                Tutup
              </button>
            </div>
          </div>
        ),
        { duration: 5000, position: "top-center" }
      );
    });

    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, []);

  return null;
}
