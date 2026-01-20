import { useAnimation, useInView } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

// 🎯 Custom Animation Variants
export const animationVariants = {
  // Page transitions
  pageTransition: {
    initial: { opacity: 0, y: 20, scale: 0.98 },
    animate: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        duration: 0.4,
        ease: [0.4, 0.0, 0.2, 1], // Material Design easing
      }
    },
    exit: { 
      opacity: 0, 
      y: -20, 
      scale: 0.98,
      transition: {
        duration: 0.3,
        ease: [0.4, 0.0, 0.6, 1],
      }
    }
  },

  // Stagger children animation
  staggerContainer: {
    animate: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      }
    }
  },

  // Card hover animations
  cardHover: {
    initial: { y: 0, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' },
    hover: {
      y: -8,
      boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
      transition: {
        duration: 0.3,
        ease: 'easeOut'
      }
    }
  },

  // Button animations
  buttonPress: {
    initial: { scale: 1 },
    tap: { scale: 0.95 },
    hover: { scale: 1.05 }
  },

  // Slide in animations
  slideInLeft: {
    initial: { x: -100, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    transition: { duration: 0.6, ease: 'easeOut' }
  },

  slideInRight: {
    initial: { x: 100, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    transition: { duration: 0.6, ease: 'easeOut' }
  },

  slideInUp: {
    initial: { y: 50, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    transition: { duration: 0.5, ease: 'easeOut' }
  },

  // Fade animations
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.4 }
  },

  fadeInScale: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.5, ease: 'backOut' }
  },

  // Loading pulse
  pulse: {
    animate: {
      scale: [1, 1.05, 1],
      opacity: [0.7, 1, 0.7],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  },

  // Success animations
  success: {
    initial: { scale: 0, rotate: -180 },
    animate: { 
      scale: 1, 
      rotate: 0,
      transition: {
        type: 'spring',
        stiffness: 200,
        damping: 10
      }
    }
  },

  // Error shake
  error: {
    animate: {
      x: [0, -10, 10, -10, 10, 0],
      transition: { duration: 0.5 }
    }
  },

  // Notification slide
  notification: {
    initial: { x: 300, opacity: 0 },
    animate: { 
      x: 0, 
      opacity: 1,
      transition: { duration: 0.4, ease: 'easeOut' }
    },
    exit: { 
      x: 300, 
      opacity: 0,
      transition: { duration: 0.3, ease: 'easeIn' }
    }
  }
};

// 🎨 Animation Hooks

// Hook for scroll-triggered animations
export const useScrollAnimation = (threshold = 0.1, triggerOnce = true) => {
  const controls = useAnimation();
  const ref = useRef(null);
  const inView = useInView(ref, { threshold, triggerOnce });

  useEffect(() => {
    if (inView) {
      controls.start('animate');
    } else if (!triggerOnce) {
      controls.start('initial');
    }
  }, [controls, inView, triggerOnce]);

  return { controls, ref, inView };
};

// Hook for staggered animations
export const useStaggerAnimation = (delay = 0.1) => {
  const controls = useAnimation();

  const startAnimation = async (items) => {
    for (let i = 0; i < items; i++) {
      await controls.start('animate', { delay: i * delay });
    }
  };

  return { controls, startAnimation };
};

// Hook for mouse-based animations
export const useMouseAnimation = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const ref = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        setMousePosition({ x: x * 0.1, y: y * 0.1 });
      }
    };

    const handleMouseLeave = () => {
      setMousePosition({ x: 0, y: 0 });
    };

    const element = ref.current;
    if (element) {
      element.addEventListener('mousemove', handleMouseMove);
      element.addEventListener('mouseleave', handleMouseLeave);

      return () => {
        element.removeEventListener('mousemove', handleMouseMove);
        element.removeEventListener('mouseleave', handleMouseLeave);
      };
    }
  }, []);

  return { mousePosition, ref };
};

// Hook for loading state animations
export const useLoadingAnimation = (isLoading) => {
  const controls = useAnimation();

  useEffect(() => {
    if (isLoading) {
      controls.start({
        opacity: [1, 0.7, 1],
        scale: [1, 1.02, 1],
        transition: {
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut'
        }
      });
    } else {
      controls.stop();
      controls.set({ opacity: 1, scale: 1 });
    }
  }, [isLoading, controls]);

  return controls;
};

// Hook for success/error feedback animations
export const useFeedbackAnimation = () => {
  const controls = useAnimation();

  const playSuccess = () => {
    controls.start({
      scale: [1, 1.2, 1],
      rotate: [0, 15, -10, 0],
      transition: {
        duration: 0.6,
        ease: 'backOut'
      }
    });
  };

  const playError = () => {
    controls.start({
      x: [0, -10, 10, -10, 10, 0],
      transition: { duration: 0.5 }
    });
  };

  const playPulse = () => {
    controls.start({
      scale: [1, 1.1, 1],
      transition: {
        duration: 0.3,
        ease: 'easeOut'
      }
    });
  };

  return { controls, playSuccess, playError, playPulse };
};

// Hook for counter/number animations
export const useCounterAnimation = (end, duration = 2, start = 0) => {
  const [count, setCount] = useState(start);
  
  useEffect(() => {
    let startTime;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      
      // Easing function for smooth animation
      const easeOutExpo = 1 - Math.pow(2, -10 * progress);
      const currentCount = Math.floor(start + (end - start) * easeOutExpo);
      
      setCount(currentCount);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };
    
    requestAnimationFrame(animate);
  }, [end, duration, start]);

  return count;
};

// Hook for typing animation effect
export const useTypingAnimation = (text, speed = 50) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(currentIndex + 1);
      }, speed);

      return () => clearTimeout(timer);
    }
  }, [text, currentIndex, speed]);

  const reset = () => {
    setDisplayText('');
    setCurrentIndex(0);
  };

  return { displayText, isComplete: currentIndex === text.length, reset };
};

// Hook for scroll progress
export const useScrollProgress = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const updateScrollProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollTop / docHeight;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', updateScrollProgress);
    return () => window.removeEventListener('scroll', updateScrollProgress);
  }, []);

  return scrollProgress;
};

// Animation presets for specific use cases
export const laundryAnimations = {
  // Order card animations
  orderCard: {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3, ease: 'easeOut' }
    },
    hover: {
      y: -4,
      boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
      transition: { duration: 0.2 }
    }
  },

  // Status update animations
  statusUpdate: {
    initial: { scale: 1, backgroundColor: 'transparent' },
    animate: { 
      scale: [1, 1.05, 1],
      backgroundColor: ['transparent', '#4CAF5020', 'transparent'],
      transition: { duration: 0.8, ease: 'easeInOut' }
    }
  },

  // Loading basket animation
  basketBounce: {
    animate: {
      y: [0, -10, 0],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  },

  // Notification badge
  badgePop: {
    initial: { scale: 0 },
    animate: {
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 500,
        damping: 15
      }
    }
  }
};

// Utility functions for animations
export const createStaggerDelay = (index, baseDelay = 0.1) => {
  return index * baseDelay;
};

export const createBounceTransition = (duration = 0.6) => ({
  type: 'spring',
  stiffness: 400,
  damping: 10,
  duration
});

export const createSlideTransition = (direction = 'up', duration = 0.4) => {
  const directions = {
    up: { y: 50 },
    down: { y: -50 },
    left: { x: 50 },
    right: { x: -50 }
  };

  return {
    initial: { opacity: 0, ...directions[direction] },
    animate: { 
      opacity: 1, 
      x: 0, 
      y: 0,
      transition: { duration, ease: 'easeOut' }
    }
  };
};

export default {
  animationVariants,
  useScrollAnimation,
  useStaggerAnimation,
  useMouseAnimation,
  useLoadingAnimation,
  useFeedbackAnimation,
  useCounterAnimation,
  useTypingAnimation,
  useScrollProgress,
  laundryAnimations,
  createStaggerDelay,
  createBounceTransition,
  createSlideTransition
};
