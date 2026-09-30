import React, { useState } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
  Animated,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/constants/theme';

interface ItemImageHeaderProps {
  imageUrls: string[];
  isFavorited?: boolean;
  onToggleFavorite?: () => void;
  onReport?: () => void;
}

export function ItemImageHeader({ imageUrls, isFavorited, onToggleFavorite, onReport }: ItemImageHeaderProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);
  const showPagination = imageUrls.length > 1;

  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const particleAnim = React.useRef(new Animated.Value(0)).current;
  const isFirstRender = React.useRef(true);

  React.useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (isFavorited) {
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.3,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 4,
            useNativeDriver: true,
          })
        ]),
        Animated.sequence([
          Animated.timing(particleAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(particleAnim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          })
        ])
      ]).start();
    } else {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 4,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [isFavorited, scaleAnim, particleAnim]);

  const handleScrollEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setActiveIndex(nextIndex);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScrollEnd}
      >
        {imageUrls.map((imageUrl, index) => (
          <Image
            key={`${imageUrl}-${index}`}
            source={imageUrl}
            style={[styles.image, { width }]}
            contentFit='cover'
            transition={200}
          />
        ))}
      </ScrollView>
      <Pressable 
        style={[styles.backButton, { top: insets.top + 16 }]} 
        onPress={() => router.back()}
      >
        <Ionicons name="chevron-back" size={24} color={colors.onSurface} />
      </Pressable>
      <Pressable 
        style={[styles.favoriteButton, { top: insets.top + 16 }]} 
        onPress={onToggleFavorite}
      >
        <View pointerEvents="none" style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }]}>
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i * 360) / 8;
            return (
              <Animated.View
                key={i}
                style={{
                  position: 'absolute',
                  width: 4,
                  height: 12,
                  borderRadius: 2,
                  backgroundColor: '#FF3B30',
                  opacity: particleAnim.interpolate({
                    inputRange: [0, 0.2, 0.8, 1],
                    outputRange: [0, 1, 1, 0]
                  }),
                  transform: [
                    { rotate: `${angle}deg` },
                    { 
                      translateY: particleAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-10, -28]
                      }) 
                    },
                    {
                      scale: particleAnim.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [0.5, 1, 0.2]
                      })
                    }
                  ]
                }}
              />
            );
          })}
        </View>
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <Ionicons 
            name={isFavorited ? "heart" : "heart-outline"} 
            size={24} 
            color={isFavorited ? '#FF3B30' : colors.onSurface} 
          />
        </Animated.View>
      </Pressable>
      {onReport && (
        <Pressable 
          style={[styles.reportButton, { top: insets.top + 16 }]} 
          onPress={onReport}
        >
          <Ionicons name="flag-outline" size={20} color={colors.onSurfaceVariant} />
        </Pressable>
      )}
      {showPagination && (
        <View style={styles.pagination}>
          {imageUrls.map((imageUrl, index) => (
            <View
              key={`${imageUrl}-dot-${index}`}
              style={[
                styles.dot,
                index === activeIndex && styles.activeDot,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 350,
    backgroundColor: colors.surfaceContainer,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
  },
  image: {
    height: 350,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  backButton: {
    position: 'absolute',
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  favoriteButton: {
    position: 'absolute',
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  reportButton: {
    position: 'absolute',
    right: 70,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  pagination: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
  },
  activeDot: {
    width: 18,
    backgroundColor: colors.primary,
  },
});
