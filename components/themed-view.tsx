import { colors } from '@/constants/theme';
import { StyleSheet, View, type ViewProps } from 'react-native';

export function ThemedView({ style, ...rest }: ViewProps) {
  return <View style={[styles.root, style]} {...rest} />;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
