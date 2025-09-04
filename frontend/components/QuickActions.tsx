import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Platform, ColorValue } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Body } from './Typography';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const ACTION_WIDTH = (width - 64) / 2.5;

const getGradientColors = (id: string): [ColorValue, ColorValue, ...ColorValue[]] => {
  const gradients: { [key: string]: [ColorValue, ColorValue, ...ColorValue[]] } = {
    compare: ['#4c669f', '#3b5998', '#192f6a'],
    saved: ['#11998e', '#38ef7d'],
    exams: ['#f46b45', '#eea849'],
    scholarships: ['#8e2de2', '#4a00e0']
  };
  return gradients[id] || ['#4c669f', '#3b5998'];
};

const actions = [
  {
    id: 'compare',
    title: 'Compare Colleges',
    icon: 'git-compare',
    color: '#4CAF50',
    gradient: getGradientColors('compare'),
  },
  {
    id: 'saved',
    title: 'Saved Colleges',
    icon: 'bookmark',
    color: '#FF9800',
    gradient: getGradientColors('saved'),
  },
  {
    id: 'exams',
    title: 'Entrance Exams',
    icon: 'document-text',
    color: '#9C27B0',
    gradient: getGradientColors('exams'),
  },
  {
    id: 'scholarships',
    title: 'Scholarships',
    icon: 'school',
    color: '#2196F3',
    gradient: getGradientColors('scholarships'),
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
            <LinearGradient
              colors={action.gradient}
              style={styles.gradient}
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
  gradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
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
