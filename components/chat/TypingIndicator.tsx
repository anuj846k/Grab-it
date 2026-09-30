import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { colors } from '@/constants/theme';

/**
 * Three bouncing dots typing indicator — animates in when visible.
 */
export function TypingIndicator({ visible }: { visible: boolean }) {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;
  const containerOpacity = useRef(new Animated.Value(0)).current;
  const [mounted, setMounted] = React.useState(visible);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      // Fade in container
      Animated.timing(containerOpacity, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();

      // Staggered infinite bounce
      const bounce = (dot: Animated.Value, delay: number) =>
        Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(dot, {
              toValue: -6,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(dot, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.delay(300),
          ]),
        );

      const a1 = bounce(dot1, 0);
      const a2 = bounce(dot2, 150);
      const a3 = bounce(dot3, 300);

      a1.start();
      a2.start();
      a3.start();

      return () => {
        a1.stop();
        a2.stop();
        a3.stop();
        dot1.setValue(0);
        dot2.setValue(0);
        dot3.setValue(0);
      };
    } else {
      Animated.timing(containerOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start(() => setMounted(false));
    }
  }, [visible, containerOpacity, dot1, dot2, dot3]);

  if (!mounted) return null;

  return (
    <Animated.View style={[styles.row, { opacity: containerOpacity }]}>
      <View style={styles.bubble}>
        {[dot1, dot2, dot3].map((dot, i) => (
          <Animated.View
            key={i}
            style={[styles.dot, { transform: [{ translateY: dot }] }]}
          />
        ))}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  bubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.surfaceContainerHigh,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.onSurfaceVariant,
  },
});
