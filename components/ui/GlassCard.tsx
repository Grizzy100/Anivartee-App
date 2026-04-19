import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, style }) => {
  return (
    <View style={[styles.outerContainer, style]}>
      {/* Soft shadow for depth */}
      <View style={styles.shadowLayer} />
      
      <BlurView intensity={30} tint="dark" style={styles.blurContainer}>
        {/* Top gradient glow */}
        <LinearGradient
          colors={['rgba(255,255,255,0.08)', 'transparent']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 0.2 }}
          style={StyleSheet.absoluteFill}
        />
        
        <View style={styles.innerContent}>
          {children}
        </View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: 'rgba(10, 18, 34, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  shadowLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  blurContainer: {
    flex: 1,
  },
  innerContent: {
    padding: 24,
  },
});
