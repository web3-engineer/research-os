"use client";

import React, { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";

// --- CONFIGURAÇÕES VISUAIS ---
// Aumentado para 2025 (raiz quadrada exata de 45) para restaurar a densidade da cobra e do globo
const PARTICLE_COUNT = 2025;
// Aumentado ligeiramente o tamanho do globo (de 0.25 para 0.3)
const GLOBE_RADIUS_RATIO = 0.3;
const SNAKE_THICKNESS = 50;
const SNAKE_SPEED = 0.01;

// Cores restritas apenas a Azuis e Cianos
const COLORS = [
    "#0ea5e9", // Azul claro
    "#00f0ff", // Ciano Neon
    "#0066ff", // Azul profundo
    "#3b82f6", // Azul médio
    "#22d3ee", // Ciano claro
];

interface Particle {
    x: number;
    y: number;
    size: number;
    color: string;
    theta: number;
    phi: number;
    angle: number;
    distance: number;
    // Propriedades da Pirâmide
    pyrX: number;
    pyrY: number;
}

const MatrixRain: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const { theme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    useEffect(() => {
        if (!mounted) return;

        const canvas = canvasRef.current!;
        const ctx = canvas.getContext("2d", { alpha: false })!; // alpha: false melhora a performance base
        let width = 0, height = 0;

        let particles: Particle[] = [];
        let animationId: number;
        let time = 0;

        // Fases: 0=Globo, 1=Serpente, 2=Geometria, 3=Pirâmide, 4=Explosão
        let phase = 0;
        let phaseTimer = 0;

        const currentTheme = theme === 'system' ? resolvedTheme : theme;
        const isDark = currentTheme === 'dark';

        const bgColor = isDark ? "#010816" : "#e2e8f0";
        const fadeColor = isDark ? "rgba(1, 8, 22, 0.3)" : "rgba(226, 232, 240, 0.3)";

        const applyDPR = () => {
            const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
            width = canvas.clientWidth;
            height = canvas.clientHeight;
            canvas.width = Math.floor(width * dpr);
            canvas.height = Math.floor(height * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };

        const initParticles = () => {
            particles = [];
            const phiFactor = Math.PI * (3 - Math.sqrt(5));

            const spacingX = 14; // Espaçamento ajustado para a nova densidade
            const spacingY = 14;
            const maxRow = Math.floor(Math.sqrt(PARTICLE_COUNT));

            for (let i = 0; i < PARTICLE_COUNT; i++) {
                const y_pos = 1 - (i / (PARTICLE_COUNT - 1)) * 2;

                // Lógica da Pirâmide 2D
                const row = Math.floor(Math.sqrt(i));
                const col = i - (row * row);

                particles.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    // Tamanho ligeiramente reduzido para compensar a alta densidade
                    size: Math.random() * 1.2 + 0.8,
                    color: COLORS[i % COLORS.length],
                    theta: phiFactor * i,
                    phi: Math.acos(y_pos),
                    angle: (i / PARTICLE_COUNT) * Math.PI * 25,
                    distance: Math.sqrt(i / PARTICLE_COUNT),
                    pyrX: (col - row) * spacingX,
                    pyrY: (row - maxRow / 2) * spacingY,
                });
            }
        };

        const draw = () => {
            ctx.globalCompositeOperation = "source-over";
            ctx.fillStyle = fadeColor;
            ctx.fillRect(0, 0, width, height);

            phaseTimer++;

            if (phase === 0 && phaseTimer > 300) { phase = 1; phaseTimer = 0; }
            else if (phase === 1 && phaseTimer > 360) { phase = 2; phaseTimer = 0; }
            else if (phase === 2 && phaseTimer > 400) { phase = 3; phaseTimer = 0; }
            else if (phase === 3 && phaseTimer > 450) { phase = 4; phaseTimer = 0; }
            else if (phase === 4 && phaseTimer > 120) { phase = 0; phaseTimer = 0; }

            time += SNAKE_SPEED;

            // POSIÇÃO DO GLOBO: Movido mais para a direita (0.82)
            const centerX = width * 0.78;
            const centerY = height * 0.4;
            const screenCenterX = width * 0.5;
            const globeRadius = Math.min(width, height) * GLOBE_RADIUS_RATIO;

            ctx.globalCompositeOperation = isDark ? "screen" : "source-over";

            particles.forEach((p, i) => {
                let targetX = p.x;
                let targetY = p.y;
                let scale = 1;
                let isSquare = false;

                if (phase === 0) {
                    // 1. GLOBO
                    const rotation = time * 2;
                    const sx = globeRadius * Math.sin(p.phi) * Math.cos(p.theta + rotation);
                    const sz = globeRadius * Math.sin(p.phi) * Math.sin(p.theta + rotation);
                    const sy = globeRadius * Math.cos(p.phi);
                    const persp = 300 / (300 - sz);
                    scale = Math.max(0.1, persp);
                    targetX = centerX + sx;
                    targetY = centerY + sy;
                }
                else if (phase === 1) {
                    // 2. SERPENTE
                    const t = time * 2 - (i * 0.002);
                    const wx = Math.cos(t) * (width * 0.4) + Math.sin(t * 2.1) * (width * 0.1);
                    const wy = Math.sin(t * 1.3) * (height * 0.4) + Math.cos(t * 1.7) * (height * 0.1);
                    targetX = screenCenterX + wx + Math.cos(i) * SNAKE_THICKNESS;
                    targetY = (height * 0.5) + wy + Math.sin(i) * SNAKE_THICKNESS;
                }
                else if (phase === 2) {
                    // 3. GEOMETRIA
                    const shapeShift = Math.sin(phaseTimer * 0.03);
                    const spiralX = Math.cos(p.angle + time) * p.distance * globeRadius * 1.8;
                    const spiralY = Math.sin(p.angle + time) * p.distance * globeRadius * 1.8;
                    const k = 5, l = 0.5, geoR = globeRadius * 1.3;
                    const geoX = geoR * ((1 - k) * Math.cos(p.angle) + l * k * Math.cos((1 - k) / k * p.angle));
                    const geoY = geoR * ((1 - k) * Math.sin(p.angle) - l * k * Math.sin((1 - k) / k * p.angle));
                    const lerp = (shapeShift + 1) / 2;
                    targetX = centerX + (spiralX * (1 - lerp) + geoX * lerp);
                    targetY = centerY + (spiralY * (1 - lerp) + geoY * lerp);
                }
                else if (phase === 3) {
                    // 4. PIRÂMIDE
                    isSquare = true;
                    targetX = screenCenterX + p.pyrX;
                    targetY = centerY + p.pyrY;
                    const row = Math.floor(Math.sqrt(i));
                    const pulse = Math.sin(time * 8 + row * 0.2);
                    scale = 0.8 + pulse * 0.4;
                }
                else if (phase === 4) {
                    // 5. EXPLOSÃO
                    const dx = p.x - screenCenterX;
                    const dy = p.y - (height * 0.5);
                    const angle = Math.atan2(dy, dx);
                    targetX = p.x + Math.cos(angle) * 15;
                    targetY = p.y + Math.sin(angle) * 15;
                }

                const ease = phase === 4 ? 1 : 0.08;
                p.x += (targetX - p.x) * ease;
                p.y += (targetY - p.y) * ease;

                // Mantido sem shadowBlur para evitar o bug das luzes piscando
                let alpha = phase === 0 ? (scale > 1 ? 1 : 0.4) : 0.8;

                ctx.fillStyle = p.color;
                ctx.globalAlpha = isDark ? alpha : alpha * 0.8;

                ctx.beginPath();
                if (isSquare) {
                    const s = 6 * scale;
                    ctx.fillRect(p.x - s / 2, p.y - s / 2, s, s);
                } else {
                    ctx.arc(p.x, p.y, p.size * scale, 0, Math.PI * 2);
                    ctx.fill();
                }
            });

            ctx.globalAlpha = 1;
            animationId = requestAnimationFrame(draw);
        };

        applyDPR();

        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, width, height);

        initParticles();
        animationId = requestAnimationFrame(draw);

        const onResize = () => {
            applyDPR();
            initParticles();
        };

        const ro = new ResizeObserver(onResize);
        ro.observe(canvas);

        return () => {
            cancelAnimationFrame(animationId);
            ro.disconnect();
        };
    }, [theme, resolvedTheme, mounted]);

    if (!mounted) return <div className="fixed inset-0 z-0 bg-[#010816]" />;

    return (
        <div className="fixed inset-0 z-0 pointer-events-none transition-colors duration-500">
            <canvas ref={canvasRef} className="w-full h-full" style={{ imageRendering: "auto" }} />
        </div>
    );
};

export const StarsCanvas = MatrixRain;
export default MatrixRain;