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
import { theme } from '../constants/theme';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
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
      icon: 'settings',
      action: () => router.push('/preferences-setup'),
      priority: 1,
    });

    actions.push({
      id: 'choose-field',
      title: 'Choose Your Field',
      description: 'Select your area of study',
      icon: 'school',
      action: () => router.push('/choose-field' as any),
      priority: 2,
    });

    // If has favorites but less than 3, suggest adding more
    if (favorites.length > 0 && favorites.length < 3) {
      actions.push({
        id: 'add-more-favorites',
        title: 'Add More Colleges',
        description: 'Build your shortlist',
        icon: 'heart-outline',
        action: () => router.push('/(tabs)/favorites'),
        priority: 8,
      });
    }

    // If has 2+ favorites, suggest comparing
    if (favorites.length >= 2) {
      actions.push({
        id: 'compare-colleges',
        title: 'Compare Colleges',
        description: 'See side-by-side comparison',
        icon: 'git-compare',
        action: () => router.push('/(tabs)/compare'),
        priority: 7,
      });
    }

    // Always show exam preparation
    actions.push({
      id: 'exam-prep',
      title: 'Exam Preparation',
      description: 'Prepare for entrance exams',
      icon: 'book',
      action: () => router.push('/exams'),
      priority: 6,
    });

    // Always show scholarships
    actions.push({
      id: 'scholarships',
      title: 'Find Scholarships',
      description: 'Discover funding opportunities',
      icon: 'trophy',
      action: () => router.push('/scholarships'),
      priority: 5,
    });

    // Removed: Application deadlines and Virtual tours per request

    // Career guidance
    actions.push({
      id: 'career-guidance',
      title: 'Career Guidance',
      description: 'Explore career options',
      icon: 'briefcase',
      action: () => router.push('/career-guidance'),
      priority: 2,
    });

    // Study abroad options
    actions.push({
      id: 'study-abroad',
      title: 'Study Abroad',
      description: 'International opportunities',
      icon: 'airplane',
      action: () => {},
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
        <Ionicons name="flash" size={20} color={theme.colors.icon.accent} />
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
            style={styles.actionCard}
            onPress={action.action}
          >
            <View style={[styles.accentBar, { backgroundColor: theme.colors.icon.accent }]} />
            <View style={[styles.iconContainer, { backgroundColor: theme.colors.icon.accent + '20' }]}> 
              <Ionicons 
                name={action.icon}
                size={24} 
                color={theme.colors.icon.accent} 
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
                color={theme.colors.icon.accent} 
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
    justifyContent: 'space-between',
    minHeight: 120,
    position: 'relative',
  },
  accentBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
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
