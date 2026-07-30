import React from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { styles } from '../styles/globalStyles';
import { COLORS } from '../theme';
import { Pair } from '../types';

type Props = {
  visible: boolean;
  prev: string;
  pairs: Pair[];
  day: string;
  month: string;
  year: string;
  onChangePrev: (v: string) => void;
  onChangePair: (index: number, field: keyof Pair, value: string) => void;
  onChangeDay: (v: string) => void;
  onChangeMonth: (v: string) => void;
  onChangeYear: (v: string) => void;
  onAddPair: () => void;
  onDelPair: () => void;
  onCancel: () => void;
  onSave: () => void;
};

export default function EditKhataModal({
  visible, prev, pairs, day, month, year,
  onChangePrev, onChangePair, onChangeDay, onChangeMonth, onChangeYear,
  onAddPair, onDelPair, onCancel, onSave,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <ScrollView keyboardShouldPersistTaps="handled">
            <Text style={styles.modalTitle}>Edit Khata Entry</Text>

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
              keyboardType="numeric"
              value={prev}
              onChangeText={onChangePrev}
              placeholder="Previous amount"
              placeholderTextColor={COLORS.muted}
            />
            {pairs.map((p, i) => (
              <View style={styles.row} key={i}>
                <TextInput
                  style={[styles.field, { flex: 1 }]}
                  keyboardType="numeric"
                  value={p.amt}
                  onChangeText={v => onChangePair(i, 'amt', v)}
                  placeholderTextColor={COLORS.muted}
                />
                <TextInput
                  style={[styles.field, { flex: 1 }]}
                  value={p.name}
                  onChangeText={v => onChangePair(i, 'name', v)}
                  placeholderTextColor={COLORS.muted}
                />
              </View>
            ))}
            <View style={styles.pairControls}>
              <TouchableOpacity style={[styles.addBtn, styles.delBtn]} onPress={onDelPair}>
                <Text style={styles.addBtnText}>−</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.addBtn} onPress={onAddPair}>
                <Text style={styles.addBtnText}>+</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={[styles.btn, styles.modalCancelBtn]} onPress={onCancel}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, { flex: 1 }]} onPress={onSave}>
                <Text style={styles.btnText}>Update</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}