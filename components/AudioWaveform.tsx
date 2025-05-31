import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated } from 'react-native';
import { usePlayerStore } from '@/store/playerStore';

interface AudioWaveformProps {
  color?: string;
  barCount?: number;
}

export const AudioWaveform: React.FC<AudioWaveformProps> = ({ 
  color = '#FFFFFF', 
  barCount = 5 
}) => {
  const { isPlaying } = usePlayerStore();
  const animations = useRef<Animated.Value[]>([]);
  
  // Initialize animations array
  useEffect(() => {
    animations.current = Array(barCount)
      .fill(0)
      .map(() => new Animated.Value(0.3));
  }, [barCount]);
  
  // Animate when playing changes
  useEffect(() => {
    if (isPlaying) {
      startAnimation();
    } else {
      stopAnimation();
    }
    
    return () => {
      animations.current.forEach(anim => anim.stopAnimation());
    };
  }, [isPlaying]);
  
  const startAnimation = () => {
    const createAnimation = (index: number) => {
      return Animated.sequence([
        Animated.timing(animations.current[index], {
          toValue: 0.8 + Math.random() * 0.2,
          duration: 300 + Math.random() * 500,
          useNativeDriver: false,
        }),
        Animated.timing(animations.current[index], {
          toValue: 0.3 + Math.random() * 0.2,
          duration: 300 + Math.random() * 500,
          useNativeDriver: false,
        }),
      ]);
    };
    
    const loopAnimations = () => {
      const animationsArray = animations.current.map((_, index) => 
        createAnimation(index)
      );
      
      Animated.stagger(100, animationsArray).start(loopAnimations);
    };
    
    loopAnimations();
  };
  
  const stopAnimation = () => {
    animations.current.forEach(anim => {
      anim.stopAnimation();
      Animated.timing(anim, {
        toValue: 0.3,
        duration: 300,
        useNativeDriver: false,
      }).start();
    });
  };
  
  return (
    <View style={styles.container}>
      {animations.current.map((anim, index) => (
        <Animated.View
          key={index}
          style={[
            styles.bar,
            {
              backgroundColor: color,
              height: anim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 30,
    width: 40,
  },
  bar: {
    width: 3,
    marginHorizontal: 1,
    borderRadius: 3,
  },
});