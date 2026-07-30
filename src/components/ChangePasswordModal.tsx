import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity } from 'react-native';
import { styles } from '../styles/globalStyles';
import { COLORS } from '../theme';

type Props = {
  visible: boolean;
  onCancel: () => void;
  onSave: (currentPin: string, newPin: string) => Promise<boolean>;
};

export default function ChangePasswordModal({ visible, onCancel, onSave }: Props) {
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');

  function reset() {
    setCurrentPin('');
    setNewPin('');
    setConfirmPin('');
    setError('');
  }

  async function handleSave() {
    setError('');
    if (newPin.length < 4) {
      setError('New PIN must be at least 4 digits');
      return;
    }
    if (newPin !== confirmPin) {
      setError('New PIN and confirmation do not match');
      return;
    }
    const ok = await onSave(currentPin, newPin);
    if (ok) {
      reset();
    } else {
      setError('Current PIN is incorrect');
    }
  }

  function handleCancel() {
    reset();
    onCancel();
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleCancel}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>Change Password</Text>

          <TextInput
            style={[styles.field, { marginBottom: 14 }]}
            keyboardType="number-pad"
            secureTextEntry
            maxLength={6}
            value={currentPin}
            onChangeText={setCurrentPin}
            placeholder="Current PIN"
            placeholderTextColor={COLORS.muted}
          />
          <TextInput
            style={[styles.field, { marginBottom: 14 }]}
            keyboardType="number-pad"
            secureTextEntry
            maxLength={6}
            value={newPin}
            onChangeText={setNewPin}
            placeholder="New PIN"
            placeholderTextColor={COLORS.muted}
          />
          <TextInput
            style={[styles.field, { marginBottom: 14 }]}
            keyboardType="number-pad"
            secureTextEntry
            maxLength={6}
            value={confirmPin}
            onChangeText={setConfirmPin}
            placeholder="Confirm new PIN"
            placeholderTextColor={COLORS.muted}
          />

          {error ? (
            <Text style={{ color: COLORS.red, marginBottom: 12 }}>{error}</Text>
          ) : null}

          <View style={styles.modalBtnRow}>
            <TouchableOpacity style={[styles.btn, styles.modalCancelBtn]} onPress={handleCancel}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, { flex: 1 }]} onPress={handleSave}>
              <Text style={styles.btnText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}