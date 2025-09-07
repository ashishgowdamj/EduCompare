import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../constants/theme';

type UpdateType = 'news' | 'deadline' | 'admission' | 'scholarship';

interface Update {
  id: string;
  type: UpdateType;
  title: string;
  description: string;
}

const UpdatesFeed: React.FC = () => {
  const updates: Update[] = [
    {
      id: '1',
      type: 'news',
      title: 'New Engineering Programs',
      description: 'Top colleges have launched new engineering programs.',
    },
    {
      id: '2',
      type: 'deadline',
      title: 'Application Deadline',
      description: 'Submit your applications before the deadline.',
    },
  ];

  const getUpdateIcon = (type: UpdateType): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case 'news': return 'newspaper';
      case 'deadline': return 'calendar';
      case 'admission': return 'school';
      case 'scholarship': return 'trophy';
      default: return 'information-circle';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="notifications" size={20} color={theme.colors.icon.accent} />
          <Text style={styles.title}>Updates</Text>
        </View>
      </View>
      
      <View style={styles.updatesContainer}>
        {updates.map((update) => (
          <View key={update.id} style={styles.updateItem}>
            <Ionicons 
              name={getUpdateIcon(update.type)}
              size={18}
              color={theme.colors.icon.default}
              style={styles.icon}
            />
            <View style={styles.updateContent}>
              <Text style={styles.updateTitle}>{update.title}</Text>
              <Text style={styles.updateDescription}>{update.description}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 16,
  },
  header: {
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  updatesContainer: {
    gap: 12,
  },
  updateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  icon: {
    width: 24,
  },
  updateContent: {
    flex: 1,
  },
  updateTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  updateDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
});

export default UpdatesFeed;
