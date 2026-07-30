import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { styles } from '../styles/globalStyles';
import { COLORS } from '../theme';

type Props = {
  mode: 'setup' | 'unlock';
  onSetupComplete: (pin: string) => void;
  onUnlockAttempt: (pin: string) => void;
  error: string;
};

export default function LockScreen({ mode, onSetupComplete, onUnlockAttempt, error }: Props) {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  function handleSubmit() {
    if (mode === 'setup') {
      if (pin.length < 4) return;
      if (pin !== confirmPin) return;
      onSetupComplete(pin);
    } else {
      if (pin.length < 4) return;
      onUnlockAttempt(pin);
    }
  }

  return (
    <View style={[styles.app, { justifyContent: 'center' }]}>
      <View style={styles.card}>
        <Text style={[styles.modalTitle, { textAlign: 'center', fontSize: 22 }]}>
          {mode === 'setup' ? '🔒 Set a PIN' : '🔒 Enter PIN'}
        </Text>
        <Text style={[styles.settingsLabel, { textAlign: 'center', marginBottom: 20 }]}>
          {mode === 'setup'
            ? 'Protect your data with a 4-6 digit PIN'
            : 'Enter your PIN to continue'}
        </Text>

        <TextInput
          style={[styles.field, { marginBottom: 14, textAlign: 'center', fontSize: 22, letterSpacing: 8 }]}
          keyboardType="number-pad"
          secureTextEntry
          maxLength={6}
          value={pin}
          onChangeText={setPin}
          placeholder="••••"
          placeholderTextColor={COLORS.muted}
          autoFocus
        />

        {mode === 'setup' && (
          <TextInput
            style={[styles.field, { marginBottom: 14, textAlign: 'center', fontSize: 22, letterSpacing: 8 }]}
            keyboardType="number-pad"
            secureTextEntry
            maxLength={6}
            value={confirmPin}
            onChangeText={setConfirmPin}
            placeholder="Confirm PIN"
            placeholderTextColor={COLORS.muted}
          />
        )}

        {error ? (
          <Text style={{ color: COLORS.red, textAlign: 'center', marginBottom: 12 }}>{error}</Text>
        ) : null}

        <TouchableOpacity style={styles.btn} onPress={handleSubmit}>
          <Text style={styles.btnText}>{mode === 'setup' ? 'Set PIN' : 'Unlock'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}