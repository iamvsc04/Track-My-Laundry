import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Paper,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
  Slider,
  Card,
  CardContent,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useTheme } from '@mui/material/styles';

// Import all our enhanced animation components
import {
  LaundryLoader,
  BasketLoader,
  WashingMachineLoader,
  FoldingClothesLoader,
  SoapBubblesLoader,
} from './LaundryLoaders';

import {
  AnimatedBackground,
  FloatingBubbles,
  ClothParticles,
  WaterWaves,
  SparkleEffect,
  InteractiveParticles,
} from './AnimatedBackground';

import {
  useScrollAnimation,
  useCounterAnimation,
  useTypingAnimation,
  useFeedbackAnimation,
  animationVariants,
  laundryAnimations,
} from '../../hooks/useAnimations';

import { ThemeToggleIcon } from '../ThemeToggle';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function AnimationDemo() {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [backgroundEnabled, setBackgroundEnabled] = useState(true);
  const [backgroundVariant, setBackgroundVariant] = useState('mixed');
  const [backgroundIntensity, setBackgroundIntensity] = useState('medium');
  const [loaderType, setLoaderType] = useState('washing');
  const [showFullScreenLoader, setShowFullScreenLoader] = useState(false);

  // Animation hooks
  const { controls: scrollControls, ref: scrollRef } = useScrollAnimation();
  const { playSuccess, playError, playPulse, controls: feedbackControls } = useFeedbackAnimation();
  const counterValue = useCounterAnimation(156, 2);
  const { displayText: typedText, reset: resetTyping } = useTypingAnimation(
    "Welcome to TrackMyLaundry! 🧺✨", 
    100
  );

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ minHeight: '100vh', position: 'relative', bgcolor: 'background.default' }}>
      {/* Background Effects */}
      {backgroundEnabled && (
        <AnimatedBackground
          variant={backgroundVariant}
          intensity={backgroundIntensity}
          interactive={true}
        />
      )}

      <Container maxWidth="lg" sx={{ py: 4, position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography variant="h3" component="h1" fontWeight={800}>
              🎭 TrackMyLaundry Animation Demo
            </Typography>
            <ThemeToggleIcon />
          </Box>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Paper sx={{ p: 3, mb: 4, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom>
              🎮 Animation Controls
            </Typography>
            <Grid container spacing={3} alignItems="center">
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={backgroundEnabled}
                      onChange={(e) => setBackgroundEnabled(e.target.checked)}
                    />
                  }
                  label="Background Effects"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Background Variant
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {['bubbles', 'clothes', 'waves', 'sparkles', 'mixed'].map((variant) => (
                    <Button
                      key={variant}
                      size="small"
                      variant={backgroundVariant === variant ? 'contained' : 'outlined'}
                      onClick={() => setBackgroundVariant(variant)}
                      sx={{ textTransform: 'capitalize' }}
                    >
                      {variant}
                    </Button>
                  ))}
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Intensity
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {['low', 'medium', 'high'].map((intensity) => (
                    <Button
                      key={intensity}
                      size="small"
                      variant={backgroundIntensity === intensity ? 'contained' : 'outlined'}
                      onClick={() => setBackgroundIntensity(intensity)}
                      sx={{ textTransform: 'capitalize' }}
                    >
                      {intensity}
                    </Button>
                  ))}
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Animation Tests
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
                  <Button size="small" onClick={playSuccess} variant="outlined" color="success">
                    Success ✅
                  </Button>
                  <Button size="small" onClick={playError} variant="outlined" color="error">
                    Error ❌
                  </Button>
                  <Button size="small" onClick={resetTyping} variant="outlined">
                    Reset Typing
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </motion.div>

        {/* Tabs */}
        <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="animation demo tabs">
            <Tab label="🧺 Loaders" />
            <Tab label="🎨 Backgrounds" />
            <Tab label="🎭 Animations" />
            <Tab label="📊 Stats Demo" />
          </Tabs>

          {/* Loaders Tab */}
          <TabPanel value={activeTab} index={0}>
            <Typography variant="h5" gutterBottom>
              Custom Laundry-Themed Loaders
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Loader Type:
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                {['basket', 'washing', 'folding', 'bubbles'].map((type) => (
                  <Button
                    key={type}
                    size="small"
                    variant={loaderType === type ? 'contained' : 'outlined'}
                    onClick={() => setLoaderType(type)}
                    sx={{ textTransform: 'capitalize' }}
                  >
                    {type}
                  </Button>
                ))}
              </Box>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setShowFullScreenLoader(true)}
                sx={{ mr: 2 }}
              >
                Show Fullscreen Loader
              </Button>
            </Box>

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" gutterBottom>
                      Basket Loader
                    </Typography>
                    <BasketLoader size={80} message="Loading..." />
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" gutterBottom>
                      Washing Machine
                    </Typography>
                    <WashingMachineLoader size={100} message="Washing..." />
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" gutterBottom>
                      Folding Clothes
                    </Typography>
                    <FoldingClothesLoader size={80} message="Processing..." />
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" gutterBottom>
                      Soap Bubbles
                    </Typography>
                    <SoapBubblesLoader size={60} message="Cleaning..." />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Backgrounds Tab */}
          <TabPanel value={activeTab} index={1}>
            <Typography variant="h5" gutterBottom>
              Animated Background Effects
            </Typography>
            
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Card sx={{ height: 200, position: 'relative', overflow: 'hidden' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Floating Bubbles
                    </Typography>
                    <FloatingBubbles count={10} size="random" opacity={0.3} speed="medium" />
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Card sx={{ height: 200, position: 'relative', overflow: 'hidden' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Cloth Particles
                    </Typography>
                    <ClothParticles count={8} />
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Card sx={{ height: 200, position: 'relative', overflow: 'hidden' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Water Waves
                    </Typography>
                    <WaterWaves opacity={0.1} />
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Card sx={{ height: 200, position: 'relative', overflow: 'hidden' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Sparkle Effect
                    </Typography>
                    <SparkleEffect count={15} size={4} />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Animations Tab */}
          <TabPanel value={activeTab} index={2}>
            <Typography variant="h5" gutterBottom>
              Animation Utilities Demo
            </Typography>
            
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <motion.div
                  ref={scrollRef}
                  initial="initial"
                  animate={scrollControls}
                  variants={animationVariants.slideInLeft}
                >
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Scroll-triggered Animation
                      </Typography>
                      <Typography variant="body2">
                        This card animates when it comes into view using the useScrollAnimation hook.
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
              
              <Grid size={{ xs: 12, md: 6 }}>
                <motion.div
                  animate={feedbackControls}
                >
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Feedback Animations
                      </Typography>
                      <Typography variant="body2" paragraph>
                        Test different feedback animations:
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Button size="small" onClick={playSuccess} variant="outlined" color="success">
                          Success
                        </Button>
                        <Button size="small" onClick={playError} variant="outlined" color="error">
                          Error
                        </Button>
                        <Button size="small" onClick={playPulse} variant="outlined">
                          Pulse
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 3 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Typing Animation
                  </Typography>
                  <Typography variant="h4" color="primary" sx={{ minHeight: 80 }}>
                    {typedText}
                  </Typography>
                  <Button onClick={resetTyping} variant="outlined" size="small">
                    Reset Animation
                  </Button>
                </CardContent>
              </Card>
            </Box>
          </TabPanel>

          {/* Stats Demo Tab */}
          <TabPanel value={activeTab} index={3}>
            <Typography variant="h5" gutterBottom>
              Animated Statistics Demo
            </Typography>
            
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <motion.div
                  whileHover={{ scale: 1.05, y: -4 }}
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: 16,
                    padding: 24,
                    color: 'white',
                    textAlign: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <Typography variant="h3" fontWeight={800}>
                    {counterValue}
                  </Typography>
                  <Typography variant="subtitle1">
                    Total Orders
                  </Typography>
                </motion.div>
              </Grid>
              
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <motion.div
                  whileHover={{ scale: 1.05, y: -4 }}
                  style={{
                    background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                    borderRadius: 16,
                    padding: 24,
                    color: 'white',
                    textAlign: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                    style={{ display: 'inline-block' }}
                  >
                    <Typography variant="h3" fontWeight={800}>
                      ⚡
                    </Typography>
                  </motion.div>
                  <Typography variant="subtitle1">
                    Active
                  </Typography>
                </motion.div>
              </Grid>
              
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <motion.div
                  whileHover={{ scale: 1.05, y: -4 }}
                  style={{
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    borderRadius: 16,
                    padding: 24,
                    color: 'white',
                    textAlign: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <Typography variant="h3" fontWeight={800}>
                      🎯
                    </Typography>
                  </motion.div>
                  <Typography variant="subtitle1">
                    Ready
                  </Typography>
                </motion.div>
              </Grid>
              
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <motion.div
                  whileHover={{ scale: 1.05, y: -4 }}
                  style={{
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                    borderRadius: 16,
                    padding: 24,
                    color: 'white',
                    textAlign: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <Typography variant="h3" fontWeight={800}>
                      💰
                    </Typography>
                  </motion.div>
                  <Typography variant="subtitle1">
                    Revenue
                  </Typography>
                </motion.div>
              </Grid>
            </Grid>
          </TabPanel>
        </Paper>

        {/* Usage Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Paper sx={{ p: 3, mt: 4, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom>
              🚀 How to Use These Components
            </Typography>
            
            <Typography variant="body1" paragraph>
              All these animation components are now ready to use in your TrackMyLaundry app:
            </Typography>
            
            <Box component="pre" sx={{ 
              bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100',
              p: 2, 
              borderRadius: 2,
              overflow: 'auto',
              fontSize: '0.875rem',
            }}>
{`// Import the components
import LaundryLoader from '../components/animations/LaundryLoaders';
import AnimatedBackground from '../components/animations/AnimatedBackground';
import { useCounterAnimation } from '../hooks/useAnimations';

// Use in your components
<LaundryLoader type="washing" size={120} message="Loading..." />
<AnimatedBackground variant="mixed" intensity="low" interactive />

// Use animation hooks
const count = useCounterAnimation(156, 2);
const { displayText } = useTypingAnimation("Hello World!", 50);`}
            </Box>
          </Paper>
        </motion.div>
      </Container>

      {/* Full Screen Loader Demo */}
      {showFullScreenLoader && (
        <LaundryLoader
          type={loaderType}
          size={120}
          message="This is a fullscreen loader demo!"
          fullScreen
        />
      )}
    </Box>
  );
}
