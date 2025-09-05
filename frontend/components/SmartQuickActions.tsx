import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFavorites } from '../contexts/FavoritesContext';
import { router } from 'expo-router';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  action: () => void;
  priority: number;
}

const SmartQuickActions: React.FC = () => {
  const [quickActions, setQuickActions] = useState<QuickAction[]>([]);
  const { favorites } = useFavorites();

  useEffect(() => {
    generateSmartActions();
  }, [favorites]);

  const generateSmartActions = () => {
    const actions: QuickAction[] = [];

    // Default actions for all users
    actions.push({
      id: 'setup-preferences',
      title: 'Set Up Preferences',
      description: 'Tell us about your goals',
      icon: 'material-symbols:settings',
      color: '#2196F3',
      action: () => router.push('/(tabs)/home'),
      priority: 1,
    });

    actions.push({
      id: 'choose-field',
      title: 'Choose Your Field',
      description: 'Select your area of study',
      icon: 'material-symbols:school',
      color: '#4CAF50',
      action: () => router.push('/(tabs)/home'),
      priority: 2,
    });

    // If has favorites but less than 3, suggest adding more
    if (favorites.length > 0 && favorites.length < 3) {
      actions.push({
        id: 'add-more-favorites',
        title: 'Add More Colleges',
        description: 'Build your shortlist',
        icon: 'material-symbols:favorite-outline',
        color: '#FF5722',
        action: () => router.push('/(tabs)/home'),
        priority: 8,
      });
    }

    // If has 2+ favorites, suggest comparing
    if (favorites.length >= 2) {
      actions.push({
        id: 'compare-colleges',
        title: 'Compare Colleges',
        description: 'See side-by-side comparison',
        icon: 'material-symbols:analytics',
        color: '#9C27B0',
        action: () => router.push('/(tabs)/compare'),
        priority: 7,
      });
    }

    // Always show exam preparation
    actions.push({
      id: 'exam-prep',
      title: 'Exam Preparation',
      description: 'Prepare for entrance exams',
      icon: 'material-symbols:menu-book',
      color: '#607D8B',
      action: () => router.push('/(tabs)/home'),
      priority: 6,
    });

    // Always show scholarships
    actions.push({
      id: 'scholarships',
      title: 'Find Scholarships',
      description: 'Discover funding opportunities',
      icon: 'material-symbols:emoji-events',
      color: '#FF9800',
      action: () => router.push('/(tabs)/home'),
      priority: 5,
    });

    // Application deadlines
    if (favorites.length > 0) {
      actions.push({
        id: 'check-deadlines',
        title: 'Check Deadlines',
        description: 'View upcoming dates',
        icon: 'material-symbols:calendar-month',
        color: '#E91E63',
        action: () => {
          // Could navigate to deadlines section
          console.log('Navigate to deadlines');
        },
        priority: 4,
      });
    }

    // Virtual tours
    actions.push({
      id: 'virtual-tours',
      title: 'Virtual Tours',
      description: 'Explore campus online',
      icon: 'material-symbols:videocam',
      color: '#00BCD4',
      action: () => {
        // Could navigate to virtual tours
        console.log('Navigate to virtual tours');
      },
      priority: 3,
    });

    // Career guidance
    actions.push({
      id: 'career-guidance',
      title: 'Career Guidance',
      description: 'Explore career options',
      icon: 'material-symbols:work',
      color: '#607D8B',
      action: () => {
        // Could navigate to career section
        console.log('Navigate to career guidance');
      },
      priority: 2,
    });

    // Study abroad options
    actions.push({
      id: 'study-abroad',
      title: 'Study Abroad',
      description: 'International opportunities',
      icon: 'material-symbols:flight',
      color: '#795548',
      action: () => {
        // Could navigate to study abroad section
        console.log('Navigate to study abroad');
      },
      priority: 1,
    });

    // Sort by priority and take top 6
    const sortedActions = actions
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 6);

    setQuickActions(sortedActions);
  };

  if (quickActions.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="flash" size={20} color="#2196F3" />
        <Text style={styles.title}>Smart Actions</Text>
        <Text style={styles.subtitle}>Personalized for you</Text>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={styles.actionsContainer}
      >
        {quickActions.map((action) => (
          <TouchableOpacity
            key={action.id}
            style={[styles.actionCard, { borderLeftColor: action.color }]}
            onPress={action.action}
          >
            <View style={[styles.iconContainer, { backgroundColor: action.color + '20' }]}>
              <Ionicons 
                name="settings" 
                size={24} 
                color={action.color} 
              />
            </View>
            
            <Text style={styles.actionTitle} numberOfLines={2}>
              {action.title}
            </Text>
            
            <Text style={styles.actionDescription} numberOfLines={2}>
              {action.description}
            </Text>

            <View style={styles.actionFooter}>
              <Ionicons 
                name="arrow-forward" 
                size={16} 
                color={action.color} 
              />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  subtitle: {
    fontSize: 11,
    color: '#666',
    marginLeft: 'auto',
    fontStyle: 'italic',
  },
  actionsContainer: {
    paddingRight: 16,
  },
  actionCard: {
    width: 140,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
    justifyContent: 'space-between',
    minHeight: 120,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
    lineHeight: 16,
  },
  actionDescription: {
    fontSize: 11,
    color: '#666',
    lineHeight: 14,
    flex: 1,
  },
  actionFooter: {
    alignItems: 'flex-end',
    marginTop: 8,
  },
});

export default SmartQuickActions;
