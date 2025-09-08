import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Platform, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Body } from './Typography';
import { theme } from '../constants/theme';

const { width } = Dimensions.get('window');
const ACTION_WIDTH = (width - 64) / 2.5;

const actions = [
  {
    id: 'compare',
    title: 'Compare Colleges',
    icon: 'git-compare',
    color: '#2196F3',
    gradient: ['#2196F3', '#1976D2'],
  },
  {
    id: 'saved',
    title: 'Saved Colleges',
    icon: 'bookmark',
    color: '#4CAF50',
    gradient: ['#4CAF50', '#388E3C'],
  },
  {
    id: 'exams',
    title: 'Entrance Exams',
    icon: 'document-text',
    color: '#FF9800',
    gradient: ['#FF9800', '#F57C00'],
  },
  {
    id: 'scholarships',
    title: 'Scholarships',
    icon: 'school',
    color: '#9C27B0',
    gradient: ['#9C27B0', '#7B1FA2'],
  },
];

interface QuickActionsProps {
  onActionPress: (actionId: string) => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ onActionPress }) => {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  return (
    <View style={styles.container}>
      <Body style={[styles.sectionTitle, isDark && { color: '#E5E7EB' }]}>Quick Actions</Body>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.actionsContainer}
      >
        {actions.map((action) => (
          <TouchableOpacity
            key={action.id}
            style={[styles.actionCard, isDark && { backgroundColor: '#0F172A' }]}
            onPress={() => onActionPress(action.id)}
          >
            <LinearGradient
              colors={action.gradient}
              style={styles.iconCircle}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons 
                name={action.icon as any} 
                size={24} 
                color="#fff"
                style={styles.actionIcon}
              />
            </LinearGradient>
            <Body style={[styles.actionTitle, isDark && { color: '#E5E7EB' }]}>{action.title}</Body>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  actionsContainer: {
    paddingRight: 16,
  },
  actionCard: {
    width: ACTION_WIDTH,
    marginRight: 12,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  actionIcon: {
    textAlign: 'center',
  },
  actionTitle: {
    fontSize: 14,
    textAlign: 'center',
    color: '#333',
    fontWeight: '500',
  },
});

export default QuickActions;
