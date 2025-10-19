// components/DbChecker.tsx
"use client";

import { useDbCheck } from "@/hooks/useDbStatus";

export function DbChecker() {
  useDbCheck();
  return null;
}