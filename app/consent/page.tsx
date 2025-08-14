"use client";

import ConsentForm from "@/components/consent-form";
import { useSearchParams } from "next/navigation";

export default function ConsentPage() {
  const params = useSearchParams();
  const paramObj = Object.fromEntries(params.entries());
  return <ConsentForm params={paramObj} />;
}

