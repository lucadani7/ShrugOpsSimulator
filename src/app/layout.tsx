import type {Metadata} from "next";
import {JetBrains_Mono} from "next/font/google"; // programmers font
import "./globals.css";
import React from "react";

const mono = JetBrains_Mono({subsets: ["latin"]});

export const metadata: Metadata = {
    title: "ShrugOps", // brand name
    description: "It works on my machine... until it doesn't.",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
        <body className={`${mono.className} bg-slate-950 text-green-500 antialiased h-screen overflow-hidden`}>
        {children}
        </body>
        </html>
    );
}