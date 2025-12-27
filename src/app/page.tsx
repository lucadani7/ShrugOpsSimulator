"use client";

import { useState, useEffect, useRef } from "react";
import { Server, ShieldAlert, Play, RefreshCw, CheckCircle } from "lucide-react";
import { clsx } from "clsx";

// --- CONFIGURATION & TEXTS ---
const SOURCE_CODE = `import { pray } from '@shrug/gods';
// ShrugOps v1.0 - The "It Works On My Machine" Deployer

async function deployToProd() {
  console.log("Starting deployment...");
  // Step 1: Bypass unit tests
  const testsPassed = true; 
  
  // Step 2: Push to container
  try {
    await docker.push('shrug-image:latest');
  } catch (e) {
    // If it fails, just try again harder
    await docker.push('shrug-image:latest', { force: true });
  }

  // Step 3: Database migration
  const dbStatus = await database.migrate();
  return "Success (probably)";}`;

const EXCUSES = [
  "It's a DNS issue.",
  "The user is holding the mouse wrong.",
  "That's a feature, not a bug.",
  "It worked on localhost:3000.",
  "Cosmic radiation flipped a bit.",
  "The senior dev merged without review.",
  "I haven't had my coffee yet.",
  "AWS is down (it's actually not).",
  "The AWS payment didn’t go through.",
  "The office internet went down.",
  "The senior dev is on vacation.",
  "I forgot a semicolon somewhere.",
  "It worked on my local machine...",
  "It worked perfectly yesterday.",
  "It’s your browser cache.",
  "It works on my machine.",
  "Someone pushed directly to main.",
  "It’s an issue with Google’s API.",
  "I forgot to run npm install.",
  "The SSL certificate just expired.",
  "It’s a Windows issue, I’m MacOS user.",
  "AWS went down in this region.",
  "I thought I deployed to staging, not production.",
  "My cat walked across the keyboard and deleted a semicolon.",
  "It’s due to the phase of the moon, it affects the server bits.",
  "Stack Overflow was down when I wrote this function.",
  "I used ChatGPT v3.5 instead of v4.",
  "The code reviewer told me it was fine.",
  "It worked fine until users showed up.",
  "I thought ‘delete’ meant ‘archive’.",
  "My neighbor’s router is acting up.",
  "The CPU overheated and skipped an if statement."
];

// Function to play a mechanical keyboard "click" sound using Web Audio API
const playClickSound = () => {
  const AudioContextClass = window.AudioContext || (window as typeof window & {
    webkitAudioContext: typeof AudioContext;
  }).webkitAudioContext;

  if (!AudioContextClass) {
    return;
  }

  const audioCtx = new AudioContextClass();
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.type = 'square';
  const frequency = 150 + Math.random() * 50;
  oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);

  gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05);

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.start();
  oscillator.stop(audioCtx.currentTime + 0.05);
};

export default function Home() {
  // --- STATE MANAGEMENT ---
  const [displayedCode, setDisplayedCode] = useState("");
  const [, setCharIndex] = useState(0);
  const [stability, setStability] = useState(0); // Range: 0 to 100
  const [isDeploying, setIsDeploying] = useState(false);

  // Game Status: 'idle' = waiting, 'success' = deployed, 'crashed' = failed
  const [gameStatus, setGameStatus] = useState<'idle' | 'success' | 'crashed'>('idle');
  const [logs, setLogs] = useState<string[]>(["> System initialized...", "> Waiting for code input..."]);
  const [crashReason, setCrashReason] = useState("");

  // Refs for auto-scrolling
  const codeContainerRef = useRef<HTMLDivElement>(null);
  const logsContainerRef = useRef<HTMLDivElement>(null);

  // --- HELPER FUNCTIONS ---
  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `> ${msg}`]);
  };

  // Effect: Auto-scroll logs when new logs are added
  useEffect(() => {
    if (logsContainerRef.current) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
    }
  }, [logs]);

  // --- 1. TYPING MECHANIC (CORE LOOP) ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore system keys to prevent browser shortcuts
      if (e.ctrlKey || e.altKey || e.metaKey || isDeploying || gameStatus !== 'idle') {
        return;
      }

      playClickSound();

      // Add visual code to the editor
      setCharIndex((prev) => {
        const nextIndex = (prev + 3) % SOURCE_CODE.length; // Infinite loop for code text
        if (nextIndex < prev) setDisplayedCode(SOURCE_CODE.slice(0, nextIndex)); // Reset visual loop
        else setDisplayedCode(SOURCE_CODE.slice(0, nextIndex));
        return nextIndex;
      });

      // Increase stability (capped at 100%)
      setStability(prev => Math.min(prev + 2, 100));
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDeploying, gameStatus]);

  // --- 2. DEPLOYMENT MECHANIC ---
  const handleDeploy = async () => {
    if (stability < 10) {
      addLog("Cannot deploy: Codebase too empty! Write more code.");
      return;
    }

    setIsDeploying(true);
    setGameStatus('idle');
    setLogs(["> INITIALIZING DEPLOY SEQUENCE..."]);

    // Simulate deployment steps with delay
    const steps = [
      "Compiling TypeScript...",
      "Ignoring ESLint warnings...",
      "Building Docker image...",
      "Pushing to Production...",
      "Crossing fingers..."
    ];

    for (const step of steps) {
      await new Promise(r => setTimeout(r, 800)); // 800ms delay per step
      addLog(step);
    }

    await new Promise(r => setTimeout(r, 1000)); // Final suspense delay

    // --- THE MOMENT OF TRUTH (RNG Logic) ---
    // Success chance is based on stability, but never 100% guaranteed.
    // Even with 100% stability, there is a base risk factor.
    const luckFactor = Math.random();
    const successChance = 0.5;

    if (luckFactor < successChance) {
      // SUCCESS SCENARIO
      setGameStatus('success');
      addLog("DEPLOYMENT SUCCESSFUL!");
    } else {
      // FAIL SCENARIO
      setGameStatus('crashed');
      const randomExcuse = EXCUSES[Math.floor(Math.random() * EXCUSES.length)];
      setCrashReason(randomExcuse);
      addLog(`FATAL ERROR: ${randomExcuse}`);
    }

    setIsDeploying(false);
  };

  const handleReset = () => {
    setDisplayedCode("");
    setCharIndex(0);
    setStability(0);
    setGameStatus('idle');
    setLogs(["> System reset.", "> Ready for new ticket."]);
  };

  return (
      <main className={clsx(
          "flex h-screen w-full bg-slate-950 text-green-500 font-mono overflow-hidden relative",
          gameStatus === 'crashed' && "shake"
      )}>

        {/* CRT Effects Layer */}
        <div className="crt-overlay pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-green-500/5 to-transparent opacity-10 pointer-events-none" />

        {/* --- LEFT SIDE: CODE EDITOR --- */}
        <section className="w-2/3 border-r border-slate-800 flex flex-col relative transition-opacity duration-500"
                 style={{ opacity: isDeploying ? 0.5 : 1 }}>
          {/* Editor Tab Bar */}
          <div className="h-10 bg-slate-900 border-b border-slate-800 flex items-center px-4 gap-2 text-sm text-slate-400 select-none">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/50" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
              <div className="w-3 h-3 rounded-full bg-green-500/50" />
            </div>
            <span className="ml-4 text-xs">legacy_codebase.ts</span>
          </div>

          {/* Scrollable Code Area */}
          <div ref={codeContainerRef} className="flex-1 p-6 overflow-y-auto font-mono text-sm leading-relaxed scrollbar-hide">
          <pre className="whitespace-pre-wrap text-slate-300">
            {displayedCode}
            <span className="animate-pulse bg-green-500 text-black ml-1"> </span>
          </pre>

            {/* Overlay when empty */}
            {displayedCode.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-50">
                  <p className="text-xl text-slate-600 font-bold animate-pulse">
                    [ TYPE TO INCREASE STABILITY ]
                  </p>
                </div>
            )}
          </div>
        </section>

        {/* --- RIGHT SIDE: DASHBOARD --- */}
        <section className="w-1/3 bg-slate-925 flex flex-col relative z-10 border-l border-slate-900">

          {/* Status Header */}
          <div className="p-4 border-b border-slate-800 bg-slate-900/50">
            <h2 className="text-xl font-bold flex items-center gap-2 text-white">
              {gameStatus === 'crashed' ? (
                  <><ShieldAlert className="text-red-500" /> <span className="text-red-500">SYSTEM FAILURE</span></>
              ) : gameStatus === 'success' ? (
                  <><CheckCircle className="text-green-400" /> <span className="text-green-400">DEPLOYED</span></>
              ) : (
                  <><Server className="text-slate-400" /> <span>IDLE MODE</span></>
              )}
            </h2>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-4 p-4 text-xs">
            <div className="bg-slate-900 p-3 rounded border border-slate-800">
              <div className="flex justify-between mb-1 text-slate-400">
                <span>LOCAL STABILITY</span>
                <span>{stability}%</span>
              </div>
              {/* Progress Bar Visualization */}
              <div className="w-full bg-slate-800 h-2 rounded overflow-hidden">
                <div
                    className={clsx("h-full transition-all duration-300", {
                      "bg-red-500": stability < 30,
                      "bg-yellow-500": stability >= 30 && stability < 70,
                      "bg-green-500": stability >= 70
                    })}
                    style={{ width: `${stability}%` }}
                />
              </div>
            </div>
          </div>

          {/* MAIN VISUALIZATION AREA (The Monitor) */}
          <div className="flex-1 p-4 m-4 bg-black/50 rounded border border-slate-800 flex flex-col items-center justify-center gap-4 relative overflow-hidden">

            {/* Animated Background during deploy */}
            {isDeploying && (
                <div className="absolute inset-0 bg-green-900/20 animate-pulse z-0" />
            )}

            {/* STATE: CRASHED - FINAL VERSION */}
            {gameStatus === 'crashed' && (
                <div className="text-center relative z-50 animate-bounce">
                  <div className="mx-auto mb-4 w-40 h-40 flex items-center justify-center bg-yellow-500 rounded-full border-8 border-yellow-600 shadow-[0_0_30px_rgba(234,179,8,0.5)]">
                    <svg
                        viewBox="0 0 100 100"
                        className="w-32 h-32 fill-none stroke-yellow-900"
                        strokeWidth="2"
                    >
                      <circle cx="50" cy="50" r="45" fill="#fef08a" />
                      <text x="50" y="35" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#854d0e">IT WORKS ON</text>
                      <text x="50" y="45" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#854d0e">MY MACHINE</text>

                      {/* Shrug mascote ¯\_(ツ)_/¯ drawed manually */}
                      <text x="50" y="75" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#854d0e">¯\_(ツ)_/¯</text>

                      {/* Decorative stars */}
                      <path d="M50 10 L52 15 L58 15 L53 19 L55 25 L50 21 L45 25 L47 19 L42 15 L48 15 Z" fill="#854d0e" />
                    </svg>
                  </div>

                  <h3 className="text-red-500 text-xl font-bold uppercase tracking-widest bg-black/80 inline-block px-2">
                    Deployment Failed
                  </h3>
                  <p className="text-yellow-400 italic mt-2 font-bold text-lg">
                    &#34;{crashReason}&#34;
                  </p>
                  <div className="mt-4 text-xs text-slate-500 animate-pulse">
                    (Check local logs... Oh wait, you can&#39;t do that!)
                  </div>
                </div>
            )}

            {/* STATE: SUCCESS */}
            {gameStatus === 'success' && (
                <div className="text-center z-10 animate-in fade-in zoom-in duration-500">
                  <div className="text-6xl mb-4 drop-shadow-[0_0_15px_rgba(74,222,128,0.5)]">🚀</div>
                  <h3 className="text-green-400 text-2xl font-bold glow-text">DEPLOYMENT SUCCESSFUL</h3>

                  {/* Mesajul suspicios */}
                  <p className="text-slate-500 text-sm mt-3 italic font-medium">
                    &#34;Wait, it actually worked? I didn&#39;t even change that bug...&#34;
                  </p>

                  <div className="mt-6 py-1 px-3 border border-green-900/30 bg-green-900/10 rounded-full inline-block">
      <span className="text-[10px] text-green-500 uppercase tracking-widest animate-pulse">
        Status: Uncomfortably Stable
      </span>
                  </div>
                </div>
            )}

            {/* STATE: IDLE / DEPLOYING */}
            {gameStatus === 'idle' && (
                <>
                  <Server className={clsx("w-20 h-20 transition-all", isDeploying ? "text-yellow-400 animate-pulse" : "text-slate-700")} />
                  <p className="text-sm text-slate-600">{isDeploying ? "Deploying to production..." : "Ready for code"}</p>
                </>
            )}
          </div>

          {/* Terminal Logs */}
          <div ref={logsContainerRef} className="h-48 bg-black border-t border-slate-800 p-3 font-mono text-xs overflow-y-auto text-slate-400">
            {logs.map((log, i) => (
                <div key={i} className="mb-1 text-green-400/80">{log}</div>
            ))}
          </div>

          {/* Control Buttons */}
          <div className="p-4 border-t border-slate-800 flex gap-2 bg-slate-900/50">
            <button
                disabled={isDeploying}
                onClick={handleDeploy}
                className={clsx(
                    "flex-1 font-bold py-4 px-4 rounded flex items-center justify-center gap-2 transition-all",
                    isDeploying ? "bg-slate-700 text-slate-500 cursor-not-allowed" : "bg-green-600 hover:bg-green-700 text-black shadow-[0_0_15px_rgba(22,163,74,0.5)]"
                )}>
              {isDeploying ? "DEPLOYING..." : "DEPLOY TO PROD"}
              {!isDeploying && <Play className="w-5 h-5" />}
            </button>

            <button
                onClick={handleReset}
                className="bg-slate-800 hover:bg-slate-700 text-white p-4 rounded transition-all border border-slate-700"
                title="Reset Game"
            >
              <RefreshCw className={clsx("w-5 h-5", { "animate-spin": isDeploying })} />
            </button>
          </div>

        </section>
      </main>
  );
}