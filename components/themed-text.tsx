import { colors } from '@/constants/theme';
import { fontFamily, typography } from '@/constants/typography';
import { StyleSheet, Text, type TextProps } from 'react-native';

type ThemedTextProps = TextProps & {
  type?: 'title' | 'link' | 'default';
};

export function ThemedText({
  type = 'default',
  style,
  ...rest
}: ThemedTextProps) {
  return (
    <Text
      style={[
        styles.base,
        type === 'title' && styles.title,
        type === 'link' && styles.link,
        type === 'default' && styles.body,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    color: colors.onSurface,
  },
  body: {
    ...typography.bodyMd,
  },
  title: {
    ...typography.headlineMd,
    color: colors.onSurface,
  },
  link: {
    fontFamily: fontFamily.label,
    fontSize: typography.bodyMd.fontSize,
    lineHeight: typography.bodyMd.lineHeight,
    color: colors.primary,
  },
});
