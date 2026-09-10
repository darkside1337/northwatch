import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Collector Portal — Northwatch",
  description: "Secure access to your Northwatch registry, orders, and express checkout.",
};

export const instant = false;

export default function AccountAreaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen bg-[#FAF9F6] text-[#141413]">{children}</div>;
}


