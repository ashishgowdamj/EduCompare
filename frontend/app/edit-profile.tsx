import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Modal, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
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
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [country, setCountry] = useState<{ name: string; code: string }>({ name: 'India', code: '+91' });
  const [saving, setSaving] = useState(false);

  const countries = [
    { name: 'India', code: '+91', flag: '🇮🇳' },
    { name: 'United States', code: '+1', flag: '🇺🇸' },
    { name: 'United Kingdom', code: '+44', flag: '🇬🇧' },
    { name: 'Canada', code: '+1', flag: '🇨🇦' },
    { name: 'Australia', code: '+61', flag: '🇦🇺' },
    { name: 'United Arab Emirates', code: '+971', flag: '🇦🇪' },
    { name: 'Germany', code: '+49', flag: '🇩🇪' },
    { name: 'France', code: '+33', flag: '🇫🇷' },
    { name: 'Italy', code: '+39', flag: '🇮🇹' },
    { name: 'Spain', code: '+34', flag: '🇪🇸' },
    { name: 'Netherlands', code: '+31', flag: '🇳🇱' },
    { name: 'Sweden', code: '+46', flag: '🇸🇪' },
    { name: 'Norway', code: '+47', flag: '🇳🇴' },
    { name: 'Denmark', code: '+45', flag: '🇩🇰' },
    { name: 'Finland', code: '+358', flag: '🇫🇮' },
    { name: 'Ireland', code: '+353', flag: '🇮🇪' },
    { name: 'Singapore', code: '+65', flag: '🇸🇬' },
    { name: 'Malaysia', code: '+60', flag: '🇲🇾' },
    { name: 'Indonesia', code: '+62', flag: '🇮🇩' },
    { name: 'Philippines', code: '+63', flag: '🇵🇭' },
    { name: 'Thailand', code: '+66', flag: '🇹🇭' },
    { name: 'Vietnam', code: '+84', flag: '🇻🇳' },
    { name: 'Japan', code: '+81', flag: '🇯🇵' },
    { name: 'South Korea', code: '+82', flag: '🇰🇷' },
    { name: 'China', code: '+86', flag: '🇨🇳' },
    { name: 'Hong Kong', code: '+852', flag: '🇭🇰' },
    { name: 'Taiwan', code: '+886', flag: '🇹🇼' },
    { name: 'Brazil', code: '+55', flag: '🇧🇷' },
    { name: 'Mexico', code: '+52', flag: '🇲🇽' },
    { name: 'Argentina', code: '+54', flag: '🇦🇷' },
    { name: 'Chile', code: '+56', flag: '🇨🇱' },
    { name: 'Colombia', code: '+57', flag: '🇨🇴' },
    { name: 'South Africa', code: '+27', flag: '🇿🇦' },
    { name: 'Kenya', code: '+254', flag: '🇰🇪' },
    { name: 'Nigeria', code: '+234', flag: '🇳🇬' },
    { name: 'Egypt', code: '+20', flag: '🇪🇬' },
    { name: 'Turkey', code: '+90', flag: '🇹🇷' },
    { name: 'Russia', code: '+7', flag: '🇷🇺' },
    { name: 'New Zealand', code: '+64', flag: '🇳🇿' },
    { name: 'Sri Lanka', code: '+94', flag: '🇱🇰' },
    { name: 'Bangladesh', code: '+880', flag: '🇧🇩' },
    { name: 'Pakistan', code: '+92', flag: '🇵🇰' },
    { name: 'Nepal', code: '+977', flag: '🇳🇵' },
    { name: 'Bhutan', code: '+975', flag: '🇧🇹' },
    { name: 'Maldives', code: '+960', flag: '🇲🇻' },
    { name: 'Saudi Arabia', code: '+966', flag: '🇸🇦' },
    { name: 'Qatar', code: '+974', flag: '🇶🇦' },
    { name: 'Oman', code: '+968', flag: '🇴🇲' },
    { name: 'Kuwait', code: '+965', flag: '🇰🇼' },
  ];

  const [countrySearch, setCountrySearch] = useState('');
  const filteredCountries = countries.filter(c =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
    c.code.includes(countrySearch)
  );

  // DOB native picker state
  const initialDate = dob ? new Date(dob) : new Date(2000, 0, 1);
  const [dobDate, setDobDate] = useState<Date>(initialDate);

  const formatDOB = (y: number, m: number, d: number) => `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

  // Country-specific phone validation (basic length checks per country code)
  const phoneRules: Record<string, { min: number; max: number }> = {
    '+91': { min: 10, max: 10 }, // India
    '+1': { min: 10, max: 10 }, // US/Canada
    '+44': { min: 10, max: 11 }, // UK
    '+61': { min: 9, max: 9 }, // Australia (excluding leading 0)
    '+971': { min: 9, max: 9 }, // UAE (mobile typically 9 after 0)
    '+49': { min: 10, max: 11 }, // Germany
    '+33': { min: 9, max: 9 }, // France
    '+39': { min: 9, max: 10 }, // Italy
    '+81': { min: 10, max: 11 }, // Japan
    '+82': { min: 9, max: 10 }, // South Korea
    '+86': { min: 11, max: 11 }, // China
    '+65': { min: 8, max: 8 }, // Singapore
    '+60': { min: 9, max: 10 }, // Malaysia
    '+62': { min: 9, max: 11 }, // Indonesia
    '+63': { min: 10, max: 10 }, // Philippines
    '+66': { min: 9, max: 9 }, // Thailand
    '+84': { min: 9, max: 10 }, // Vietnam
    '+55': { min: 10, max: 11 }, // Brazil
    '+52': { min: 10, max: 10 }, // Mexico
    '+54': { min: 10, max: 10 }, // Argentina
    '+56': { min: 9, max: 9 }, // Chile
    '+57': { min: 10, max: 10 }, // Colombia
    '+27': { min: 9, max: 9 }, // South Africa
    '+234': { min: 10, max: 11 }, // Nigeria
    '+20': { min: 9, max: 10 }, // Egypt
    '+90': { min: 10, max: 10 }, // Turkey
    '+7': { min: 10, max: 10 }, // Russia
    '+64': { min: 9, max: 9 }, // New Zealand
    '+94': { min: 9, max: 9 }, // Sri Lanka
    '+880': { min: 10, max: 10 }, // Bangladesh
    '+92': { min: 10, max: 10 }, // Pakistan
    '+977': { min: 8, max: 10 }, // Nepal
    '+975': { min: 7, max: 8 }, // Bhutan
    '+960': { min: 7, max: 7 }, // Maldives
    '+966': { min: 9, max: 9 }, // Saudi Arabia
    '+974': { min: 8, max: 8 }, // Qatar
    '+968': { min: 8, max: 8 }, // Oman
    '+965': { min: 8, max: 8 }, // Kuwait
  };

  const onSave = async () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert('Missing info', 'Please enter your name and email');
      return;
    }
    // Basic E.164-like phone validation (digits only) and country-specific length checks
    const digits = phone.replace(/\D/g, '');
    if (digits.length > 0) {
      const rule = phoneRules[country.code];
      if (rule) {
        if (digits.length < rule.min || digits.length > rule.max) {
          Alert.alert('Invalid phone number', `For ${country.name} (${country.code}), enter ${rule.min === rule.max ? rule.min : `${rule.min}-${rule.max}`} digits.`);
          return;
        }
      } else if (digits.length < 4 || digits.length > 14) {
        Alert.alert('Invalid phone number', 'Please enter a valid phone number.');
        return;
      }
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
              <View style={styles.countrySearchRow}>
                <Ionicons name="search" size={16} color="#6B7280" />
                <TextInput
                  style={styles.countrySearchInput}
                  placeholder="Search country or code"
                  value={countrySearch}
                  onChangeText={setCountrySearch}
                />
              </View>
              <ScrollView style={{ maxHeight: 260 }}>
                {filteredCountries.map((c) => (
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
          <TouchableOpacity onPress={() => setShowDatePicker(true)}>
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

      {/* Native Date Picker */}
      {showDatePicker && (
        Platform.OS === 'ios' ? (
          <Modal visible transparent animationType="fade" onRequestClose={() => setShowDatePicker(false)}>
            <View style={styles.modalBackdrop}>
              <View style={styles.modalCard}>
                <Text style={styles.modalTitle}>Select Date of Birth</Text>
                <DateTimePicker
                  value={dobDate}
                  mode="date"
                  display="inline"
                  maximumDate={new Date()}
                  onChange={(event, selectedDate) => {
                    const currentDate = selectedDate || dobDate;
                    setDobDate(currentDate);
                  }}
                />
                <View style={styles.modalActions}>
                  <TouchableOpacity style={styles.modalBtnOutline} onPress={() => setShowDatePicker(false)}>
                    <Text style={styles.modalBtnOutlineText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modalBtn}
                    onPress={() => { setDob(formatDOB(dobDate.getFullYear(), dobDate.getMonth()+1, dobDate.getDate())); setShowDatePicker(false); }}
                  >
                    <Text style={styles.modalBtnText}>Done</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        ) : (
          <DateTimePicker
            value={dobDate}
            mode="date"
            display="calendar"
            maximumDate={new Date()}
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) {
                setDobDate(selectedDate);
                setDob(formatDOB(selectedDate.getFullYear(), selectedDate.getMonth()+1, selectedDate.getDate()));
              }
            }}
          />
        )
      )}
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
  countrySearchRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  countrySearchInput: { marginLeft: 8, flex: 1, paddingVertical: 6, color: '#111827' },
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
