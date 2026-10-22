import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  KeyboardAvoidingView, Platform, StyleSheet,
} from 'react-native';
import { styles } from '../styles/globalStyles';
import { COLORS } from '../theme';
import { VcAccount, VcTx } from '../types';
import { fmt, formatDate, dateToParts, partsToTs } from '../utils';
import { STORAGE_KEYS, getStore, setStore, confirmAction } from '../storage';
import Toast from '../components/Toast';
import EditOnlineModal from '../components/EditOnlineModal';
import VcAccountModal, { VcAccountValues } from '../components/VcAccountModal';

const balanceOf = (a: VcAccount) => a.opening + a.tx.reduce((s, t) => s + t.amt, 0);
const newId = () => Date.now().toString() + Math.random().toString(36).slice(2, 6);

// real calendar date -> timestamp, or null if invalid
function validDateTs(day: string, month: string, year: string): number | null {
  const d = parseInt(day, 10), m = parseInt(month, 10), y = parseInt(year, 10);
  if (!d || !m || !y || y < 1000) return null;
  const dt = new Date(y, m - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== d) return null;
  return dt.getTime();
}

const EMPTY: VcAccountValues = { name: '', day: '', month: '', year: '', opening: '' };

export default function VcScreen() {
  const [accounts, setAccounts] = useState<VcAccount[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // toast
  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  function showToast(msg: string) {
    setToastMsg(msg);
    setToastVisible(true);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastVisible(false), 1600);
  }

  // add/edit account modal
  const [accVisible, setAccVisible] = useState(false);
  const [accEditId, setAccEditId] = useState<string | null>(null);
  const [accInitial, setAccInitial] = useState<VcAccountValues>(EMPTY);

  // detail page: new entry
  const [amtInput, setAmtInput] = useState('');
  const [descInput, setDescInput] = useState('');

  // detail page: edit entry modal
  const [txVisible, setTxVisible] = useState(false);
  const [txIndex, setTxIndex] = useState<number | null>(null);
  const [txAmt, setTxAmt] = useState('');
  const [txDesc, setTxDesc] = useState('');
  const [txDay, setTxDay] = useState('');
  const [txMonth, setTxMonth] = useState('');
  const [txYear, setTxYear] = useState('');

  // load once
  useEffect(() => {
    (async () => {
      const saved = await getStore<VcAccount[]>(STORAGE_KEYS.vc, []);
      setAccounts(saved);
      setLoaded(true);
    })();
  }, []);

  // save on every change (only after the first load, so we never overwrite with [])
  useEffect(() => {
    if (loaded) setStore<VcAccount[]>(STORAGE_KEYS.vc, accounts);
  }, [accounts, loaded]);

  const account = selectedId ? accounts.find(a => a.id === selectedId) ?? null : null;

  function updateAccount(id: string, fn: (a: VcAccount) => VcAccount) {
    setAccounts(prev => prev.map(a => (a.id === id ? fn(a) : a)));
  }

  // ---------- accounts ----------
  function openAddAccount() {
    const p = dateToParts(Date.now());
    setAccInitial({ name: '', day: p.day, month: p.month, year: p.year, opening: '' });
    setAccEditId(null);
    setAccVisible(true);
  }

  function openEditAccount(a: VcAccount) {
    const p = dateToParts(a.vcDate);
    setAccInitial({
      name: a.name, day: p.day, month: p.month, year: p.year,
      opening: a.opening ? String(a.opening) : '',
    });
    setAccEditId(a.id);
    setAccVisible(true);
  }

  function handleSaveAccount(v: VcAccountValues) {
    const name = v.name.trim();
    if (!name) return showToast('Enter account name');
    const vcDate = validDateTs(v.day, v.month, v.year);
    if (vcDate === null) return showToast('Enter a valid VC date');
    const opening = v.opening.trim() === '' ? 0 : parseFloat(v.opening);
    if (isNaN(opening)) return showToast('Invalid opening balance');

    if (accEditId) {
      updateAccount(accEditId, a => ({ ...a, name, vcDate, opening }));
      showToast('Account updated');
    } else {
      setAccounts(prev => [...prev, { id: newId(), name, vcDate, opening, tx: [] }]);
      showToast('Account added');
    }
    setAccVisible(false);
  }

  function confirmDeleteAccount(a: VcAccount) {
    confirmAction('Delete account?', `"${a.name}" and all its entries will be permanently deleted.`, () => {
      setAccounts(prev => prev.filter(x => x.id !== a.id));
      if (selectedId === a.id) setSelectedId(null);
      showToast('Account deleted');
    });
  }

  // ---------- entries (same logic as Home -> Online) ----------
  function saveEntry() {
    if (!account) return;
    const raw = amtInput.trim();
    if (!raw) return showToast('Enter a value');
    const desc = descInput.trim() || 'VC';
    const now = Date.now();
    const added: VcTx[] = [];
    raw.split(',').map(s => s.trim()).filter(Boolean).forEach(p => {
      const m = p.match(/^([+-])\s*(\d+(?:\.\d+)?)$/);
      if (m) added.push({ amt: parseFloat(m[2]) * (m[1] === '-' ? -1 : 1), ts: now, desc });
    });
    if (!added.length) return showToast('Use +100 or -50 format');
    updateAccount(account.id, a => ({ ...a, tx: [...a.tx, ...added] }));
    setAmtInput('');
    setDescInput('');
    showToast(added.length + ' added');
  }

  function openEditEntry(i: number) {
    if (!account) return;
    const t = account.tx[i];
    const p = dateToParts(t.ts);
    setTxIndex(i);
    setTxAmt((t.amt >= 0 ? '+' : '') + t.amt.toString());
    setTxDesc(t.desc || '');
    setTxDay(p.day);
    setTxMonth(p.month);
    setTxYear(p.year);
    setTxVisible(true);
  }

  function saveEditEntry() {
    if (!account || txIndex === null) return;
    const m = txAmt.trim().match(/^([+-]?)\s*(\d+(?:\.\d+)?)$/);
    if (!m) return showToast('Use +100 or -50 format');
    const idx = txIndex;
    const amt = parseFloat(m[2]) * (m[1] === '-' ? -1 : 1);
    const desc = txDesc.trim() || 'VC';
    updateAccount(account.id, a => {
      const tx = [...a.tx];
      tx[idx] = { amt, desc, ts: partsToTs(txDay, txMonth, txYear, tx[idx].ts) };
      return { ...a, tx };
    });
    setTxVisible(false);
    showToast('Updated');
  }

  function confirmDeleteEntry(i: number) {
    if (!account) return;
    confirmAction('Delete entry?', 'This entry will be permanently deleted.', () => {
      updateAccount(account.id, a => ({ ...a, tx: a.tx.filter((_, k) => k !== i) }));
      showToast('Deleted');
    });
  }

  // ---------- shared pieces ----------
  const stats = (a: VcAccount) => {
    const bal = balanceOf(a);
    return (
      <View style={local.statsRow}>
        <View style={{ flex: 1 }}>
          <Text style={local.statLabel}>VC Date</Text>
          <Text style={local.statValue}>{formatDate(a.vcDate)}</Text>
        </View>
        <View style={{ flex: 1, alignItems: 'flex-end' }}>
          <Text style={local.statLabel}>Balance</Text>
          <Text style={[local.statValue, { color: bal >= 0 ? COLORS.green : COLORS.red }]}>
            {fmt(bal)}
          </Text>
        </View>
      </View>
    );
  };

  const overlays = (
    <>
      <VcAccountModal
        visible={accVisible}
        title={accEditId ? 'Edit Account' : 'New Account'}
        submitLabel={accEditId ? 'Update' : 'Add'}
        initial={accInitial}
        onCancel={() => setAccVisible(false)}
        onSave={handleSaveAccount}
      />
      <EditOnlineModal
        visible={txVisible}
        amt={txAmt}
        desc={txDesc}
        day={txDay}
        month={txMonth}
        year={txYear}
        onChangeAmt={setTxAmt}
        onChangeDesc={setTxDesc}
        onChangeDay={setTxDay}
        onChangeMonth={setTxMonth}
        onChangeYear={setTxYear}
        onCancel={() => setTxVisible(false)}
        onSave={saveEditEntry}
      />
      <Toast message={toastMsg} visible={toastVisible} />
    </>
  );

  // ===================== ACCOUNT DETAIL =====================
  if (account) {
    const rows = account.tx.map((t, i) => ({ t, i })).reverse();
    return (
      <View style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
        >
          <ScrollView contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
            <TouchableOpacity style={local.backBtn} onPress={() => setSelectedId(null)}>
              <Text style={local.backText}>← All accounts</Text>
            </TouchableOpacity>

            <View style={styles.card}>
              <View style={local.cardTop}>
                <Text style={local.accName} numberOfLines={2}>{account.name}</Text>
                <TouchableOpacity style={styles.deleteIcon} onPress={() => openEditAccount(account)}>
                  <Text style={styles.deleteIconText}>✏️</Text>
                </TouchableOpacity>
              </View>
              {stats(account)}
            </View>

            {/* input + button (same as Home) */}
            <View style={styles.card}>
              <View style={styles.amountBlock}>
                <Text style={styles.amountLabel}>Amount</Text>
                <TextInput
                  style={[styles.field, { flex: 1 }]}
                  value={amtInput}
                  onChangeText={setAmtInput}
                  placeholder="+1000, -200"
                  placeholderTextColor={COLORS.muted}
                />
              </View>
              <Text style={styles.hint}>Use + to add, - to deduct (e.g. +10000, -200)</Text>
              <TextInput
                style={[styles.field, { marginBottom: 12 }]}
                value={descInput}
                onChangeText={setDescInput}
                placeholder="Description (default: VC)"
                placeholderTextColor={COLORS.muted}
              />
              <TouchableOpacity style={styles.btn} onPress={saveEntry}>
                <Text style={styles.btnText}>Save</Text>
              </TouchableOpacity>
            </View>

            {/* history (same as Online) */}
            <Text style={styles.histTitle}>🕘 History</Text>
            {rows.length === 0 ? (
              <Text style={styles.empty}>No entries yet.</Text>
            ) : (
              rows.map(({ t, i }) => (
                <View style={styles.histItem} key={i}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.histAmt, t.amt >= 0 ? styles.pos : styles.neg]}>
                      {(t.amt >= 0 ? '+' : '-') + fmt(Math.abs(t.amt))}
                    </Text>
                    <Text style={styles.histDesc}>{t.desc || 'VC'}</Text>
                  </View>
                  <View style={styles.histRight}>
                    <Text style={styles.histDate}>{formatDate(t.ts)}</Text>
                    <TouchableOpacity style={styles.deleteIcon} onPress={() => openEditEntry(i)}>
                      <Text style={styles.deleteIconText}>✏️</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.deleteIcon} onPress={() => confirmDeleteEntry(i)}>
                      <Text style={styles.deleteIconText}>🗑</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        </KeyboardAvoidingView>
        {overlays}
      </View>
    );
  }

  // ===================== ACCOUNT LIST =====================
  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <TouchableOpacity style={[styles.btn, { marginBottom: 16 }]} onPress={openAddAccount}>
          <Text style={styles.btnText}>+ Add New Account</Text>
        </TouchableOpacity>

        {accounts.length === 0 ? (
          <Text style={styles.empty}>No VC accounts yet.</Text>
        ) : (
          [...accounts].reverse().map(a => (
            <TouchableOpacity
              key={a.id}
              activeOpacity={0.85}
              style={styles.card}
              onPress={() => setSelectedId(a.id)}
            >
              <View style={local.cardTop}>
                <Text style={local.accName} numberOfLines={1}>{a.name}</Text>
                <TouchableOpacity style={styles.deleteIcon} onPress={() => openEditAccount(a)}>
                  <Text style={styles.deleteIconText}>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteIcon} onPress={() => confirmDeleteAccount(a)}>
                  <Text style={styles.deleteIconText}>🗑</Text>
                </TouchableOpacity>
              </View>
              {stats(a)}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
      {overlays}
    </View>
  );
}

const local = StyleSheet.create({
  cardTop: { flexDirection: 'row', alignItems: 'center' },
  accName: { flex: 1, color: COLORS.text, fontSize: 24, fontWeight: '800', marginRight: 8 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
  statLabel: {
    color: COLORS.muted, fontSize: 11, letterSpacing: 1,
    textTransform: 'uppercase', marginBottom: 4,
  },
  statValue: { color: COLORS.text, fontSize: 22, fontWeight: '800' },
  backBtn: {
    alignSelf: 'flex-start', marginBottom: 12, paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 999, backgroundColor: COLORS.card2, borderWidth: 1, borderColor: COLORS.line,
  },
  backText: { color: COLORS.accent, fontWeight: '700', fontSize: 14 },
});