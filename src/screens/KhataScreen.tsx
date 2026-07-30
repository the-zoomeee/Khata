import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { styles } from '../styles/globalStyles';
import { fmt, formatDate } from '../utils';
import { KhataEntry } from '../types';

type Props = {
  entries: KhataEntry[];
  onEdit: (reversedIndex: number) => void;
  onDelete: (reversedIndex: number) => void;
};

export default function KhataScreen({ entries, onEdit, onDelete }: Props) {
  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
      <Text style={styles.histTitle}>📒 Khata</Text>
      {entries.length === 0 ? (
        <Text style={styles.empty}>No entries yet.</Text>
      ) : (
        [...entries].reverse().map((e, idx) => (
          <View style={[styles.card, styles.kEntry]} key={idx}>
            <View style={styles.kHead}>
              <Text style={styles.kPrev}>{e.prev !== '' ? fmt(+e.prev) : ''}</Text>
              <Text style={styles.kDate}>{formatDate(e.ts)}</Text>
              <View style={styles.headerActions}>
                <TouchableOpacity style={styles.deleteIcon} onPress={() => onEdit(idx)}>
                  <Text style={styles.deleteIconText}>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteIcon} onPress={() => onDelete(idx)}>
                  <Text style={styles.deleteIconText}>🗑</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.kLines}>
              {e.pairs.map((p, i) => (
                <View style={styles.kLine} key={i}>
                  <Text style={styles.kAmt}>{fmt(+p.amt || 0)}</Text>
                  <Text style={styles.kName}>{p.name || ''}</Text>
                </View>
              ))}
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}