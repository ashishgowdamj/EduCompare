import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Modal, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';

const EditProfileScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, updateUser } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [dob, setDob] = useState(user?.dob || ''); // YYYY-MM-DD
  const [countryModalVisible, setCountryModalVisible] = useState(false);
  const [dobModalVisible, setDobModalVisible] = useState(false);
  const [country, setCountry] = useState<{ name: string; code: string }>({ name: 'India', code: '+91' });
  const [saving, setSaving] = useState(false);

  const countries = [
    { name: 'India', code: '+91', flag: '🇮🇳' },
    { name: 'United States', code: '+1', flag: '🇺🇸' },
    { name: 'United Kingdom', code: '+44', flag: '🇬🇧' },
    { name: 'Canada', code: '+1', flag: '🇨🇦' },
    { name: 'Australia', code: '+61', flag: '🇦🇺' },
    { name: 'United Arab Emirates', code: '+971', flag: '🇦🇪' },
  ];

  // DOB picker state
  const today = new Date();
  const initialDate = dob ? new Date(dob) : new Date(2000, 0, 1);
  const [selYear, setSelYear] = useState(initialDate.getFullYear());
  const [selMonth, setSelMonth] = useState(initialDate.getMonth() + 1);
  const [selDay, setSelDay] = useState(initialDate.getDate());
  const years = Array.from({ length: 70 }, (_, i) => today.getFullYear() - i); // last 70 years
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const daysInMonth = (y: number, m: number) => new Date(y, m, 0).getDate();
  const days = Array.from({ length: daysInMonth(selYear, selMonth) }, (_, i) => i + 1);

  const formatDOB = (y: number, m: number, d: number) => `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

  const onSave = async () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert('Missing info', 'Please enter your name and email');
      return;
    }
    // Basic E.164-like phone validation (digits only, 4-14 digits)
    const digits = phone.replace(/\D/g, '');
    if (digits.length > 0 && (digits.length < 4 || digits.length > 14)) {
      Alert.alert('Invalid phone number', 'Please enter a valid phone number.');
      return;
    }
    // Normalize DOB
    const finalDob = dob ? dob : '';
    setSaving(true);
    try {
      const phoneStored = digits ? `${country.code} ${digits}` : '';
      await updateUser({ name: name.trim(), email: email.trim(), phone: phoneStored, dob: finalDob.trim() });
      Alert.alert('Saved', 'Your profile has been updated.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e) {
      Alert.alert('Error', 'Could not update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.colors.icon.accent, '#1976D2']}
        style={[styles.header, { paddingTop: insets.top + 8 }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Edit Profile</Text>
            <Text style={styles.subtitle}>Update your basic info</Text>
          </View>
          <TouchableOpacity onPress={onSave} disabled={saving} style={styles.saveBtn}>
            <Ionicons name="checkmark" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Your name"
            value={name}
            onChangeText={setName}
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="you@example.com"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Contact</Text>
          <View style={styles.phoneRow}>
            <TouchableOpacity style={styles.countryBtn} onPress={() => setCountryModalVisible(v => !v)}>
              <Text style={styles.countryFlag}>{countries.find(c => c.code === country.code)?.flag || '🌐'}</Text>
              <Text style={styles.countryText}>{country.code}</Text>
              <Ionicons name="chevron-down" size={16} color="#6B7280" />
            </TouchableOpacity>
            <TextInput
              style={[styles.input, { flex: 1, marginLeft: 8 }]}
              placeholder="Phone number"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
          </View>
          {countryModalVisible && (
            <View style={styles.countryDropdown}>
              <ScrollView style={{ maxHeight: 220 }}>
                {countries.map((c) => (
                  <TouchableOpacity
                    key={c.name}
                    style={[styles.countryDropdownItem, c.code === country.code && styles.countryDropdownItemActive]}
                    onPress={() => { setCountry(c); setCountryModalVisible(false); }}
                  >
                    <Text style={styles.countryFlag}>{c.flag}</Text>
                    <Text style={styles.countryName}>{c.name}</Text>
                    <View style={{ flex: 1 }} />
                    <Text style={styles.countryCode}>{c.code}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Date of Birth</Text>
          <TouchableOpacity onPress={() => setDobModalVisible(true)}>
            <View style={[styles.input, styles.dobField]}> 
              <Text style={{ color: dob ? '#111827' : '#9CA3AF' }}>{dob || 'YYYY-MM-DD'}</Text>
              <Ionicons name="calendar" size={18} color="#6B7280" />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <TouchableOpacity style={[styles.primaryBtn, saving && { opacity: 0.7 }]} onPress={onSave} disabled={saving}>
        <Text style={styles.primaryBtnText}>{saving ? 'Saving...' : 'Save Changes'}</Text>
      </TouchableOpacity>

      {/* Country dropdown is inline below the phone field */}

      {/* DOB Picker Modal */}
      <Modal visible={dobModalVisible} transparent animationType="fade" onRequestClose={() => setDobModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Select Date of Birth</Text>
            <View style={styles.pickerRow}>
              <ScrollView style={styles.pickerColumn}>
                {years.map((y) => (
                  <TouchableOpacity key={y} style={[styles.pickerItem, selYear === y && styles.pickerItemSelected]} onPress={() => setSelYear(y)}>
                    <Text style={selYear === y ? styles.pickerTextActive : styles.pickerText}>{y}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <ScrollView style={styles.pickerColumn}>
                {months.map((m) => (
                  <TouchableOpacity key={m} style={[styles.pickerItem, selMonth === m && styles.pickerItemSelected]} onPress={() => setSelMonth(m)}>
                    <Text style={selMonth === m ? styles.pickerTextActive : styles.pickerText}>{String(m).padStart(2, '0')}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <ScrollView style={styles.pickerColumn}>
                {days.map((d) => (
                  <TouchableOpacity key={d} style={[styles.pickerItem, selDay === d && styles.pickerItemSelected]} onPress={() => setSelDay(d)}>
                    <Text style={selDay === d ? styles.pickerTextActive : styles.pickerText}>{String(d).padStart(2, '0')}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalBtnOutline} onPress={() => setDobModalVisible(false)}>
                <Text style={styles.modalBtnOutlineText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalBtn}
                onPress={() => { const v = formatDOB(selYear, selMonth, selDay); setDob(v); setDobModalVisible(false); }}
              >
                <Text style={styles.modalBtnText}>Set DOB</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FB' },
  header: { paddingHorizontal: 16, paddingBottom: 16, borderBottomLeftRadius: 16, borderBottomRightRadius: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  backBtn: { marginRight: 10 },
  title: { fontSize: 20, fontWeight: '800', color: '#fff' },
  subtitle: { fontSize: 12, color: 'rgba(255,255,255,0.9)', marginTop: 2 },
  saveBtn: { padding: 4 },
  content: { padding: 16, paddingBottom: 40 },
  inputGroup: { marginBottom: 14 },
  label: { fontSize: 13, color: '#6B7280', marginBottom: 6 },
  input: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: '#111827' },
  phoneRow: { flexDirection: 'row', alignItems: 'center' },
  countryBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', paddingHorizontal: 12, paddingVertical: 12 },
  countryFlag: { marginRight: 6, fontSize: 16 },
  countryText: { marginRight: 6, color: '#111827', fontWeight: '600' },
  countryDropdown: { marginTop: 8, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#fff', overflow: 'hidden' },
  countryDropdownItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  countryDropdownItemActive: { backgroundColor: '#F9FAFB' },
  dobField: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  primaryBtn: { position: 'absolute', left: 16, right: 16, bottom: 16, backgroundColor: theme.colors.icon.accent, borderRadius: 12, paddingVertical: 14, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalCard: { width: '100%', backgroundColor: '#fff', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#E5E7EB' },
  modalTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 12 },
  countryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  countryRowActive: { backgroundColor: '#F9FAFB' },
  countryName: { fontSize: 14, color: '#111827' },
  countryCode: { fontSize: 14, color: '#6B7280' },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 },
  modalBtn: { backgroundColor: theme.colors.icon.accent, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, marginLeft: 8 },
  modalBtnText: { color: '#fff', fontWeight: '700' },
  modalBtnOutline: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10 },
  modalBtnOutlineText: { color: '#111827', fontWeight: '600' },
  pickerRow: { flexDirection: 'row' },
  pickerColumn: { flex: 1, maxHeight: 220, marginHorizontal: 4 },
  pickerItem: { paddingVertical: 10, alignItems: 'center' },
  pickerItemSelected: { backgroundColor: '#F3F4F6', borderRadius: 8 },
  pickerText: { color: '#6B7280' },
  pickerTextActive: { color: '#111827', fontWeight: '700' },
});

export default EditProfileScreen;
