import React, { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/constants/theme';
import { fontFamily } from '@/constants/typography';

export interface AppAlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

export interface AppAlertOptions {
  cancelable?: boolean;
}

interface AlertState {
  visible: boolean;
  title: string;
  message?: string;
  buttons: AppAlertButton[];
  cancelable: boolean;
}

const initialState: AlertState = {
  visible: false,
  title: '',
  buttons: [],
  cancelable: true,
};

type ShowAlertFn = (
  title: string,
  message?: string,
  buttons?: AppAlertButton[],
  options?: AppAlertOptions,
) => void;

let showAlert: ShowAlertFn | null = null;

// In-app popup that replaces React Native's native Alert.alert (a system
// dialog) with a themed in-app modal, same call signature.
export const AppAlert = {
  alert(
    title: string,
    message?: string,
    buttons?: AppAlertButton[],
    options?: AppAlertOptions,
  ) {
    showAlert?.(title, message, buttons, options);
  },
};

export function AppAlertProvider() {
  const [state, setState] = useState<AlertState>(initialState);

  useEffect(() => {
    showAlert = (title, message, buttons, options) => {
      setState({
        visible: true,
        title,
        message,
        buttons: buttons && buttons.length > 0 ? buttons : [{ text: 'OK' }],
        cancelable: options?.cancelable ?? true,
      });
    };
    return () => {
      showAlert = null;
    };
  }, []);

  const close = () => setState((s) => ({ ...s, visible: false }));

  const handlePress = (button: AppAlertButton) => {
    close();
    button.onPress?.();
  };

  const handleBackdropPress = () => {
    if (state.cancelable) close();
  };

  const stacked = state.buttons.length > 2;

  return (
    <Modal
      visible={state.visible}
      transparent
      animationType='fade'
      onRequestClose={handleBackdropPress}
      statusBarTranslucent
    >
      <Pressable style={styles.backdrop} onPress={handleBackdropPress}>
        <Pressable style={styles.card} onPress={() => {}}>
          <Text style={styles.title}>{state.title}</Text>
          {state.message ? (
            <Text style={styles.message}>{state.message}</Text>
          ) : null}

          <View style={stacked ? styles.buttonsColumn : styles.buttonsRow}>
            {state.buttons.map((button, index) => (
              <Pressable
                key={`${button.text}-${index}`}
                onPress={() => handlePress(button)}
                style={({ pressed }) => [
                  styles.button,
                  stacked ? styles.buttonStacked : styles.buttonInline,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text
                  style={[
                    styles.buttonText,
                    button.style === 'cancel' && styles.cancelText,
                    button.style === 'destructive' && styles.destructiveText,
                  ]}
                >
                  {button.text}
                </Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(20, 27, 43, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 20,
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  title: {
    fontFamily: fontFamily.headlineSm,
    fontSize: 18,
    color: colors.onSurface,
    textAlign: 'center',
  },
  message: {
    fontFamily: fontFamily.body,
    fontSize: 14,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  buttonsRow: {
    flexDirection: 'row',
    marginTop: 20,
    marginHorizontal: -8,
  },
  buttonsColumn: {
    marginTop: 20,
  },
  button: {
    paddingVertical: 14,
  },
  buttonInline: {
    flex: 1,
    marginHorizontal: 8,
    alignItems: 'center',
  },
  buttonStacked: {
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.outlineVariant,
  },
  buttonPressed: {
    opacity: 0.6,
  },
  buttonText: {
    fontFamily: fontFamily.label,
    fontSize: 15,
    color: colors.primary,
  },
  cancelText: {
    color: colors.onSurfaceVariant,
  },
  destructiveText: {
    color: colors.error,
  },
});
