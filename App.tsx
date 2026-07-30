import React, { useState, useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import LockScreen from './src/screens/LockScreen';
import ChangePasswordModal from './src/components/ChangePasswordModal';
import { hashPin, getStoredPinHash, savePinHash } from './src/storage';
import SwipePager from './src/components/SwipePager';
import { getDefaultDesc, saveDefaultDesc } from './src/storage';

import { styles } from './src/styles/globalStyles';
import { Pair, HomeData, KhataEntry, OnlineTx, TabKey } from './src/types';
import { STORAGE_KEYS, getStore, setStore, confirmAction } from './src/storage';

import Toast from './src/components/Toast';
import EditKhataModal from './src/components/EditKhataModal';
import EditOnlineModal from './src/components/EditOnlineModal';
import HomeScreen from './src/screens/HomeScreen';
import KhataScreen from './src/screens/KhataScreen';
import OnlineScreen from './src/screens/OnlineScreen';
import { Platform } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import * as DocumentPicker from 'expo-document-picker';
import { dateToParts, partsToTs } from './src/utils';

import { buildHtmlReport } from './src/utils';
import { BackupData } from './src/types';
import SettingsScreen from './src/screens/SettingsScreen';
SplashScreen.preventAutoHideAsync().catch(() => { });

export default function App() {
  const [tab, setTab] = useState<TabKey>('home');

  const [pinMode, setPinMode] = useState<'setup' | 'unlock' | null>(null);
  const [locked, setLocked] = useState(true);
  const [lockError, setLockError] = useState('');
  const [changePasswordVisible, setChangePasswordVisible] = useState(false);

  // home state
  const [prevAmount, setPrevAmount] = useState<string>('');
  const [pairs, setPairs] = useState<Pair[]>([
    { amt: '', name: '' },
    { amt: '', name: '' },
  ]);
  const [onlineInput, setOnlineInput] = useState<string>('');

  const [onlineDesc, setOnlineDesc] = useState('');
  const [defaultDesc, setDefaultDesc] = useState('Paytm');

  // edit online description
  const [editOnlineDesc, setEditOnlineDesc] = useState('');

  // data
  const [khataEntries, setKhataEntries] = useState<KhataEntry[]>([]);
  const [onlineTx, setOnlineTx] = useState<OnlineTx[]>([]);

  // toast
  const [toastMsg, setToastMsg] = useState<string>('');
  const [toastVisible, setToastVisible] = useState<boolean>(false);
  const toastTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const pagerRef = React.useRef<any>(null);
  const TAB_ORDER: TabKey[] = ['home', 'khata', 'online', 'settings'];

  function goToTab(t: TabKey) {
    const index = TAB_ORDER.indexOf(t);
    pagerRef.current?.setPage(index);
    setTab(t);
  }

  function onPageSelected(e: { nativeEvent: { position: number } }) {
    const index = e.nativeEvent.position;
    setTab(TAB_ORDER[index]);
  }

  // edit khata
  const [editKhataVisible, setEditKhataVisible] = useState(false);
  const [editKhataIndex, setEditKhataIndex] = useState<number | null>(null);
  const [editKhataPrev, setEditKhataPrev] = useState('');
  const [editKhataPairs, setEditKhataPairs] = useState<Pair[]>([]);
  // edit khata date
  const [editKhataDay, setEditKhataDay] = useState('');
  const [editKhataMonth, setEditKhataMonth] = useState('');
  const [editKhataYear, setEditKhataYear] = useState('');

  // edit online
  const [editOnlineVisible, setEditOnlineVisible] = useState(false);
  const [editOnlineIndex, setEditOnlineIndex] = useState<number | null>(null);
  const [editOnlineAmt, setEditOnlineAmt] = useState('');
  // edit online date
  const [editOnlineDay, setEditOnlineDay] = useState('');
  const [editOnlineMonth, setEditOnlineMonth] = useState('');
  const [editOnlineYear, setEditOnlineYear] = useState('');

  function showToast(msg: string) {
    setToastMsg(msg);
    setToastVisible(true);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastVisible(false), 1600);
  }

  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const home = await getStore<HomeData>(STORAGE_KEYS.home, { prev: '', pairs: [] });
        setPrevAmount(home.prev || '');
        if (home.pairs && home.pairs.length) setPairs(home.pairs);

        const khata = await getStore<KhataEntry[]>(STORAGE_KEYS.khata, []);
        setKhataEntries(khata);

        const online = await getStore<OnlineTx[]>(STORAGE_KEYS.online, []);
        setOnlineTx(online);

        const storedHash = await getStoredPinHash();
        setPinMode(storedHash ? 'unlock' : 'setup');

        const savedDefault = await getDefaultDesc();
        setDefaultDesc(savedDefault);
      } finally {
        setAppReady(true);
        await SplashScreen.hideAsync().catch(() => { });
      }
    })();
  }, []);

  if (!appReady) {
    return null;
  }

  if (locked && pinMode) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.app}>
          <LockScreen
            mode={pinMode}
            onSetupComplete={handlePinSetup}
            onUnlockAttempt={handleUnlockAttempt}
            error={lockError}
          />
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  // ---- home: pairs ----
  function addPair() {
    setPairs(prev => [...prev, { amt: '', name: '' }]);
  }
  function delPair() {
    setPairs(prev => (prev.length ? prev.slice(0, -1) : prev));
  }
  function updatePair(index: number, field: keyof Pair, value: string) {
    setPairs(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }

  async function handlePinSetup(pin: string) {
    const hash = await hashPin(pin);
    await savePinHash(hash);
    setLocked(false);
  }

  async function handleUnlockAttempt(pin: string) {
    const storedHash = await getStoredPinHash();
    const enteredHash = await hashPin(pin);
    if (storedHash === enteredHash) {
      setLockError('');
      setLocked(false);
    } else {
      setLockError('Incorrect PIN, try again');
    }
  }

  async function handleChangePassword(currentPin: string, newPin: string): Promise<boolean> {
    const storedHash = await getStoredPinHash();
    const currentHash = await hashPin(currentPin);
    if (storedHash !== currentHash) {
      return false;
    }
    const newHash = await hashPin(newPin);
    await savePinHash(newHash);
    setChangePasswordVisible(false);
    showToast('Password changed');
    return true;
  }

  async function saveHome() {
    const cleanedPairs = pairs.filter(p => p.amt !== '' || p.name !== '');
    await setStore<HomeData>(STORAGE_KEYS.home, { prev: prevAmount, pairs: cleanedPairs });

    if (prevAmount !== '' || cleanedPairs.length) {
      const entry: KhataEntry = { prev: prevAmount, pairs: cleanedPairs, ts: Date.now() };
      const updated = [...khataEntries, entry];
      setKhataEntries(updated);
      await setStore<KhataEntry[]>(STORAGE_KEYS.khata, updated);
    }

    setPrevAmount('');
    setPairs([{ amt: '', name: '' }, { amt: '', name: '' }]);
    await setStore<HomeData>(STORAGE_KEYS.home, { prev: '', pairs: [] });

    showToast('Saved');
  }

  // ---- online ----
  async function saveOnline() {
    const raw = onlineInput.trim();
    if (!raw) {
      showToast('Enter a value');
      return;
    }
    const parts = raw.split(',').map(s => s.trim()).filter(Boolean);
    const desc = onlineDesc.trim() || defaultDesc;
    const newTx = [...onlineTx];
    let added = 0;
    for (const p of parts) {
      const m = p.match(/^([+-])\s*(\d+(?:\.\d+)?)$/);
      if (!m) continue;
      const amt = parseFloat(m[2]) * (m[1] === '-' ? -1 : 1);
      newTx.push({ amt, ts: Date.now(), desc });
      added++;
    }
    if (!added) {
      showToast('Use +100 or -50 format');
      return;
    }
    setOnlineTx(newTx);
    await setStore<OnlineTx[]>(STORAGE_KEYS.online, newTx);
    setOnlineInput('');
    setOnlineDesc('');
    showToast(added + ' added');
  }

  // ---- delete khata ----
  function confirmDeleteKhata(reversedIndex: number) {
    confirmAction(
      'Delete entry?',
      'This khata entry will be permanently deleted.',
      () => deleteKhataEntry(reversedIndex)
    );
  }
  async function deleteKhataEntry(reversedIndex: number) {
    const actualIndex = khataEntries.length - 1 - reversedIndex;
    const updated = khataEntries.filter((_, i) => i !== actualIndex);
    setKhataEntries(updated);
    await setStore<KhataEntry[]>(STORAGE_KEYS.khata, updated);
    showToast('Deleted');
  }

  // ---- delete online ----
  function confirmDeleteOnline(reversedIndex: number) {
    confirmAction(
      'Delete transaction?',
      'This transaction will be permanently deleted.',
      () => deleteOnlineTx(reversedIndex)
    );
  }
  async function deleteOnlineTx(reversedIndex: number) {
    const actualIndex = onlineTx.length - 1 - reversedIndex;
    const updated = onlineTx.filter((_, i) => i !== actualIndex);
    setOnlineTx(updated);
    await setStore<OnlineTx[]>(STORAGE_KEYS.online, updated);
    showToast('Deleted');
  }

  // ---- edit khata ----
  function openEditKhata(reversedIndex: number) {
    const actualIndex = khataEntries.length - 1 - reversedIndex;
    const entry = khataEntries[actualIndex];
    setEditKhataIndex(actualIndex);
    setEditKhataPrev(entry.prev);
    setEditKhataPairs(entry.pairs.length ? entry.pairs : [{ amt: '', name: '' }]);

    const { day, month, year } = dateToParts(entry.ts);
    setEditKhataDay(day);
    setEditKhataMonth(month);
    setEditKhataYear(year);

    setEditKhataVisible(true);
  }

  function updateEditPair(index: number, field: keyof Pair, value: string) {
    setEditKhataPairs(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }
  function addEditPair() {
    setEditKhataPairs(prev => [...prev, { amt: '', name: '' }]);
  }

  function delEditPair() {
    setEditKhataPairs(prev => (prev.length > 1 ? prev.slice(0, -1) : prev));
  }

  async function handleSaveDefaultDesc() {
    const trimmed = defaultDesc.trim() || 'Paytm';
    setDefaultDesc(trimmed);
    await saveDefaultDesc(trimmed);
    showToast('Default saved');
  }

  async function saveEditKhata() {
    if (editKhataIndex === null) return;
    const cleanedPairs = editKhataPairs.filter(p => p.amt !== '' || p.name !== '');
    const updated = [...khataEntries];
    const currentTs = updated[editKhataIndex].ts;
    const newTs = partsToTs(editKhataDay, editKhataMonth, editKhataYear, currentTs);

    updated[editKhataIndex] = {
      ...updated[editKhataIndex],
      prev: editKhataPrev,
      pairs: cleanedPairs,
      ts: newTs,
    };
    setKhataEntries(updated);
    await setStore<KhataEntry[]>(STORAGE_KEYS.khata, updated);
    setEditKhataVisible(false);
    showToast('Updated');
  }
  // ---- edit online ----
  function openEditOnline(reversedIndex: number) {
    const actualIndex = onlineTx.length - 1 - reversedIndex;
    const tx = onlineTx[actualIndex];
    setEditOnlineIndex(actualIndex);
    setEditOnlineAmt((tx.amt >= 0 ? '+' : '') + tx.amt.toString());
    setEditOnlineDesc(tx.desc || '');

    const { day, month, year } = dateToParts(tx.ts);
    setEditOnlineDay(day);
    setEditOnlineMonth(month);
    setEditOnlineYear(year);

    setEditOnlineVisible(true);
  }

  async function saveEditOnline() {
    if (editOnlineIndex === null) return;
    const raw = editOnlineAmt.trim();
    const m = raw.match(/^([+-]?)\s*(\d+(?:\.\d+)?)$/);
    if (!m) {
      showToast('Use +100 or -50 format');
      return;
    }
    const amt = parseFloat(m[2]) * (m[1] === '-' ? -1 : 1);
    const desc = editOnlineDesc.trim() || defaultDesc;
    const updated = [...onlineTx];
    const currentTs = updated[editOnlineIndex].ts;
    const newTs = partsToTs(editOnlineDay, editOnlineMonth, editOnlineYear, currentTs);

    updated[editOnlineIndex] = { ...updated[editOnlineIndex], amt, ts: newTs, desc };
    setOnlineTx(updated);
    await setStore<OnlineTx[]>(STORAGE_KEYS.online, updated);
    setEditOnlineVisible(false);
    showToast('Updated');
  }

  // ---- Settings: Download PDF ----
  async function downloadPdf() {
    const html = buildHtmlReport(khataEntries, onlineTx);
    try {
      if (Platform.OS === 'web') {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(html);
          printWindow.document.close();
          printWindow.focus();
          setTimeout(() => printWindow.print(), 300);
        }
      } else {
        const { uri } = await Print.printToFileAsync({ html });
        await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Khata Report' });
      }
      showToast('PDF ready');
    } catch {
      showToast('Failed to generate PDF');
    }
  }

  // ---- Settings: Export Data ----
  async function exportData() {
    const data: BackupData = {
      home: { prev: prevAmount, pairs },
      khata: khataEntries,
      online: onlineTx,
    };
    const json = JSON.stringify(data, null, 2);
    const fileName = `khata-backup-${Date.now()}.json`;

    try {
      if (Platform.OS === 'web') {
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        const fileUri = FileSystem.documentDirectory + fileName;
        await FileSystem.writeAsStringAsync(fileUri, json, {
          encoding: FileSystem.EncodingType.UTF8,
        });
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/json',
          dialogTitle: 'Export Khata Data',
        });
      }
      showToast('Exported');
    } catch {
      showToast('Failed to export data');
    }
  }

  // ---- Settings: Load Data ----
  function loadData() {
    if (Platform.OS === 'web') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'application/json';
      input.onchange = (e: any) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => applyImportedData(reader.result as string);
        reader.readAsText(file);
      };
      input.click();
    } else {
      (async () => {
        try {
          const result = await DocumentPicker.getDocumentAsync({
            type: 'application/json',
            copyToCacheDirectory: true,
          });
          if (result.canceled || !result.assets?.length) return;
          const content = await FileSystem.readAsStringAsync(result.assets[0].uri);
          applyImportedData(content);
        } catch {
          showToast('Failed to load file');
        }
      })();
    }
  }

  async function applyImportedData(jsonString: string) {
    let parsed: BackupData;
    try {
      parsed = JSON.parse(jsonString);
    } catch {
      showToast('Invalid backup file');
      return;
    }

    confirmAction(
      'Load data?',
      'This will overwrite your current data with the backup file. Continue?',
      async () => {
        const homeData = parsed.home ?? { prev: '', pairs: [] };
        const khata = parsed.khata ?? [];
        const online = parsed.online ?? [];

        setPrevAmount(homeData.prev || '');
        setPairs(homeData.pairs?.length ? homeData.pairs : [{ amt: '', name: '' }, { amt: '', name: '' }]);
        setKhataEntries(khata);
        setOnlineTx(online);

        await setStore(STORAGE_KEYS.home, homeData);
        await setStore(STORAGE_KEYS.khata, khata);
        await setStore(STORAGE_KEYS.online, online);

        showToast('Data loaded');
      }
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.app}>
        {/* Tabs */}
        <View style={styles.tabs}>
          {TAB_ORDER.map(t => (
            <TouchableOpacity
              key={t}
              style={[styles.tab, tab === t && styles.tabActive]}
              onPress={() => goToTab(t)}
            >
              <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <SwipePager
          ref={pagerRef}
          initialPage={0}
          onPageSelected={onPageSelected}
        >
          <View key="home" style={{ flex: 1 }}>
            <HomeScreen
              prevAmount={prevAmount}
              pairs={pairs}
              onlineInput={onlineInput}
              onlineDesc={onlineDesc}
              defaultDesc={defaultDesc}
              setPrevAmount={setPrevAmount}
              updatePair={updatePair}
              addPair={addPair}
              delPair={delPair}
              saveHome={saveHome}
              setOnlineInput={setOnlineInput}
              setOnlineDesc={setOnlineDesc}
              saveOnline={saveOnline}
            />
          </View>

          <View key="khata" style={{ flex: 1 }}>
            <KhataScreen
              entries={khataEntries}
              onEdit={openEditKhata}
              onDelete={confirmDeleteKhata}
            />
          </View>

          <View key="online" style={{ flex: 1 }}>
            <OnlineScreen
              tx={onlineTx}
              onEdit={openEditOnline}
              onDelete={confirmDeleteOnline}
            />
          </View>

          <View key="settings" style={{ flex: 1 }}>
            <SettingsScreen
              onDownloadPdf={downloadPdf}
              onExportData={exportData}
              onLoadData={loadData}
              onChangePassword={() => setChangePasswordVisible(true)}
              defaultDesc={defaultDesc}
              onChangeDefaultDesc={setDefaultDesc}
              onSaveDefaultDesc={handleSaveDefaultDesc}
            />
          </View>
        </SwipePager>

        <EditKhataModal
          visible={editKhataVisible}
          prev={editKhataPrev}
          pairs={editKhataPairs}
          day={editKhataDay}
          month={editKhataMonth}
          year={editKhataYear}
          onChangePrev={setEditKhataPrev}
          onChangePair={updateEditPair}
          onChangeDay={setEditKhataDay}
          onChangeMonth={setEditKhataMonth}
          onChangeYear={setEditKhataYear}
          onAddPair={addEditPair}
          onDelPair={delEditPair}
          onCancel={() => setEditKhataVisible(false)}
          onSave={saveEditKhata}
        />

        <EditOnlineModal
          visible={editOnlineVisible}
          amt={editOnlineAmt}
          desc={editOnlineDesc}
          day={editOnlineDay}
          month={editOnlineMonth}
          year={editOnlineYear}
          onChangeAmt={setEditOnlineAmt}
          onChangeDesc={setEditOnlineDesc}
          onChangeDay={setEditOnlineDay}
          onChangeMonth={setEditOnlineMonth}
          onChangeYear={setEditOnlineYear}
          onCancel={() => setEditOnlineVisible(false)}
          onSave={saveEditOnline}
        />

        <ChangePasswordModal
          visible={changePasswordVisible}
          onCancel={() => setChangePasswordVisible(false)}
          onSave={handleChangePassword}
        />

        <Toast message={toastMsg} visible={toastVisible} />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}