import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Box, Typography, Button, useTheme } from '@mui/material';
import { ThemeToggleIcon } from '../components/ThemeToggle';
import { useTheme as useCustomTheme } from '../context/ThemeContext';

const typingText = "_Track Your Laundry with Smart Technology";

// Animated garment symbol component
const GarmentSymbol = ({ symbol, delay, position, size }) => {
  return (
    <motion.div
      style={{
        position: "absolute",
        fontSize: size,
        left: position.x,
        top: position.y,
        zIndex: 0,
        opacity: 0.6,
        filter: "blur(0.5px)",
      }}
      animate={{
        y: [0, -30, 0],
        rotate: [0, 360],
        scale: [1, 1.1, 1],
      }}
      transition={{
        duration: 8,
        delay: delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {symbol}
    </motion.div>
  );
};

// Dot pattern background component
const DotPattern = () => {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 0.1,
        background: "radial-gradient(circle, #3b82f6 1px, transparent 1px)",
        backgroundSize: "30px 30px",
        animation: "drift 20s linear infinite",
        zIndex: 0,
      }}
    />
  );
};

// Floating geometric shapes
const GeometricShape = ({ size, color, delay, position }) => {
  return (
    <motion.div
      style={{
        position: "absolute",
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${color}20, ${color}05)`,
        borderRadius: "12px",
        left: position.x,
        top: position.y,
        zIndex: 0,
      }}
      animate={{
        y: [0, -40, 0],
        rotate: [0, 180, 360],
        scale: [1, 1.2, 1],
      }}
      transition={{
        duration: 10,
        delay: delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
};

export default function Landing() {
  const [displayed, setDisplayed] = useState("");
  const [showButtons, setShowButtons] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const idx = useRef(0);
  const navigate = useNavigate();
  const theme = useTheme();
  const { themeMode } = useCustomTheme();

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (idx.current < typingText.length) {
      const timeout = setTimeout(() => {
        setDisplayed((prev) => prev + typingText.charAt(idx.current));
        idx.current += 1;
      }, 60);
      return () => clearTimeout(timeout);
    } else if (idx.current === typingText.length) {
      idx.current++;
      setTimeout(() => setShowButtons(true), 800);
    }
  }, [displayed]);

  const garmentSymbols = [
    { symbol: "👕", delay: 0, position: { x: "15%", y: "25%" }, size: "2rem" },
    {
      symbol: "👖",
      delay: 1,
      position: { x: "85%", y: "20%" },
      size: "2.5rem",
    },
    {
      symbol: "🧥",
      delay: 2,
      position: { x: "20%", y: "75%" },
      size: "2.2rem",
    },
    {
      symbol: "👗",
      delay: 3,
      position: { x: "80%", y: "70%" },
      size: "2.8rem",
    },
    {
      symbol: "🧦",
      delay: 4,
      position: { x: "10%", y: "60%" },
      size: "1.8rem",
    },
    {
      symbol: "👔",
      delay: 5,
      position: { x: "90%", y: "45%" },
      size: "2.3rem",
    },
    { symbol: "👚", delay: 6, position: { x: "5%", y: "40%" }, size: "2.1rem" },
    {
      symbol: "👖",
      delay: 7,
      position: { x: "75%", y: "85%" },
      size: "2.4rem",
    },
  ];

  // Geometric shapes for background
  const geometricShapes = [
    {
      size: "120px",
      color: "#3b82f6",
      delay: 0,
      position: { x: "8%", y: "15%" },
    },
    {
      size: "80px",
      color: "#10b981",
      delay: 2,
      position: { x: "88%", y: "25%" },
    },
    {
      size: "100px",
      color: "#f59e0b",
      delay: 4,
      position: { x: "12%", y: "80%" },
    },
    {
      size: "60px",
      color: "#ef4444",
      delay: 6,
      position: { x: "82%", y: "78%" },
    },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100vw",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: theme.palette.background.gradient,
        overflow: "hidden",
        position: "relative",
        fontFamily: theme.typography.fontFamily,
        color: theme.palette.text.primary,
      }}
    >
      {/* Theme Toggle Button */}
      <Box
        sx={{
          position: 'absolute',
          top: 24,
          right: 24,
          zIndex: 10,
        }}
      >
        <ThemeToggleIcon size="large" />
      </Box>
      
      <style>{`
        
        @keyframes drift {
          0% { transform: translateX(0); }
          100% { transform: translateX(30px); }
        }
        
        @keyframes slideUp {
          0% { transform: translateY(60px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes slideDown {
          0% { transform: translateY(-60px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes fadeIn {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes scaleIn {
          0% { transform: scale(0.8); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        
        .main-title {
          font-family: ${theme.typography.fontFamily};
          font-weight: 800;
          font-size: clamp(2.5rem, 8vw, 4.5rem);
          color: ${theme.palette.text.primary};
          margin: 0 0 32px 0;
          text-align: center;
          letter-spacing: -2px;
          line-height: 1.1;
          animation: slideDown 1s ease-out 0.2s both;
        }
        
        .subtitle {
          font-family: 'JetBrains Mono', monospace;
          font-weight: 500;
          font-size: clamp(1rem, 3vw, 1.3rem);
          color: ${theme.palette.text.secondary};
          margin: 0 0 64px 0;
          text-align: center;
          letter-spacing: 0.5px;
          min-height: 50px;
          border-right: 2px solid ${theme.palette.primary.main};
          padding-right: 8px;
          animation: slideUp 1s ease-out 0.4s both;
        }
        
        .button-container {
          display: flex;
          gap: 24px;
          flex-direction: row;
          align-items: center;
          animation: fadeIn 1s ease-out 0.6s both;
        }
        
        .btn-primary {
          background: ${theme.palette.mode === 'dark' 
            ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
            : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`};
          color: white;
          border: none;
          padding: 16px 40px;
          font-size: 1.1rem;
          font-weight: 600;
          border-radius: 12px;
          font-family: ${theme.typography.fontFamily};
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 20px ${theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.4)' : 'rgba(59, 130, 246, 0.25)'};
          position: relative;
          overflow: hidden;
        }
        
        .btn-primary::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: left 0.5s;
        }
        
        .btn-primary:hover::before {
          left: 100%;
        }
        
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(59, 130, 246, 0.35);
        }
        
        .btn-secondary {
          background: ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'white'};
          color: ${theme.palette.primary.main};
          border: 2px solid ${theme.palette.primary.main};
          padding: 16px 40px;
          font-size: 1.1rem;
          font-weight: 600;
          border-radius: 12px;
          font-family: ${theme.typography.fontFamily};
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 20px ${theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(59, 130, 246, 0.1)'};
          position: relative;
          overflow: hidden;
        }
        
        .btn-secondary::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.1), transparent);
          transition: left 0.5s;
        }
        
        .btn-secondary:hover::before {
          left: 100%;
        }
        
        .btn-secondary:hover {
          transform: translateY(-2px);
          background: #f8fafc;
          box-shadow: 0 8px 30px rgba(59, 130, 246, 0.2);
        }
        
        .main-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          z-index: 2;
          position: relative;
          max-width: 900px;
          padding: 40px 20px;
          text-align: center;
        }
        
        .logo-container {
          margin-bottom: 40px;
          animation: scaleIn 1s ease-out 0.1s both;
        }
        
        .logo {
          width: 120px;
          height: 120px;
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 3rem;
          color: white;
          box-shadow: 0 8px 32px rgba(59, 130, 246, 0.3);
          margin: 0 auto 24px;
        }
        
        .feature-highlights {
          margin-top: 80px;
          display: flex;
          gap: 40px;
          flex-wrap: wrap;
          justify-content: center;
          opacity: showButtons ? 1 : 0;
          transform: showButtons ? "translateY(0)" : "translateY(30px)";
          transition: all 1s ease-out 0.3s;
        }
        
        .feature-item {
          display: flex;
          align-items: center;
          gap: 12px;
          color: ${theme.palette.text.secondary};
          font-size: 0.95rem;
          font-weight: 500;
        }
        
        .feature-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.2rem;
        }
        
        @media (max-width: 768px) {
          .button-container {
            flex-direction: column;
            gap: 16px;
          }
          
          .btn-primary, .btn-secondary {
            width: 100%;
            max-width: 280px;
          }
          
          .feature-highlights {
            flex-direction: column;
            gap: 20px;
            margin-top: 60px;
          }
          
          .logo {
            width: 100px;
            height: 100px;
            font-size: 2.5rem;
          }
        }
        
        @media (max-width: 480px) {
          .main-title {
            font-size: clamp(2rem, 10vw, 3rem);
          }
          
          .subtitle {
            font-size: clamp(0.9rem, 4vw, 1.1rem);
          }
          
          .logo {
            width: 80px;
            height: 80px;
            font-size: 2rem;
          }
        }
      `}</style>

      {/* Dot pattern background */}
      <DotPattern />

      {/* Geometric shapes */}
      {geometricShapes.map((shape, index) => (
        <GeometricShape
          key={index}
          size={shape.size}
          color={shape.color}
          delay={shape.delay}
          position={shape.position}
        />
      ))}

      {/* Animated garment symbols */}
      {garmentSymbols.map((garment, index) => (
        <GarmentSymbol
          key={index}
          symbol={garment.symbol}
          delay={garment.delay}
          position={garment.position}
          size={garment.size}
        />
      ))}

      {/* Main content */}
      <div className="main-container">
        {/* Logo */}
        <div className="logo-container">
          <div className="logo">🧺</div>
        </div>

        <h1 className="main-title">TrackMyLaundry</h1>
        <h2 className="subtitle">{displayed}</h2>

        <div
          className="button-container"
          style={{
            opacity: showButtons ? 1 : 0,
            transform: showButtons ? "translateY(0)" : "translateY(20px)",
            transition: "all 0.8s ease-out",
          }}
        >
          <button className="btn-primary" onClick={() => navigate("/register")}>
            Get Started
          </button>
          <button className="btn-secondary" onClick={() => navigate("/login")}>
            Sign In
          </button>
        </div>

        {/* Feature highlights */}
        <div
          className="feature-highlights"
          style={{
            opacity: showButtons ? 1 : 0,
            transform: showButtons ? "translateY(0)" : "translateY(30px)",
            transition: "all 1s ease-out 0.3s",
          }}
        >
          <div className="feature-item">
            <div
              className="feature-icon"
              style={{
                background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
              }}
            >
              📱
            </div>
            Smart Tracking
          </div>

          <div className="feature-item">
            <div
              className="feature-icon"
              style={{
                background: "linear-gradient(135deg, #10b981, #059669)",
              }}
            >
              ⚡
            </div>
            Real-time Updates
          </div>

          <div className="feature-item">
            <div
              className="feature-icon"
              style={{
                background: "linear-gradient(135deg, #f59e0b, #d97706)",
              }}
            >
              🔒
            </div>
            Secure & Reliable
          </div>
        </div>
      </div>
    </Box>
  );
}
