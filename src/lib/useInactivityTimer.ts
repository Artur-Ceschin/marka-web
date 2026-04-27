"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth.store";
import { getCurrentSession } from "@/lib/auth";

const INACTIVITY_MS = 15 * 60 * 1000; // 15 minutes
const WARNING_MS = 14 * 60 * 1000;    //  1 minute before logout

const ACTIVITY_EVENTS = [
  "mousemove",
  "mousedown",
  "keydown",
  "scroll",
  "touchstart",
  "click",
] as const;

export function useInactivityTimer() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();

  const logoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningToastRef = useRef<string | number | null>(null);

  const clearTimers = useCallback(() => {
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (warningToastRef.current !== null) {
      toast.dismiss(warningToastRef.current);
      warningToastRef.current = null;
    }
  }, []);

  const resetTimers = useCallback(() => {
    clearTimers();

    // Proactively refresh the token on activity so it stays warm.
    getCurrentSession().catch(() => null);

    warningTimerRef.current = setTimeout(() => {
      warningToastRef.current = toast.warning(
        "You'll be signed out in 1 minute due to inactivity.",
        { duration: 60_000 },
      );
    }, WARNING_MS);

    logoutTimerRef.current = setTimeout(() => {
      logout();
      toast.error("Signed out due to inactivity.");
      router.replace("/signin");
    }, INACTIVITY_MS);
  }, [clearTimers, logout, router]);

  useEffect(() => {
    if (!isAuthenticated) {
      clearTimers();
      return;
    }

    resetTimers();

    ACTIVITY_EVENTS.forEach((ev) =>
      window.addEventListener(ev, resetTimers, { passive: true }),
    );

    return () => {
      clearTimers();
      ACTIVITY_EVENTS.forEach((ev) =>
        window.removeEventListener(ev, resetTimers),
      );
    };
  }, [isAuthenticated, resetTimers, clearTimers]);
}
