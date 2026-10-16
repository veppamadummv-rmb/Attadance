import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "School Loan Board", description: "Secure teacher deposits and loan management", icons: { icon: "/favicon.svg" } };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
