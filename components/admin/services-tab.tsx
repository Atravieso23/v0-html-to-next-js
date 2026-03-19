"use client";

import { ServiceForm } from "@/components/services/service-form";
import { ServiceLists } from "@/components/services/service-lists";

export function ServicesTab() {
  return (
    <div>
      <ServiceForm />
      <ServiceLists />
    </div>
  );
}
