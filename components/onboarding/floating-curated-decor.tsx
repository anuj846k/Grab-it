import { colors } from '@/constants/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

/**
 * Floating glass cards over the onboarding hero — boards, links, filters, bookmarks.
 */
export function FloatingCuratedDecor() {
  return (
    <View
      style={styles.canvas}
      accessibilityRole="image"
      accessibilityLabel="Decorative cards for boards, links, filters, and saved picks"
    >
      {/* Boards / collections */}
      <View
        style={[styles.cardWrap, styles.posFolder, { transform: [{ rotate: '4deg' }] }]}
      >
        <View style={styles.cardGlass}>
          <MaterialIcons
            name="folder-special"
            size={28}
            color={colors.primary}
          />
        </View>
      </View>

      {/* Links from the web & social */}
      <View
        style={[styles.cardWrap, styles.posLink, { transform: [{ rotate: '-5deg' }] }]}
      >
        <View style={[styles.cardGlass, styles.cardGlassSm]}>
          <MaterialIcons name="link" size={24} color={colors.tertiary} />
        </View>
      </View>

      {/* Slice by source / filters */}
      <View
        style={[styles.cardWrap, styles.posTune, { transform: [{ rotate: '-3deg' }] }]}
      >
        <View style={[styles.cardGlass, styles.cardGlassSm]}>
          <MaterialIcons
            name="tune"
            size={24}
            color={colors.onSurfaceVariant}
          />
        </View>
      </View>

      {/* Saved picks / bookmarks */}
      <View
        style={[styles.cardWrap, styles.posBookmark, { transform: [{ rotate: '6deg' }] }]}
      >
        <View style={[styles.cardGlass, styles.cardGlassSm]}>
          <MaterialIcons name="bookmark" size={22} color={colors.link} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  canvas: {
    flex: 1,
    minHeight: 280,
    width: '100%',
  },
  cardWrap: {
    position: 'absolute',
  },
  posFolder: {
    right: 18,
    top: '10%',
    width: 120,
    minHeight: 120,
  },
  posLink: {
    left: 14,
    top: '34%',
    width: 100,
    minHeight: 100,
  },
  posTune: {
    left: 22,
    bottom: '22%',
    width: 96,
    minHeight: 96,
  },
  posBookmark: {
    right: 12,
    bottom: '14%',
    width: 92,
    minHeight: 92,
  },
  cardGlass: {
    padding: 20,
    borderRadius: 16,
    backgroundColor: 'rgba(22, 19, 20, 0.88)',
    borderWidth: 1,
    borderColor: 'rgba(92, 63, 64, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 32,
    elevation: 8,
  },
  cardGlassSm: {
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 14,
    backgroundColor: 'rgba(45, 41, 42, 0.72)',
    borderColor: 'rgba(92, 63, 64, 0.15)',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 10,
  },
});
