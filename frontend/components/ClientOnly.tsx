"use client";
import React, { useEffect, useState } from "react";

export const ClientOnly = ({ children }: { children: React.ReactNode }) => {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setHasMounted(true);
    });

    return () => {
      cancelAnimationFrame(frame);
    };
  }, []);

  if (!hasMounted) {
    return null;
  }

  return <>{children}</>;
};

ClientOnly.displayName = "ClientOnly";
