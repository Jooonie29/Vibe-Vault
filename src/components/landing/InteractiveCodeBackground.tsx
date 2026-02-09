import React, { useEffect, useRef } from 'react';

const codeSnippets = [
  'const', 'await', 'function', 'import', 'export', 'return',
  'interface', 'type', 'div', 'span', 'class', 'from',
  '=>', '{}', '[]', '()', 'async', 'default',
  'useEffects', 'useState', 'component', 'props',
  'api', 'void', 'null', 'true', 'false', 'if',
  'else', 'map', 'filter', 'reduce', 'try', 'catch'
];

export const InteractiveCodeBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = container.offsetWidth;
    let height = container.offsetHeight;
    
    const handleResize = () => {
        width = container.offsetWidth;
        height = container.offsetHeight;
        canvas.width = width;
        canvas.height = height;
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);

    // Particles
    const particles: any[] = [];
    const particleCount = 60; // Density

    const createParticle = (override?: any) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      text: codeSnippets[Math.floor(Math.random() * codeSnippets.length)],
      size: Math.floor(Math.random() * 14) + 12, // 12-26px
      speedY: Math.random() * 0.5 + 0.2,
      opacity: Math.random() * 0.2 + 0.05, // Very subtle base opacity
      baseOpacity: Math.random() * 0.2 + 0.05,
      ...override
    });

    for (let i = 0; i < particleCount; i++) {
        particles.push(createParticle());
    }

    const animate = () => {
        ctx.clearRect(0, 0, width, height);
        
        particles.forEach(p => {
            // Update position
            p.y -= p.speedY; // Move up
            if (p.y < -50) {
              p.y = height + 50;
              p.x = Math.random() * width;
              p.text = codeSnippets[Math.floor(Math.random() * codeSnippets.length)];
            }

            // Mouse interaction
            const dx = mouse.current.x - p.x;
            const dy = mouse.current.y - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const interactionRadius = 200;

            let scale = 1;
            let alpha = p.baseOpacity;

            if (dist < interactionRadius) {
                // Brighten and slightly enlarge near mouse
                const factor = 1 - dist / interactionRadius;
                alpha = p.baseOpacity + factor * 0.6; // Significantly brighten
                scale = 1 + factor * 0.3; // Enlarge
                
                // Subtle attraction or repulsion could be added here
                // For now, just visual highlight
            }

            ctx.font = `bold ${p.size * scale}px "JetBrains Mono", monospace`;
            
            // Gradient or color based on position/random
            // Using brand violet color: #7c3aed (rgb: 124, 58, 237)
            ctx.fillStyle = `rgba(124, 58, 237, ${alpha})`; 
            
            ctx.fillText(p.text, p.x, p.y);
        });

        requestAnimationFrame(animate);
    };

    const animationId = requestAnimationFrame(animate);

    const handleMouseMove = (e: MouseEvent) => {
        const rect = container.getBoundingClientRect();
        mouse.current.x = e.clientX - rect.left;
        mouse.current.y = e.clientY - rect.top;
    };

    container.addEventListener('mousemove', handleMouseMove);
    // Also track mouse on window to reset if user leaves the area? 
    // Actually, just tracking on container is enough for the "flashlight" effect inside.

    return () => {
        window.removeEventListener('resize', handleResize);
        container.removeEventListener('mousemove', handleMouseMove);
        cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-[#0A0C14] via-transparent to-[#0A0C14] z-10 opacity-80 pointer-events-none" />
      <canvas ref={canvasRef} className="block w-full h-full opacity-60" />
    </div>
  );
};
