import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { styles } from '../styles/globalStyles';
import { fmt, formatDate } from '../utils';
import { OnlineTx } from '../types';

type Props = {
  tx: OnlineTx[];
  onEdit: (reversedIndex: number) => void;
  onDelete: (reversedIndex: number) => void;
};

export default function OnlineScreen({ tx, onEdit, onDelete }: Props) {
  const total = tx.reduce((s, t) => s + t.amt, 0);

  return (
    <View style={{ flex: 1 }}>
      <View style={[styles.card, styles.totalCard]}>
        <Text style={styles.totalLabel}>TOTAL ONLINE</Text>
        <Text style={styles.totalValue}>{fmt(total)}</Text>
      </View>
      <Text style={styles.histTitle}>🕘 History</Text>
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        {tx.length === 0 ? (
          <Text style={styles.empty}>No transactions yet.</Text>
        ) : (
          [...tx].reverse().map((t, idx) => (
            <View style={styles.histItem} key={idx}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.histAmt, t.amt >= 0 ? styles.pos : styles.neg]}>
                  {(t.amt >= 0 ? '+' : '-') + fmt(Math.abs(t.amt))}
                </Text>
                <Text style={styles.histDesc}>{t.desc || 'Paytm'}</Text>
              </View>
              <View style={styles.histRight}>
                <Text style={styles.histDate}>{formatDate(t.ts)}</Text>
                <TouchableOpacity style={styles.deleteIcon} onPress={() => onEdit(idx)}>
                  <Text style={styles.deleteIconText}>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteIcon} onPress={() => onDelete(idx)}>
                  <Text style={styles.deleteIconText}>🗑</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}