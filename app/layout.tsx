import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Qualivex — The revenue workflow for modern teams",
  description: "Qualivex helps teams capture, qualify and convert business enquiries with a secure sales workspace."
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}