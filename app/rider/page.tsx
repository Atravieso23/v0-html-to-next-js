"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RiderView } from "@/components/rider/rider-view";
import { LoadingScreen } from "@/components/layout/loading-screen";
import { useAvexStore } from "@/lib/store";

export default function RiderPage() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { initializeMockData, isAuthenticated, currentUser } = useAvexStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    initializeMockData();
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, [initializeMockData, isAuthenticated, router]);

  if (!isAuthenticated || isLoading) {
    return <LoadingScreen />;
  }

  // If logged in as a rider with a linked riderName, skip selection screen
  const preselectedRider =
    currentUser?.role === "rider" && currentUser.riderName
      ? currentUser.riderName
      : undefined;

  const handleLogout = () => {
    useAvexStore.getState().logout();
    router.replace("/login");
  };

  return <RiderView preselectedRider={preselectedRider} onLogout={preselectedRider ? handleLogout : undefined} />;
}
