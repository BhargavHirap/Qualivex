import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Qualivex — Turn conversations into customers",
  description: "An AI-powered lead qualification and appointment workflow for ambitious businesses."
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}