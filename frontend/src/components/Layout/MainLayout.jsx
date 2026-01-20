import React from 'react';
import { Box, Container, useTheme } from '@mui/material';
import Navbar from '../Navbar';
import AnimatedBackground from '../animations/AnimatedBackground';

const MainLayout = ({ children, maxWidth = "xl", disablePadding = false }) => {
  const theme = useTheme();

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: 'background.default',
      display: 'flex',
      flexDirection: 'column',
    }}>
      
      <Navbar />
      
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          position: 'relative', 
          zIndex: 1,
          pt: disablePadding ? 0 : 4,
          pb: disablePadding ? 0 : 8,
        }}
      >
        <Container maxWidth={maxWidth} disableGutters={disablePadding}>
          {children}
        </Container>
      </Box>
    </Box>
  );
};

export default MainLayout;
