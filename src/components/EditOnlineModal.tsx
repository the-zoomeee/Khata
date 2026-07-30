import React from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity } from 'react-native';
import { styles } from '../styles/globalStyles';
import { COLORS } from '../theme';

type Props = {
  visible: boolean;
  amt: string;
  desc: string;
  day: string;
  month: string;
  year: string;
  onChangeAmt: (v: string) => void;
  onChangeDesc: (v: string) => void;
  onChangeDay: (v: string) => void;
  onChangeMonth: (v: string) => void;
  onChangeYear: (v: string) => void;
  onCancel: () => void;
  onSave: () => void;
};

export default function EditOnlineModal({
  visible, amt, desc, day, month, year,
  onChangeAmt, onChangeDesc, onChangeDay, onChangeMonth, onChangeYear,
  onCancel, onSave,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>Edit Transaction</Text>

          <Text style={styles.settingsLabel}>Date</Text>
          <View style={[styles.row, { marginBottom: 14 }]}>
            <TextInput
              style={[styles.field, { flex: 1 }]}
              keyboardType="numeric"
              maxLength={2}
              placeholder="DD"
              value={day}
              onChangeText={onChangeDay}
              placeholderTextColor={COLORS.muted}
            />
            <TextInput
              style={[styles.field, { flex: 1 }]}
              keyboardType="numeric"
              maxLength={2}
              placeholder="MM"
              value={month}
              onChangeText={onChangeMonth}
              placeholderTextColor={COLORS.muted}
            />
            <TextInput
              style={[styles.field, { flex: 1.4 }]}
              keyboardType="numeric"
              maxLength={4}
              placeholder="YYYY"
              value={year}
              onChangeText={onChangeYear}
              placeholderTextColor={COLORS.muted}
            />
          </View>

          <TextInput
            style={[styles.field, { marginBottom: 14 }]}
            value={amt}
            onChangeText={onChangeAmt}
            placeholder="+1000 or -200"
            placeholderTextColor={COLORS.muted}
          />
          <TextInput
            style={[styles.field, { marginBottom: 14 }]}
            value={desc}
            onChangeText={onChangeDesc}
            placeholder="Description"
            placeholderTextColor={COLORS.muted}
          />
          <View style={styles.modalBtnRow}>
            <TouchableOpacity style={[styles.btn, styles.modalCancelBtn]} onPress={onCancel}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, { flex: 1 }]} onPress={onSave}>
              <Text style={styles.btnText}>Update</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}