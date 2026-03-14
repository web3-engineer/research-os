"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useSession } from "next-auth/react";
import logoPng from "@/app/zaeon-name.png";

import ThemeToggle from "@/components/sub/ThemeToggle";
import "../../src/i18n";

const TRACKS = [
  "/assets/sounds/zaeon-theme-chill.mp3",
  "/assets/sounds/zaeon-theme-uplift.mp3"
];

const NUM_BARS = 12;

export const Navbar = () => {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  // --- ESTADOS DO PLAYER ---
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [showTrackName, setShowTrackName] = useState(false);

  // --- REFS ---
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const barsRef = useRef<(HTMLDivElement | null)[]>([]);
  
  const isPlayingRef = useRef(false);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    setMounted(true);
    
    if (!audioRef.current) {
      const audio = new Audio(TRACKS[0]);
      audio.crossOrigin = "anonymous";
      audio.volume = 0.25; 
      audio.onended = () => handleNextTrack();
      audioRef.current = audio;
    }
    
    // LÓGICA DE AUTOPLAY NA HOME
    if (pathname === "/") {
        // Tenta tocar automaticamente aproveitando a interação do IntroOverlay
        setTimeout(() => {
            togglePlay(true); 
        }, 1000);
    }

    return () => audioRef.current?.pause();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initAudioEngine = async () => {
    if (!audioRef.current) return;
    
    if (!audioCtxRef.current) {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioContext();
    }

    if (!sourceRef.current) {
      analyserRef.current = audioCtxRef.current.createAnalyser();
      analyserRef.current.fftSize = 128;
      sourceRef.current = audioCtxRef.current.createMediaElementSource(audioRef.current);
      sourceRef.current.connect(analyserRef.current);
      analyserRef.current.connect(audioCtxRef.current.destination);
      visualize(); 
    }

    if (audioCtxRef.current.state === "suspended") {
      await audioCtxRef.current.resume();
    }
  };

  const visualize = () => {
    if (!analyserRef.current) return;
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    const idleHeights = [20, 40, 60, 30, 70, 40, 80, 25, 50, 30, 60, 20];

    const render = () => {
      requestAnimationFrame(render);
      const playing = isPlayingRef.current;

      barsRef.current.forEach((bar, i) => {
        if (!bar) return;

        if (playing && analyserRef.current) {
          analyserRef.current.getByteFrequencyData(dataArray);
          const val = dataArray[i * 2] || 0;
          const h = Math.min(100, Math.max(15, (val / 255) * 100 * 1.5));
          bar.style.height = `${h}%`;
          bar.style.opacity = "1";
          bar.style.transition = "none";
        } else {
          bar.style.height = `${idleHeights[i % idleHeights.length]}%`;
          bar.style.opacity = "0.4";
          bar.style.transition = "height 0.8s ease-in-out";
        }
      });
    };
    render();
  };

  const togglePlay = async (forcePlay = false) => {
    if (!audioRef.current) return;
    await initAudioEngine();

    if (isPlaying && !forcePlay) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
          setIsPlaying(true);
      }).catch(() => {
          console.log("Autoplay bloqueado pelo browser.");
      });
    }
  };

  const handleNextTrack = () => {
    if (!audioRef.current) return;
    const next = (currentTrackIndex + 1) % TRACKS.length;
    setCurrentTrackIndex(next);
    audioRef.current.src = TRACKS[next];
    if (isPlaying) audioRef.current.play();
  };

  const handlePrevTrack = () => {
    if (!audioRef.current) return;
    const prev = (currentTrackIndex - 1 + TRACKS.length) % TRACKS.length;
    setCurrentTrackIndex(prev);
    audioRef.current.src = TRACKS[prev];
    if (isPlaying) audioRef.current.play();
  };

  const getTrackName = () => TRACKS[currentTrackIndex].split('/').pop()?.replace('.mp3', '') || 'Track';

  // --- LÓGICA DE HIGHLIGHT ---
  const checkActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  const getLinkClassName = (path: string) => {
    const active = checkActive(path);
    const base = "transition-all duration-300 hover:scale-105 uppercase tracking-widest text-[11px] font-bold";
    const activeStyle = "text-cyan-500 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)] scale-110";
    const inactiveStyle = "text-foreground/60 hover:text-cyan-400";
    
    return `${base} ${active ? activeStyle : inactiveStyle}`;
  };

  if (!mounted) return <div className="w-full h-[90px] fixed top-0 z-[100]" />;

  return (
    <div className="w-full h-[90px] fixed top-0 z-[100] flex justify-center items-center pointer-events-none">
      <div className="pointer-events-auto w-[96%] max-w-[1300px] h-[70px] rounded-[35px] backdrop-blur-xl bg-background/70 border border-foreground/10 shadow-2xl flex items-center justify-between px-8 transition-all duration-500">
        
        <Link href="/" className="hover:scale-105 transition-transform">
          <Image src={logoPng} alt="logo" width={220} height={100} priority className="h-10 w-auto object-contain invert dark:invert-0" />
        </Link>

        <nav className="hidden lg:flex items-center gap-10">
          <Link href="/about" className={getLinkClassName("/about")}>About</Link>
          <Link href="/research-lab" className={getLinkClassName("/research-lab")}>Pesquisa</Link>
          <Link href="/workstation" className={getLinkClassName("/workstation")}>Workstation</Link>
          <Link href="/plugin-store" className={getLinkClassName("/plugin-store")}>Plugin Store</Link>
        </nav>

        <div className="flex items-center gap-6">
          <div className="flex items-center bg-foreground/5 dark:bg-white/5 backdrop-blur-2xl border border-foreground/10 dark:border-white/10 rounded-full px-4 py-2 transition-all">
            
            <div className="flex items-center gap-3 mr-4">
              <button onClick={handlePrevTrack} className="text-foreground/40 hover:text-cyan-500 transition-colors text-xs">⏮</button>
              <button onClick={() => togglePlay()} className="text-foreground hover:text-cyan-500 transition-all text-xl w-6">
                {isPlaying ? "⏸" : "▶"}
              </button>
              <button onClick={handleNextTrack} className="text-foreground/40 hover:text-cyan-500 transition-colors text-xs">⏭</button>
            </div>

            <div className="w-[1px] h-4 bg-foreground/20 dark:bg-white/20 mr-4"></div>

            <div 
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => setShowTrackName(!showTrackName)}
            >
              <div className="flex items-end gap-[3px] h-5 w-auto">
                {Array.from({ length: NUM_BARS }).map((_, i) => (
                  <div
                    key={i}
                    ref={(el) => { barsRef.current[i] = el; }}
                    className="w-[3px] rounded-t-[1.5px] bg-cyan-500 shadow-[0_0_8px_rgba(34,211,238,0.4)]"
                    style={{ height: '30%' }}
                  />
                ))}
              </div>

              <div className={`overflow-hidden transition-all duration-500 ${showTrackName ? 'max-w-[150px] opacity-100' : 'max-w-0 opacity-0'}`}>
                <span className="text-[10px] font-black tracking-tighter whitespace-nowrap text-cyan-600 dark:text-cyan-400 uppercase">
                   {getTrackName()}
                </span>
              </div>
            </div>
          </div>

          <ThemeToggle />
        </div>
      </div>
    </div>
  );
};