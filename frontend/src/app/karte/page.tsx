"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function KarteRootPage() {
  const router = useRouter();

  useEffect(() => {
    try {
      const raw = localStorage.getItem("userId");
      if (raw) {
        router.replace(`/karte/${raw}`);
        return;
      }
    } catch {
      // ignore
    }
    router.replace("/login");
  }, [router]);

  return (
    <div className="container mx-auto p-6 text-gray-700">
      トレーニングカルテに移動しています…
    </div>
  );
}


