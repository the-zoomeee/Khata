import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { styles } from '../styles/globalStyles';
import { COLORS } from '../theme';

export type VcAccountValues = {
  name: string;
  day: string;
  month: string;
  year: string;
  opening: string;
};

type Props = {
  visible: boolean;
  title: string;
  submitLabel: string;
  initial: VcAccountValues;
  onCancel: () => void;
  onSave: (v: VcAccountValues) => void;
};

export default function VcAccountModal({
  visible, title, submitLabel, initial, onCancel, onSave,
}: Props) {
  const [v, setV] = useState<VcAccountValues>(initial);

  useEffect(() => {
    if (visible) setV(initial);
  }, [visible]);

  const set = (k: keyof VcAccountValues) => (text: string) =>
    setV(prev => ({ ...prev, [k]: text }));

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <ScrollView keyboardShouldPersistTaps="handled">
            <Text style={styles.modalTitle}>{title}</Text>

            <Text style={styles.settingsLabel}>Account name</Text>
            <TextInput
              style={[styles.field, { marginBottom: 14 }]}
              value={v.name}
              onChangeText={set('name')}
              placeholder="e.g. Ramesh VC"
              placeholderTextColor={COLORS.muted}
            />

            <Text style={styles.settingsLabel}>VC date</Text>
            <View style={[styles.row, { marginBottom: 14 }]}>
              <TextInput
                style={[styles.field, { flex: 1 }]}
                keyboardType="numeric"
                maxLength={2}
                placeholder="DD"
                value={v.day}
                onChangeText={set('day')}
                placeholderTextColor={COLORS.muted}
              />
              <TextInput
                style={[styles.field, { flex: 1 }]}
                keyboardType="numeric"
                maxLength={2}
                placeholder="MM"
                value={v.month}
                onChangeText={set('month')}
                placeholderTextColor={COLORS.muted}
              />
              <TextInput
                style={[styles.field, { flex: 1.4 }]}
                keyboardType="numeric"
                maxLength={4}
                placeholder="YYYY"
                value={v.year}
                onChangeText={set('year')}
                placeholderTextColor={COLORS.muted}
              />
            </View>

            <Text style={styles.settingsLabel}>Opening balance (optional)</Text>
            <TextInput
              style={[styles.field, { marginBottom: 14 }]}
              keyboardType="numeric"
              value={v.opening}
              onChangeText={set('opening')}
              placeholder="0"
              placeholderTextColor={COLORS.muted}
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={[styles.btn, styles.modalCancelBtn]} onPress={onCancel}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, { flex: 1 }]} onPress={() => onSave(v)}>
                <Text style={styles.btnText}>{submitLabel}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}