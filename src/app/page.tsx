"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const onboarded = localStorage.getItem("sb-onboarded");
    router.replace(onboarded === "true" ? "/dashboard" : "/onboarding");
  }, [router]);

  return null;
}
