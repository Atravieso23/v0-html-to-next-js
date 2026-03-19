"use client";

import { useEffect, useState } from "react";
import { RiderView } from "@/components/rider/rider-view";
import { LoadingScreen } from "@/components/layout/loading-screen";
import { useAvexStore } from "@/lib/store";

export default function RiderPage() {
  const [isLoading, setIsLoading] = useState(true);
  const { initializeMockData } = useAvexStore();

  useEffect(() => {
    initializeMockData();
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, [initializeMockData]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return <RiderView />;
}
