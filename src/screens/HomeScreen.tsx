import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { styles } from '../styles/globalStyles';
import { COLORS } from '../theme';
import { Pair } from '../types';

type Props = {
  prevAmount: string;
  pairs: Pair[];
  onlineInput: string;
  onlineDesc: string;
  defaultDesc: string;
  setPrevAmount: (v: string) => void;
  updatePair: (index: number, field: keyof Pair, value: string) => void;
  addPair: () => void;
  delPair: () => void;
  saveHome: () => void;
  setOnlineInput: (v: string) => void;
  setOnlineDesc: (v: string) => void;
  saveOnline: () => void;
};

export default function HomeScreen({
  prevAmount, pairs, onlineInput, onlineDesc, defaultDesc, setPrevAmount, updatePair,
  addPair, delPair, saveHome, setOnlineInput, setOnlineDesc, saveOnline,
}: Props) {
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <TextInput
            style={[styles.field, styles.topInput]}
            keyboardType="numeric"
            value={prevAmount}
            onChangeText={setPrevAmount}
            placeholderTextColor={COLORS.muted}
          />
          <View style={styles.pairsWrap}>
            {pairs.map((p, i) => (
              <View style={styles.row} key={i}>
                <TextInput
                  style={[styles.field, { flex: 1 }]}
                  keyboardType="numeric"
                  value={p.amt}
                  onChangeText={v => updatePair(i, 'amt', v)}
                  placeholderTextColor={COLORS.muted}
                />
                <TextInput
                  style={[styles.field, { flex: 1 }]}
                  value={p.name}
                  onChangeText={v => updatePair(i, 'name', v)}
                  placeholderTextColor={COLORS.muted}
                />
              </View>
            ))}
          </View>
          <View style={styles.pairControls}>
            <TouchableOpacity style={[styles.addBtn, styles.delBtn]} onPress={delPair}>
              <Text style={styles.addBtnText}>−</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.addBtn} onPress={addPair}>
              <Text style={styles.addBtnText}>+</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.btn} onPress={saveHome}>
            <Text style={styles.btnText}>Save</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        <View style={styles.card}>
          <View style={styles.amountBlock}>
            <Text style={styles.amountLabel}>Amount</Text>
            <TextInput
              style={[styles.field, { flex: 1 }]}
              value={onlineInput}
              onChangeText={setOnlineInput}
              placeholder="+1000, -200"
              placeholderTextColor={COLORS.muted}
            />
          </View>
          <Text style={styles.hint}>Use + to add, - to deduct (e.g. +10000, -200)</Text>

          <TextInput
            style={[styles.field, { marginBottom: 12 }]}
            value={onlineDesc}
            onChangeText={setOnlineDesc}
            placeholder={`Description (default: ${defaultDesc})`}
            placeholderTextColor={COLORS.muted}
          />

          <TouchableOpacity style={styles.btn} onPress={saveOnline}>
            <Text style={styles.btnText}>Save</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}