import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { colors } from '@/constants/theme';
import { fontFamily } from '@/constants/typography';

interface FormInputProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  multiline?: boolean;
  optional?: boolean;
  maxLength?: number;
}

export function FormInput({
  label,
  placeholder,
  value,
  onChangeText,
  multiline,
  optional,
  maxLength,
}: FormInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const isFilled = value.trim().length > 0;

  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>
          {label}
          {!optional && <Text style={styles.requiredAsterisk}> *</Text>}
        </Text>
        {multiline && maxLength ? (
          <Text style={styles.charCount}>
            {value.length}/{maxLength}
          </Text>
        ) : optional ? (
          <Text style={styles.optionalText}>Optional</Text>
        ) : null}
      </View>
      <TextInput
        style={[
          styles.input,
          multiline && styles.multilineInput,
          isFocused && styles.inputFocused,
          isFilled && !isFocused && styles.inputFilled,
        ]}
        placeholder={placeholder}
        placeholderTextColor={colors.onSurfaceVariant}
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        maxLength={maxLength}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontFamily: fontFamily.label,
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.onSurface,
  },
  requiredAsterisk: {
    color: colors.error,
    fontWeight: 'bold',
  },
  optionalText: {
    fontFamily: fontFamily.label,
    fontSize: 12,
    color: colors.onSurfaceVariant,
  },
  charCount: {
    fontFamily: fontFamily.label,
    fontSize: 12,
    color: colors.onSurfaceVariant,
  },
  input: {
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1.5,
    borderColor: colors.outlineVariant,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: fontFamily.body,
    fontSize: 16,
    color: colors.onSurface,
  },
  inputFocused: {
    borderColor: colors.primary,
    backgroundColor: '#ffffff',
  },
  inputFilled: {
    borderColor: colors.outlineVariant,
    backgroundColor: '#ffffff',
  },
  multilineInput: {
    height: 120,
    paddingTop: 16,
  },
});
