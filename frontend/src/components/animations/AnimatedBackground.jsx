import React, { useMemo, useEffect, useState } from 'react';
import { Box, useTheme } from '@mui/material';
import { motion, useAnimation, useViewportScroll } from 'framer-motion';

// 🫧 Floating Bubbles Background
export const FloatingBubbles = ({ 
  count = 15, 
  size = 'random', 
  opacity = 0.1,
  speed = 'slow' 
}) => {
  const theme = useTheme();
  
  const bubbles = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      size: size === 'random' ? Math.random() * 60 + 20 : size,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 5,
      duration: speed === 'slow' ? 15 + Math.random() * 10 : 8 + Math.random() * 5,
    }));
  }, [count, size, speed]);

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: -1,
      }}
    >
      {bubbles.map((bubble) => (
        <motion.div
          key={bubble.id}
          initial={{
            x: `${bubble.x}vw`,
            y: '100vh',
            opacity: 0,
          }}
          animate={{
            y: '-20vh',
            opacity: [0, opacity, opacity, 0],
            x: [
              `${bubble.x}vw`,
              `${bubble.x + Math.sin(bubble.id) * 10}vw`,
              `${bubble.x - Math.cos(bubble.id) * 8}vw`,
              `${bubble.x + Math.sin(bubble.id * 2) * 12}vw`,
            ],
          }}
          transition={{
            duration: bubble.duration,
            repeat: Infinity,
            delay: bubble.delay,
            ease: 'linear',
          }}
          style={{
            position: 'absolute',
            width: bubble.size,
            height: bubble.size,
            borderRadius: '50%',
            background: `radial-gradient(circle at 30% 30%, 
              rgba(255,255,255,0.8), 
              ${theme.palette.primary.main}30, 
              ${theme.palette.primary.main}10
            )`,
            border: `1px solid ${theme.palette.primary.main}20`,
            backdropFilter: 'blur(1px)',
          }}
        />
      ))}
    </Box>
  );
};

// 👕 Floating Clothes Particles
export const ClothParticles = ({ count = 10, colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57'] }) => {
  const theme = useTheme();
  
  const particles = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      size: Math.random() * 15 + 5,
      x: Math.random() * 100,
      y: Math.random() * 100,
      rotation: Math.random() * 360,
      color: colors[Math.floor(Math.random() * colors.length)],
      shape: ['shirt', 'pants', 'sock', 'dress'][Math.floor(Math.random() * 4)],
      delay: Math.random() * 8,
      duration: 20 + Math.random() * 10,
    }));
  }, [count, colors]);

  const getClothShape = (shape, size, color) => {
    const baseStyle = {
      width: size,
      height: size,
      backgroundColor: color,
      position: 'absolute',
    };

    switch (shape) {
      case 'shirt':
        return {
          ...baseStyle,
          clipPath: 'polygon(25% 0%, 75% 0%, 85% 25%, 85% 100%, 15% 100%, 15% 25%)',
        };
      case 'pants':
        return {
          ...baseStyle,
          clipPath: 'polygon(30% 0%, 70% 0%, 65% 60%, 75% 100%, 60% 100%, 50% 70%, 40% 100%, 25% 100%, 35% 60%)',
        };
      case 'sock':
        return {
          ...baseStyle,
          borderRadius: '40% 40% 60% 60%',
          transform: 'rotate(45deg)',
        };
      case 'dress':
        return {
          ...baseStyle,
          clipPath: 'polygon(40% 0%, 60% 0%, 80% 100%, 20% 100%)',
        };
      default:
        return {
          ...baseStyle,
          borderRadius: '20%',
        };
    }
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: -1,
        opacity: 0.3,
      }}
    >
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          initial={{
            x: `${particle.x}vw`,
            y: '110vh',
            rotate: particle.rotation,
            scale: 0,
          }}
          animate={{
            y: '-10vh',
            rotate: [
              particle.rotation,
              particle.rotation + 180,
              particle.rotation + 360,
            ],
            scale: [0, 1, 1, 0],
            x: [
              `${particle.x}vw`,
              `${particle.x + Math.sin(particle.id) * 15}vw`,
              `${particle.x - Math.cos(particle.id) * 10}vw`,
            ],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: 'easeInOut',
          }}
          style={getClothShape(particle.shape, particle.size, particle.color)}
        />
      ))}
    </Box>
  );
};

// 🌊 Washing Machine Water Waves
export const WaterWaves = ({ opacity = 0.05, color }) => {
  const theme = useTheme();
  const waveColor = color || theme.palette.primary.main;

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        width: '100%',
        height: '200px',
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: -1,
      }}
    >
      {[1, 2, 3].map((wave) => (
        <motion.div
          key={wave}
          animate={{
            x: ['0%', '100%'],
          }}
          transition={{
            duration: 8 + wave * 2,
            repeat: Infinity,
            ease: 'linear',
          }}
          style={{
            position: 'absolute',
            bottom: 0,
            left: '-100%',
            width: '200%',
            height: `${60 + wave * 20}px`,
            background: `linear-gradient(90deg, 
              transparent, 
              ${waveColor}${Math.floor(opacity * 255).toString(16)}, 
              transparent
            )`,
            borderRadius: '50%',
            transform: `translateY(${wave * 10}px)`,
          }}
        />
      ))}
    </Box>
  );
};

// ✨ Sparkle Effects
export const SparkleEffect = ({ 
  count = 20, 
  size = 4, 
  colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#FECA57'] 
}) => {
  const sparkles = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      size: Math.random() * size + 2,
      x: Math.random() * 100,
      y: Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 5,
      duration: 3 + Math.random() * 2,
    }));
  }, [count, size, colors]);

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: -1,
      }}
    >
      {sparkles.map((sparkle) => (
        <motion.div
          key={sparkle.id}
          initial={{
            x: `${sparkle.x}vw`,
            y: `${sparkle.y}vh`,
            scale: 0,
            opacity: 0,
            rotate: 0,
          }}
          animate={{
            scale: [0, 1.5, 0],
            opacity: [0, 1, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: sparkle.duration,
            repeat: Infinity,
            delay: sparkle.delay,
            ease: 'easeInOut',
          }}
          style={{
            position: 'absolute',
            width: sparkle.size,
            height: sparkle.size,
            backgroundColor: sparkle.color,
            clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
          }}
        />
      ))}
    </Box>
  );
};

// 🎭 Interactive Background with Mouse Following
export const InteractiveParticles = ({ count = 8 }) => {
  const theme = useTheme();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const newParticles = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 8 + 4,
      speed: Math.random() * 0.5 + 0.1,
    }));
    setParticles(newParticles);
  }, [count]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: -1,
      }}
    >
      {particles.map((particle) => {
        const dx = mousePosition.x - particle.x;
        const dy = mousePosition.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDistance = 200;
        
        return (
          <motion.div
            key={particle.id}
            animate={{
              x: particle.x + (distance < maxDistance ? dx * 0.1 : 0),
              y: particle.y + (distance < maxDistance ? dy * 0.1 : 0),
              scale: distance < maxDistance ? 1.5 : 1,
              opacity: distance < maxDistance ? 0.8 : 0.3,
            }}
            transition={{
              duration: 0.3,
              ease: 'easeOut',
            }}
            style={{
              position: 'absolute',
              width: particle.size,
              height: particle.size,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${theme.palette.primary.main}60, transparent)`,
            }}
          />
        );
      })}
    </Box>
  );
};

// 🎯 Main Animated Background Component
export const AnimatedBackground = ({ 
  variant = 'bubbles',
  intensity = 'medium',
  interactive = false 
}) => {
  const getIntensityConfig = () => {
    switch (intensity) {
      case 'low':
        return { count: 8, opacity: 0.05, speed: 'slow' };
      case 'high':
        return { count: 25, opacity: 0.15, speed: 'fast' };
      case 'medium':
      default:
        return { count: 15, opacity: 0.1, speed: 'medium' };
    }
  };

  const config = getIntensityConfig();

  const renderBackground = () => {
    switch (variant) {
      case 'bubbles':
        return <FloatingBubbles {...config} />;
      case 'clothes':
        return <ClothParticles count={config.count} />;
      case 'waves':
        return <WaterWaves opacity={config.opacity} />;
      case 'sparkles':
        return <SparkleEffect count={config.count} />;
      case 'mixed':
        return (
          <>
            <FloatingBubbles count={Math.floor(config.count * 0.6)} opacity={config.opacity * 0.7} />
            <ClothParticles count={Math.floor(config.count * 0.4)} />
            <SparkleEffect count={Math.floor(config.count * 0.3)} />
          </>
        );
      default:
        return <FloatingBubbles {...config} />;
    }
  };

  return (
    <>
      {renderBackground()}
      {interactive && <InteractiveParticles />}
    </>
  );
};

// 🚀 Scroll-based Parallax Background
export const ParallaxBackground = ({ children, speed = 0.5 }) => {
  const { scrollY } = useViewportScroll();
  const controls = useAnimation();

  useEffect(() => {
    const unsubscribe = scrollY.onChange((latest) => {
      controls.start({
        y: latest * speed,
        transition: { duration: 0 }
      });
    });

    return unsubscribe;
  }, [scrollY, controls, speed]);

  return (
    <motion.div
      animate={controls}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '120%',
        zIndex: -2,
      }}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedBackground;
