import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import './LaundryLoaders.css';

// 🧺 Basket Loading Animation
export const BasketLoader = ({ size = 80, message = "Loading..." }) => {
  const theme = useTheme();
  
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        padding: 4,
      }}
    >
      <Box
        sx={{
          width: size,
          height: size,
          position: 'relative',
        }}
      >
        {/* Basket Container */}
        <motion.div
          className="basket-container"
          animate={{
            y: [0, -8, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            width: '100%',
            height: '100%',
            position: 'relative',
          }}
        >
          {/* Basket Base */}
          <Box
            sx={{
              width: '100%',
              height: '60%',
              backgroundColor: theme.palette.mode === 'dark' ? '#8B4513' : '#D2691E',
              borderRadius: '0 0 20px 20px',
              position: 'absolute',
              bottom: 0,
              border: `3px solid ${theme.palette.mode === 'dark' ? '#654321' : '#A0522D'}`,
              '&::before': {
                content: '""',
                position: 'absolute',
                top: '20%',
                left: '10%',
                right: '10%',
                height: '60%',
                background: `repeating-linear-gradient(
                  45deg,
                  transparent,
                  transparent 3px,
                  ${theme.palette.mode === 'dark' ? '#654321' : '#A0522D'} 3px,
                  ${theme.palette.mode === 'dark' ? '#654321' : '#A0522D'} 6px
                )`,
                borderRadius: '10px',
              },
            }}
          />
          
          {/* Handles */}
          <Box
            sx={{
              position: 'absolute',
              top: '35%',
              left: '-10px',
              width: '15px',
              height: '20px',
              border: `3px solid ${theme.palette.mode === 'dark' ? '#654321' : '#A0522D'}`,
              borderRadius: '20px 0 0 20px',
              borderRight: 'none',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              top: '35%',
              right: '-10px',
              width: '15px',
              height: '20px',
              border: `3px solid ${theme.palette.mode === 'dark' ? '#654321' : '#A0522D'}`,
              borderRadius: '0 20px 20px 0',
              borderLeft: 'none',
            }}
          />
          
          {/* Floating Clothes */}
          {[...Array(3)].map((_, index) => (
            <motion.div
              key={index}
              initial={{ y: 10, opacity: 0 }}
              animate={{
                y: [-10, -20, -15, -25, -10],
                opacity: [0.7, 1, 0.8, 1, 0.7],
                rotate: [0, 5, -3, 8, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: index * 0.5,
                ease: "easeInOut",
              }}
              style={{
                position: 'absolute',
                top: `${20 + index * 15}%`,
                left: `${20 + index * 20}%`,
                width: '15px',
                height: '10px',
                backgroundColor: ['#FF6B6B', '#4ECDC4', '#45B7D1'][index],
                borderRadius: '3px',
                transform: 'rotate(15deg)',
              }}
            />
          ))}
        </motion.div>
      </Box>
      
      {message && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Typography variant="body2" color="text.secondary" textAlign="center">
            {message}
          </Typography>
        </motion.div>
      )}
    </Box>
  );
};

// 🌀 Washing Machine Loader
export const WashingMachineLoader = ({ size = 100, message = "Washing..." }) => {
  const theme = useTheme();
  
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        padding: 4,
      }}
    >
      <Box
        sx={{
          width: size,
          height: size,
          position: 'relative',
        }}
      >
        {/* Washing Machine Body */}
        <Box
          sx={{
            width: '100%',
            height: '100%',
            backgroundColor: theme.palette.mode === 'dark' ? '#424242' : '#F5F5F5',
            borderRadius: '12px',
            border: `3px solid ${theme.palette.divider}`,
            position: 'relative',
            boxShadow: `0 8px 32px ${theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.1)'}`,
          }}
        >
          {/* Control Panel */}
          <Box
            sx={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              display: 'flex',
              gap: '4px',
            }}
          >
            {[...Array(3)].map((_, index) => (
              <motion.div
                key={index}
                animate={{
                  backgroundColor: [
                    theme.palette.error.main,
                    theme.palette.warning.main,
                    theme.palette.success.main,
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: index * 0.3,
                }}
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: theme.palette.grey[400],
                }}
              />
            ))}
          </Box>
          
          {/* Washing Machine Door */}
          <Box
            sx={{
              position: 'absolute',
              top: '20%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '70%',
              height: '70%',
              border: `4px solid ${theme.palette.mode === 'dark' ? '#616161' : '#BDBDBD'}`,
              borderRadius: '50%',
              backgroundColor: theme.palette.mode === 'dark' ? '#303030' : '#FFFFFF',
              overflow: 'hidden',
            }}
          >
            {/* Water Effect */}
            <motion.div
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear",
              }}
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '40%',
                background: `linear-gradient(45deg, 
                  transparent, 
                  ${theme.palette.primary.main}20, 
                  ${theme.palette.primary.main}40, 
                  ${theme.palette.primary.main}20, 
                  transparent
                )`,
                backgroundSize: '200% 100%',
              }}
            />
            
            {/* Spinning Clothes */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear",
              }}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '80%',
                height: '80%',
              }}
            >
              {[...Array(4)].map((_, index) => (
                <motion.div
                  key={index}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: '12px',
                    height: '8px',
                    backgroundColor: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'][index],
                    borderRadius: '2px',
                    transformOrigin: '0 0',
                    transform: `rotate(${index * 90}deg) translate(${size * 0.2}px, -4px)`,
                  }}
                />
              ))}
            </motion.div>
          </Box>
        </Box>
      </Box>
      
      {message && (
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <Typography variant="body2" color="text.secondary" textAlign="center">
            {message}
          </Typography>
        </motion.div>
      )}
    </Box>
  );
};

// 👔 Folding Clothes Animation
export const FoldingClothesLoader = ({ size = 80, message = "Processing..." }) => {
  const theme = useTheme();
  
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        padding: 4,
      }}
    >
      <Box
        sx={{
          width: size,
          height: size,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Folding Animation */}
        <motion.div
          style={{
            position: 'relative',
            width: '60px',
            height: '40px',
          }}
        >
          {/* Main Cloth */}
          <motion.div
            animate={{
              scaleX: [1, 0.3, 0.6, 1],
              scaleY: [1, 1.2, 0.8, 1],
              rotateY: [0, 180, 0, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: '#4ECDC4',
              borderRadius: '8px',
              position: 'absolute',
              top: 0,
              left: 0,
              transformStyle: 'preserve-3d',
            }}
          />
          
          {/* Folding Lines */}
          <motion.div
            animate={{
              opacity: [0, 1, 1, 0],
              scaleX: [0, 1, 1, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              times: [0, 0.3, 0.7, 1],
            }}
            style={{
              position: 'absolute',
              top: '50%',
              left: 0,
              right: 0,
              height: '2px',
              backgroundColor: theme.palette.divider,
              transform: 'translateY(-50%)',
            }}
          />
          
          {/* Hands Animation */}
          {[...Array(2)].map((_, index) => (
            <motion.div
              key={index}
              animate={{
                x: index === 0 ? [0, 15, 0] : [0, -15, 0],
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: index * 0.1,
              }}
              style={{
                position: 'absolute',
                top: '-10px',
                [index === 0 ? 'left' : 'right']: '-15px',
                width: '12px',
                height: '15px',
                backgroundColor: '#FFD93D',
                borderRadius: index === 0 ? '50% 0 50% 50%' : '0 50% 50% 50%',
                transform: `rotate(${index === 0 ? '45' : '-45'}deg)`,
              }}
            />
          ))}
          
          {/* Sparkles */}
          {[...Array(3)].map((_, index) => (
            <motion.div
              key={index}
              animate={{
                scale: [0, 1.2, 0],
                opacity: [0, 1, 0],
                rotate: [0, 180],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: index * 0.7,
              }}
              style={{
                position: 'absolute',
                top: `${20 + index * 20}%`,
                left: `${80 + index * 10}%`,
                width: '6px',
                height: '6px',
                backgroundColor: '#FFD700',
                clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
              }}
            />
          ))}
        </motion.div>
      </Box>
      
      {message && (
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.8, repeat: Infinity }}
        >
          <Typography variant="body2" color="text.secondary" textAlign="center">
            {message}
          </Typography>
        </motion.div>
      )}
    </Box>
  );
};

// 🫧 Soap Bubbles Loader
export const SoapBubblesLoader = ({ size = 60, message = "Cleaning..." }) => {
  const theme = useTheme();
  
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        padding: 4,
      }}
    >
      <Box
        sx={{
          width: size,
          height: size,
          position: 'relative',
        }}
      >
        {[...Array(6)].map((_, index) => {
          const bubbleSize = [12, 8, 15, 6, 10, 9][index];
          const positions = [
            { top: '20%', left: '30%' },
            { top: '40%', left: '60%' },
            { top: '60%', left: '20%' },
            { top: '15%', left: '70%' },
            { top: '70%', left: '50%' },
            { top: '45%', left: '15%' },
          ];
          
          return (
            <motion.div
              key={index}
              animate={{
                y: [0, -10, -5, -15, 0],
                scale: [0.8, 1.2, 1, 1.1, 0.8],
                opacity: [0.6, 1, 0.8, 1, 0.6],
              }}
              transition={{
                duration: 3 + index * 0.5,
                repeat: Infinity,
                delay: index * 0.3,
                ease: "easeInOut",
              }}
              style={{
                position: 'absolute',
                ...positions[index],
                width: bubbleSize,
                height: bubbleSize,
                borderRadius: '50%',
                background: `radial-gradient(circle at 30% 30%, 
                  rgba(255,255,255,0.8), 
                  ${theme.palette.primary.main}40, 
                  ${theme.palette.primary.main}60
                )`,
                border: `1px solid ${theme.palette.primary.main}30`,
                boxShadow: `inset 0 0 10px ${theme.palette.primary.main}20`,
              }}
            />
          );
        })}
      </Box>
      
      {message && (
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2.2, repeat: Infinity }}
        >
          <Typography variant="body2" color="text.secondary" textAlign="center">
            {message}
          </Typography>
        </motion.div>
      )}
    </Box>
  );
};

// 🎯 Main Loader Component with different types
export const LaundryLoader = ({ 
  type = 'basket', 
  size = 80, 
  message,
  fullScreen = false 
}) => {
  const theme = useTheme();
  
  const getLoader = () => {
    switch (type) {
      case 'washing':
        return <WashingMachineLoader size={size} message={message} />;
      case 'folding':
        return <FoldingClothesLoader size={size} message={message} />;
      case 'bubbles':
        return <SoapBubblesLoader size={size} message={message} />;
      case 'basket':
      default:
        return <BasketLoader size={size} message={message} />;
    }
  };

  if (fullScreen) {
    return (
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: theme.palette.mode === 'dark' 
            ? 'rgba(0,0,0,0.8)' 
            : 'rgba(255,255,255,0.8)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
        }}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {getLoader()}
        </motion.div>
      </Box>
    );
  }

  return getLoader();
};

export default LaundryLoader;
