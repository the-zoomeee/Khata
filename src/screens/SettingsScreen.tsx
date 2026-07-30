import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { styles } from '../styles/globalStyles';
import { COLORS } from '../theme';

type Props = {
  onDownloadPdf: () => void;
  onExportData: () => void;
  onLoadData: () => void;
  onChangePassword: () => void;
  defaultDesc: string;
  onChangeDefaultDesc: (v: string) => void;
  onSaveDefaultDesc: () => void;
};

export default function SettingsScreen({
  onDownloadPdf, onExportData, onLoadData, onChangePassword,
  defaultDesc, onChangeDefaultDesc, onSaveDefaultDesc,
}: Props) {
  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
      <Text style={styles.histTitle}>⚙️ Settings</Text>

      <View style={styles.card}>
        <Text style={styles.settingsLabel}>
          Default description for Online entries (used when left blank)
        </Text>
        <TextInput
          style={[styles.field, { marginBottom: 12 }]}
          value={defaultDesc}
          onChangeText={onChangeDefaultDesc}
          placeholder="e.g. Paytm"
          placeholderTextColor={COLORS.muted}
        />
        <TouchableOpacity style={styles.btn} onPress={onSaveDefaultDesc}>
          <Text style={styles.btnText}>Save Default</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.settingsLabel}>Download all your data as a PDF report</Text>
        <TouchableOpacity style={styles.btn} onPress={onDownloadPdf}>
          <Text style={styles.btnText}>Download PDF</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.settingsLabel}>Export your data as a backup file (JSON)</Text>
        <TouchableOpacity style={styles.btn} onPress={onExportData}>
          <Text style={styles.btnText}>Export Data</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.settingsLabel}>Load data from a backup file — this will overwrite current data</Text>
        <TouchableOpacity style={[styles.btn, styles.delBtn]} onPress={onLoadData}>
          <Text style={styles.btnText}>Load Data</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.settingsLabel}>Change your app PIN</Text>
        <TouchableOpacity style={styles.btn} onPress={onChangePassword}>
          <Text style={styles.btnText}>Change Password</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}