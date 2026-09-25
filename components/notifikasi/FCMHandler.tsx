"use client";

import { useEffect, useRef } from "react";
import { requestFCMToken, onForegroundMessage } from "@/lib/firebase";
import toast from "react-hot-toast";
import { X } from "lucide-react";

export default function FCMHandler() {
  const lastSeenBroadcastId = useRef<string | null>(null);

  const displayToast = (
    title: string,
    body: string,
    image?: string | null,
    url?: string | null
  ) => {
    toast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? "animate-enter" : "animate-leave"
          } pointer-events-auto w-full max-w-sm`}
          style={{
            animation: t.visible
              ? "slideInDown 0.35s cubic-bezier(0.16, 1, 0.3, 1)"
              : "fadeOut 0.25s ease-in forwards",
          }}
        >
          {/* Notification Card */}
          <div
            style={{
              background: "rgba(255,255,255,0.97)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              borderRadius: "16px",
              boxShadow:
                "0 4px 6px -1px rgba(0,0,0,0.07), 0 10px 30px -5px rgba(26,159,212,0.15), 0 0 0 1px rgba(26,159,212,0.1)",
              overflow: "hidden",
              cursor: url ? "pointer" : "default",
              position: "relative",
            }}
            onClick={() => {
              if (url) window.location.href = url;
              toast.dismiss(t.id);
            }}
          >
            {/* Top accent bar */}
            <div
              style={{
                height: "3px",
                background: "linear-gradient(90deg, #1A9FD4 0%, #45B5E3 100%)",
              }}
            />

            <div style={{ padding: "14px 16px 14px 16px" }}>
              {/* Header row */}
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "12px",
                }}
              >
                {/* Brand logo square */}
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "10px",
                    background: "linear-gradient(135deg, #1A9FD4 0%, #106B93 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    boxShadow: "0 2px 8px rgba(26,159,212,0.3)",
                  }}
                >
                  <span
                    style={{
                      color: "#fff",
                      fontWeight: 800,
                      fontSize: "13px",
                      letterSpacing: "0.5px",
                      fontFamily: "Poppins, Inter, sans-serif",
                    }}
                  >
                    IR
                  </span>
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "8px",
                      marginBottom: "2px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "10px",
                        fontWeight: 700,
                        color: "#1A9FD4",
                        textTransform: "uppercase",
                        letterSpacing: "0.6px",
                      }}
                    >
                      Irwa Fashion
                    </span>
                    <span
                      style={{
                        fontSize: "10px",
                        color: "#ADB5BD",
                        fontWeight: 400,
                        flexShrink: 0,
                      }}
                    >
                      Baru saja
                    </span>
                  </div>

                  <p
                    style={{
                      fontSize: "13px",
                      fontWeight: 700,
                      color: "#212529",
                      lineHeight: "1.35",
                      margin: 0,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical" as const,
                      overflow: "hidden",
                    }}
                  >
                    {title}
                  </p>

                  {body && (
                    <p
                      style={{
                        fontSize: "12px",
                        color: "#6C757D",
                        lineHeight: "1.5",
                        marginTop: "4px",
                        marginBottom: 0,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical" as const,
                        overflow: "hidden",
                      }}
                    >
                      {body}
                    </p>
                  )}
                </div>

                {/* Dismiss button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toast.dismiss(t.id);
                  }}
                  style={{
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    background: "#F1F3F5",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginTop: "-2px",
                    color: "#ADB5BD",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLButtonElement).style.background = "#DEE2E6")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLButtonElement).style.background = "#F1F3F5")
                  }
                >
                  <X size={13} />
                </button>
              </div>

              {/* Image banner */}
              {image && (
                <div
                  style={{
                    marginTop: "12px",
                    width: "100%",
                    height: "120px",
                    borderRadius: "10px",
                    overflow: "hidden",
                    background: "#F1F3F5",
                  }}
                >
                  <img
                    src={image}
                    alt={title}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                    onError={(e) =>
                      ((e.target as HTMLImageElement).style.display = "none")
                    }
                  />
                </div>
              )}

              {/* CTA Row */}
              {url && (
                <div
                  style={{
                    marginTop: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span
                    style={{
                      fontSize: "11px",
                      color: "#ADB5BD",
                      fontWeight: 400,
                    }}
                  >
                    Ketuk untuk melihat penawaran
                  </span>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#1A9FD4",
                      display: "flex",
                      alignItems: "center",
                      gap: "3px",
                    }}
                  >
                    Lihat →
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      ),
      {
        duration: 9000,
        position: "top-right",
      }
    );
  };

  useEffect(() => {
    // Inject keyframe animations
    const styleId = "irwa-toast-keyframes";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = `
        @keyframes slideInDown {
          from { opacity: 0; transform: translateY(-16px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes fadeOut {
          from { opacity: 1; transform: scale(1); }
          to   { opacity: 0; transform: scale(0.96); }
        }
      `;
      document.head.appendChild(style);
    }

    // 1. Request FCM Token & register to DB
    requestFCMToken();

    // 2. Listen for direct foreground FCM SDK messages
    const unsubscribe = onForegroundMessage((payload) => {
      const title =
        payload?.notification?.title ||
        payload?.data?.title ||
        "Notifikasi Irwa Fashion";
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
          if (
            storedSeenId !== latest.id &&
            lastSeenBroadcastId.current !== latest.id
          ) {
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
