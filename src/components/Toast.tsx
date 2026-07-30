import React, { useEffect, useRef } from 'react';
import { Animated, Text, Platform } from 'react-native';
import { styles } from '../styles/globalStyles';

type ToastProps = { message: string; visible: boolean };

export default function Toast({ message, visible }: ToastProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(80)).current;
  const useNative = Platform.OS !== 'web';

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: visible ? 1 : 0,
      duration: 250,
      useNativeDriver: useNative,
    }).start();
    Animated.timing(translateY, {
      toValue: visible ? 0 : 80,
      duration: 250,
      useNativeDriver: useNative,
    }).start();
  }, [visible]);

  return (
    <Animated.View
      style={[
        styles.toast,
        {
          opacity,
          transform: [{ translateX: -60 }, { translateY }],
          pointerEvents: 'none',
        },
      ]}
    >
      <Text style={styles.toastText}>{message}</Text>
    </Animated.View>
  );
}