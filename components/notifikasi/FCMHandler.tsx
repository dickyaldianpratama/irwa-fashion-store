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
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

    toast.custom(
      (t) => (
        <div
          style={{
            width: isMobile ? "calc(100vw - 24px)" : "360px",
            animation: t.visible
              ? "irwaSlideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)"
              : "irwaFadeOut 0.2s ease-in forwards",
          }}
        >
          {/* Card */}
          <div
            style={{
              background: "rgba(255,255,255,0.98)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              borderRadius: isMobile ? "14px" : "16px",
              overflow: "hidden",
              boxShadow:
                "0 4px 6px -1px rgba(0,0,0,0.06), 0 12px 32px -4px rgba(26,159,212,0.18), 0 0 0 1px rgba(26,159,212,0.12)",
              cursor: url ? "pointer" : "default",
            }}
            onClick={() => {
              if (url) window.location.href = url;
              toast.dismiss(t.id);
            }}
          >
            {/* Brand accent bar */}
            <div
              style={{
                height: "3px",
                background: "linear-gradient(90deg, #1A9FD4 0%, #45B5E3 60%, #6DC5E9 100%)",
              }}
            />

            <div
              style={{
                padding: isMobile ? "12px 14px" : "14px 16px",
              }}
            >
              {/* Header row */}
              <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                {/* Brand icon */}
                <div
                  style={{
                    width: isMobile ? "36px" : "40px",
                    height: isMobile ? "36px" : "40px",
                    borderRadius: "10px",
                    background: "linear-gradient(135deg, #1A9FD4 0%, #106B93 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    boxShadow: "0 2px 8px rgba(26,159,212,0.35)",
                  }}
                >
                  <span
                    style={{
                      color: "#fff",
                      fontWeight: 800,
                      fontSize: isMobile ? "11px" : "13px",
                      letterSpacing: "0.5px",
                      fontFamily: "Poppins, Inter, sans-serif",
                    }}
                  >
                    IR
                  </span>
                </div>

                {/* Text content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "6px",
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
                        fontFamily: "Inter, sans-serif",
                      }}
                    >
                      Irwa Fashion
                    </span>
                    <span
                      style={{
                        fontSize: "10px",
                        color: "#ADB5BD",
                        flexShrink: 0,
                        fontFamily: "Inter, sans-serif",
                      }}
                    >
                      Baru saja
                    </span>
                  </div>

                  <p
                    style={{
                      fontSize: isMobile ? "12px" : "13px",
                      fontWeight: 700,
                      color: "#212529",
                      lineHeight: "1.35",
                      margin: 0,
                      fontFamily: "Inter, sans-serif",
                      overflow: "hidden",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical" as const,
                    }}
                  >
                    {title}
                  </p>

                  {body && (
                    <p
                      style={{
                        fontSize: isMobile ? "11px" : "12px",
                        color: "#6C757D",
                        lineHeight: "1.5",
                        marginTop: "3px",
                        marginBottom: 0,
                        fontFamily: "Inter, sans-serif",
                        overflow: "hidden",
                        display: "-webkit-box",
                        WebkitLineClamp: isMobile ? 1 : 2,
                        WebkitBoxOrient: "vertical" as const,
                      }}
                    >
                      {body}
                    </p>
                  )}
                </div>

                {/* Close button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toast.dismiss(t.id);
                  }}
                  style={{
                    width: "22px",
                    height: "22px",
                    borderRadius: "50%",
                    background: "#F1F3F5",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginTop: "-1px",
                    color: "#868E96",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLButtonElement).style.background = "#DEE2E6")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLButtonElement).style.background = "#F1F3F5")
                  }
                >
                  <X size={12} />
                </button>
              </div>

              {/* Image */}
              {image && (
                <div
                  style={{
                    marginTop: "10px",
                    width: "100%",
                    height: isMobile ? "100px" : "116px",
                    borderRadius: "10px",
                    overflow: "hidden",
                    background: "#F1F3F5",
                  }}
                >
                  <img
                    src={image}
                    alt={title}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    onError={(e) =>
                      ((e.target as HTMLImageElement).style.display = "none")
                    }
                  />
                </div>
              )}

              {/* CTA footer */}
              {url && (
                <div
                  style={{
                    marginTop: "10px",
                    paddingTop: "8px",
                    borderTop: "1px solid #F1F3F5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span
                    style={{
                      fontSize: "11px",
                      color: "#ADB5BD",
                      fontFamily: "Inter, sans-serif",
                    }}
                  >
                    Ketuk untuk lihat penawaran
                  </span>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#1A9FD4",
                      fontFamily: "Inter, sans-serif",
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
        // Mobile: top-center agar muncul di tengah atas seperti notifikasi HP
        // Desktop: top-right pojok kanan atas
        position: isMobile ? "top-center" : "top-right",
      }
    );
  };

  useEffect(() => {
    // Inject keyframes once
    const styleId = "irwa-notif-keyframes";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = `
        @keyframes irwaSlideIn {
          from { opacity: 0; transform: translateY(-20px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes irwaFadeOut {
          from { opacity: 1; transform: scale(1); }
          to   { opacity: 0; transform: scale(0.95); }
        }
      `;
      document.head.appendChild(style);
    }

    requestFCMToken();

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
      } catch {
        // silent
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
