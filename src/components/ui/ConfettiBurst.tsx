'use client';

import React, { useEffect, useRef } from 'react';

interface ConfettiBurstProps {
  onComplete?: () => void;
}

export default function ConfettiBurst({ onComplete }: ConfettiBurstProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    // Check prefers-reduced-motion
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      if (onComplete) onComplete();
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Theme colours: electric, sky, emerald, amber, violet, coral
    const colors = ['#0076F9', '#02B3FF', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#00A4FD'];
    const particleCount = 42;

    const particles = Array.from({ length: particleCount }, () => ({
      x: canvas.width / 2 + (Math.random() - 0.5) * 80,
      y: canvas.height * 0.45 + (Math.random() - 0.5) * 40,
      vx: (Math.random() - 0.5) * 14,
      vy: -Math.random() * 12 - 4,
      gravity: 0.38,
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 10,
      size: Math.random() * 6 + 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      opacity: 1,
    }));

    let animationId: number;
    const startTime = performance.now();
    const duration = 1200; // 1.2s

    const render = (now: number) => {
      const elapsed = now - startTime;
      const progress = elapsed / duration;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.vy += p.gravity;
        p.y += p.vy;
        p.rotation += p.rotSpeed;
        p.opacity = Math.max(0, 1 - progress);

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      });

      if (elapsed < duration) {
        animationId = requestAnimationFrame(render);
      } else {
        if (onComplete) onComplete();
      }
    };

    animationId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [onComplete]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[100]"
      style={{ width: '100vw', height: '100vh' }}
    />
  );
}
