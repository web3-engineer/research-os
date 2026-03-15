import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Space_Grotesk, JetBrains_Mono, Outfit } from "next/font/google";

import { siteConfig } from "@/config";
import { cn } from "@/lib/utils";

// --- PROVIDERS ---
import AuthProvider from "@/src/providers/SessionProvider";
import { ThemeProvider } from "./providers";
// 1. IMPORT THE WEB3 PROVIDER
import { Web3Provider } from "@/src/context/Web3Context";

// --- COMPONENTES GLOBAIS ---
import GlobalClickSound from "@/components/main/GlobalClickSound";
import { Navbar } from "@/components/main/navbar"; // <-- IMPORTAÇÃO DA NAVBAR AQUI (ajuste o caminho se necessário)

import "../src/i18n";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
    subsets: ["latin"],
    variable: "--font-space",
    weight: ["300", "400", "500", "600", "700"],
    display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
    subsets: ["latin"],
    variable: "--font-code",
    weight: ["100", "200", "300", "400", "500", "600", "700", "800"],
    display: "swap",
});

const outfit = Outfit({
    subsets: ["latin"],
    variable: "--font-outfit",
    weight: ["300", "400", "500", "600", "700", "800", "900"],
    display: "swap",
});

export const viewport: Viewport = { themeColor: "#030014" };
export const metadata: Metadata = siteConfig;

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="en" className="scroll-smooth" suppressHydrationWarning>
            <body
                className={cn(
                    "relative bg-white dark:bg-background text-foreground overflow-x-hidden overflow-y-scroll",
                    spaceGrotesk.variable,
                    jetbrainsMono.variable,
                    outfit.variable,
                    "font-sans"
                )}
            >
                {/* Injetamos o som aqui para que ele escute os eventos de clique 
                  em qualquer lugar da aplicação (acima de todos os providers).
                */}
                <GlobalClickSound />

                <ThemeProvider
                    attribute="class"
                    defaultTheme="dark"
                    enableSystem
                    disableTransitionOnChange
                >
                    <AuthProvider>
                        {/* 2. WRAP CHILDREN IN WEB3 PROVIDER */}
                        <Web3Provider>
                            {/* AQUI ESTÁ O SEGREDO: 
                                A Navbar nasce junto com a aplicação e nunca morre. 
                                O áudio dela persiste em todas as rotas. 
                            */}
                            <Navbar />
                            {children}
                        </Web3Provider>
                    </AuthProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}