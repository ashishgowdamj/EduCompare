import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Body } from './Typography';
import { theme } from '../constants/theme';

const { width } = Dimensions.get('window');
const ACTION_WIDTH = (width - 64) / 2.5;

const actions = [
  {
    id: 'compare',
    title: 'Compare Colleges',
    icon: 'git-compare',
  },
  {
    id: 'saved',
    title: 'Saved Colleges',
    icon: 'bookmark',
  },
  {
    id: 'exams',
    title: 'Entrance Exams',
    icon: 'document-text',
  },
  {
    id: 'scholarships',
    title: 'Scholarships',
    icon: 'school',
  },
];

interface QuickActionsProps {
  onActionPress: (actionId: string) => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ onActionPress }) => {
  return (
    <View style={styles.container}>
      <Body style={styles.sectionTitle}>Quick Actions</Body>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.actionsContainer}
      >
        {actions.map((action) => (
          <TouchableOpacity
            key={action.id}
            style={styles.actionCard}
            onPress={() => onActionPress(action.id)}
          >
            <View style={styles.iconCircle}>
              <Ionicons 
                name={action.icon as any} 
                size={24} 
                color={theme.colors.icon.accent}
                style={styles.actionIcon}
              />
            </View>
            <Body style={styles.actionTitle}>{action.title}</Body>
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
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: theme.colors.icon.accent + '20',
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
