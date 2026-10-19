"use client";
import { useEffect } from "react";

export default function OwnerRedirect() {
  useEffect(() => { window.location.replace("/?owner=1"); }, []);
  return (
    <main style={{ minHeight: "100svh", display: "grid", placeItems: "center", background: "#0a1733", color: "#eaf2fb", fontFamily: "system-ui, sans-serif" }}>
      Opening owner console…
    </main>
  );
}
