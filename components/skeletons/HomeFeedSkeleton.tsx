import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { SkeletonBase } from './SkeletonBase';

const GAP = 16;

export function HomeFeedSkeleton() {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <SkeletonBase width={118} height={14} borderRadius={4} style={styles.headerEyebrow} />
            <SkeletonBase width={172} height={24} borderRadius={4} />
          </View>
          <SkeletonBase width={40} height={40} borderRadius={20} />
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categories}
      >
        {Array.from({ length: 5 }).map((_, index) => (
          <SkeletonBase
            key={index}
            width={index === 0 ? 72 : 96}
            height={40}
            borderRadius={20}
            style={styles.categoryChip}
          />
        ))}
      </ScrollView>

      <View style={styles.feedContainer}>
        <View style={styles.masonryContainer}>
          <View style={styles.column}>
            {[0, 1, 2].map((index) => (
              <View key={`left-${index}`} style={styles.card}>
                <SkeletonBase
                  width="100%"
                  borderRadius={16}
                  style={styles.image}
                />
                <SkeletonBase width="78%" height={16} borderRadius={4} style={styles.title} />
                <SkeletonBase width="48%" height={14} borderRadius={4} />
              </View>
            ))}
          </View>

          <View style={styles.column}>
            {[0, 1, 2].map((index) => (
              <View key={`right-${index}`} style={styles.card}>
                <SkeletonBase
                  width="100%"
                  borderRadius={16}
                  style={styles.image}
                />
                <SkeletonBase width="72%" height={16} borderRadius={4} style={styles.title} />
                <SkeletonBase width="42%" height={14} borderRadius={4} />
              </View>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerEyebrow: {
    marginBottom: 8,
  },
  categories: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  categoryChip: {
    marginRight: 12,
  },
  feedContainer: {
    marginTop: 8,
    paddingHorizontal: 16,
  },
  masonryContainer: {
    flexDirection: 'row',
    gap: GAP,
  },
  column: {
    flex: 1,
    gap: GAP,
  },
  card: {
    width: '100%',
    marginBottom: 8,
  },
  image: {
    aspectRatio: 0.85,
  },
  title: {
    marginTop: 10,
    marginBottom: 6,
  },
});
