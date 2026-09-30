import React, { useState } from 'react';
import { View, TextInput, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/theme';
import { authScreenStyles as s } from '@/constants/auth-screen-styles';

interface PasswordInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  textContentType?: 'password' | 'newPassword';
}

export function PasswordInput({ value, onChangeText, placeholder, textContentType }: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View>
      <TextInput
        style={[s.input, { paddingRight: 48 }]}
        value={value}
        placeholder={placeholder || 'Enter password'}
        placeholderTextColor={colors.onSurfaceVariant}
        secureTextEntry={!showPassword}
        onChangeText={onChangeText}
        textContentType={textContentType}
        autoCapitalize="none"
      />
      <Pressable
        style={styles.eyeButton}
        onPress={() => setShowPassword(!showPassword)}
      >
        <Ionicons
          name={showPassword ? 'eye-off-outline' : 'eye-outline'}
          size={22}
          color={colors.onSurfaceVariant}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  eyeButton: {
    position: 'absolute',
    right: 14,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
});
