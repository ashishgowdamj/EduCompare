import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

interface DrawerLink {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
}

interface SideDrawerProps {
  visible: boolean;
  onClose: () => void;
  onNavigate: (route: string) => void;
}

const LINKS: DrawerLink[] = [
  { label: 'Home', icon: 'home', route: '/(tabs)/home' },
  { label: 'Notifications', icon: 'notifications', route: '/notifications' },
  { label: 'Exams', icon: 'school', route: '/exams' },
  { label: 'Scholarships', icon: 'trophy', route: '/scholarships' },
  { label: 'Favorites', icon: 'heart', route: '/(tabs)/favorites' },
  { label: 'Compare', icon: 'git-compare', route: '/(tabs)/compare' },
  { label: 'Career Guidance', icon: 'briefcase', route: '/career-guidance' },
  { label: 'Choose Field', icon: 'options', route: '/choose-field' },
  { label: 'Settings', icon: 'settings', route: '/edit-profile' },
];

const SideDrawer: React.FC<SideDrawerProps> = ({ visible, onClose, onNavigate }) => {
  const insets = useSafeAreaInsets();
  const translateX = React.useRef(new Animated.Value(-width)).current;
  const overlayOpacity = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(translateX, { toValue: 0, duration: 220, useNativeDriver: true }),
        Animated.timing(overlayOpacity, { toValue: 1, duration: 220, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateX, { toValue: -width, duration: 200, useNativeDriver: true }),
        Animated.timing(overlayOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <View style={styles.root} pointerEvents="box-none">
      <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}> 
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      <Animated.View style={[
        styles.drawer,
        {
          paddingTop: Math.max(12, insets.top + 12),
          paddingBottom: Math.max(16, insets.bottom + 8),
          transform: [{ translateX }],
        },
      ]}> 
        <View style={styles.header}> 
          <Text style={styles.headerTitle}>Menu</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={22} color="#111" />
          </TouchableOpacity>
        </View>

        <View style={styles.links}>
          {LINKS.map((l) => (
            <TouchableOpacity key={l.route} style={styles.link} onPress={() => { onNavigate(l.route); onClose(); }}>
              <Ionicons name={l.icon as any} size={18} color="#1976D2" />
              <Text style={styles.linkText}>{l.label}</Text>
              <Ionicons name="chevron-forward" size={16} color="#B0BEC5" style={{ marginLeft: 'auto' }} />
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, zIndex: 1000, elevation: 1000 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)' },
  drawer: { 
    position: 'absolute', 
    left: 0, 
    top: 0, 
    bottom: 0, 
    width: Math.min(340, width * 0.9), 
    backgroundColor: '#fff', 
    paddingHorizontal: 14, 
    borderTopRightRadius: 24, 
    borderBottomRightRadius: 24, 
    zIndex: 1001, 
    elevation: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
      },
      android: {
        elevation: 20,
      },
    }),
  },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  closeBtn: { marginLeft: 'auto', padding: 6 },
  links: { marginTop: 6 },
  link: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 10, borderRadius: 12 },
  linkText: { marginLeft: 10, color: '#111827', fontWeight: '600' },
});

export default SideDrawer;
