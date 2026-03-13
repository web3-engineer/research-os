"use client";

import MacSplash from "@/components/ui/MacSplash";

export default function Loading() {
    // Aqui não precisamos de estado; exibe a tela de loading durante o suspense
    return <MacSplash show logoSrc="/assets/zaeon-logo.png" hint="Loading Modules..." />;
}