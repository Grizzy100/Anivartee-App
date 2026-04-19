import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

type UserRole = 'USER' | 'FACT_CHECKER';

interface RoleToggleProps {
  value: UserRole;
  onChange: (value: UserRole) => void;
}

export const RoleToggle: React.FC<RoleToggleProps> = ({ value, onChange }) => {
  const animatedValue = useRef(new Animated.Value(value === 'USER' ? 0 : 1)).current;

  useEffect(() => {
    Animated.spring(animatedValue, {
      toValue: value === 'USER' ? 0 : 1,
      useNativeDriver: false,
      friction: 8,
      tension: 40,
    }).start();
  }, [value]);

  const xPosition = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [4, 106],
  });

  return (
    <View style={styles.container}>
      <BlurView intensity={40} tint="dark" style={styles.track}>
        <View style={styles.labelsContainer}>
          <Pressable style={styles.labelArea} onPress={() => onChange('USER')}>
            <Text style={[styles.labelText, value === 'USER' ? styles.activeText : styles.inactiveText]}>
              User
            </Text>
          </Pressable>
          <Pressable style={styles.labelArea} onPress={() => onChange('FACT_CHECKER')}>
            <Text style={[styles.labelText, value === 'FACT_CHECKER' ? styles.activeText : styles.inactiveText]}>
              Checker
            </Text>
          </Pressable>
        </View>

        <Animated.View style={[styles.knob, { transform: [{ translateX: xPosition }] }]}>
          <LinearGradient
            colors={['#FFFFFF', '#DDE3EE']}
            style={styles.knobGradient}
          >
            <Text style={styles.knobText}>
              {value === 'USER' ? 'User' : 'Checker'}
            </Text>
          </LinearGradient>
        </Animated.View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 20,
  },
  track: {
    width: 210,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(20, 30, 50, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  labelsContainer: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    zIndex: 1,
  },
  labelArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelText: {
    fontSize: 14,
    fontWeight: '600',
  },
  inactiveText: {
    color: '#8EA2C6',
  },
  activeText: {
    color: 'transparent',
  },
  knob: {
    width: 100,
    height: 40,
    borderRadius: 20,
    position: 'absolute',
    left: 0,
    zIndex: 2,
    shadowColor: '#FFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 5,
  },
  knobGradient: {
    flex: 1,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  knobText: {
    color: '#1D2230',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
