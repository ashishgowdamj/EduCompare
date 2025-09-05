import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const UpdatesFeed: React.FC = () => {
  const updates = [
    {
      id: '1',
      type: 'news',
      title: 'New Engineering Programs Available',
      description: 'Several top colleges have launched innovative engineering programs.',
      priority: 'high',
      isRead: false,
    },
    {
      id: '2',
      type: 'deadline',
      title: 'Application Deadline Reminder',
      description: 'Don\'t forget to submit your applications before the deadline.',
      priority: 'high',
      isRead: false,
    },
  ];

  const getUpdateIcon = (type: string) => {
    switch (type) {
      case 'news': return 'newspaper';
      case 'deadline': return 'time';
      case 'admission': return 'school';
      case 'scholarship': return 'trophy';
      default: return 'information-circle';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#F44336';
      case 'medium': return '#FF9800';
      case 'low': return '#4CAF50';
      default: return '#666';
    }
  };

  const unreadUpdates = updates.filter(update => !update.isRead);

  if (updates.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Ionicons name="notifications" size={20} color="#2196F3" />
          <Text style={styles.title}>🔔 Updates & News</Text>
        </View>
        <View style={styles.emptyState}>
          <Ionicons name="notifications-outline" size={48} color="#ccc" />
          <Text style={styles.emptyText}>No updates yet</Text>
          <Text style={styles.emptySubtext}>Check back later for news and updates</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="notifications" size={20} color="#2196F3" />
        <Text style={styles.title}>🔔 Updates & News</Text>
        {unreadUpdates.length > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadCount}>{unreadUpdates.length}</Text>
          </View>
        )}
        <TouchableOpacity style={styles.viewAllButton}>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.updatesContainer} showsVerticalScrollIndicator={false}>
        {updates.slice(0, 3).map((update) => (
          <TouchableOpacity
            key={update.id}
            style={[styles.updateCard, !update.isRead && styles.unreadCard]}
          >
            <View style={styles.updateHeader}>
              <View style={styles.updateIconContainer}>
                <Ionicons 
                  name={getUpdateIcon(update.type) as any} 
                  size={16} 
                  color={getPriorityColor(update.priority)} 
                />
              </View>
              
              <View style={styles.updateContent}>
                <Text style={styles.updateTitle} numberOfLines={1}>
                  {update.title}
                </Text>
                <Text style={styles.updateTime}>
                  Just now
                </Text>
              </View>
            </View>

            <Text style={styles.updateDescription} numberOfLines={2}>
              {update.description}
            </Text>

            <View style={styles.updateFooter}>
              <View style={[styles.typeBadge, { backgroundColor: getPriorityColor(update.priority) + '20' }]}>
                <Text style={[styles.typeText, { color: getPriorityColor(update.priority) }]}>
                  {update.type.toUpperCase()}
                </Text>
              </View>
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
    flex: 1,
  },
  unreadBadge: {
    backgroundColor: '#FF5722',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 8,
  },
  unreadCount: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
  },
  viewAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#f0f7ff',
  },
  viewAllText: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: '600',
  },
  updatesContainer: {
    maxHeight: 300,
  },
  updateCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#e9ecef',
  },
  unreadCard: {
    backgroundColor: '#f0f7ff',
    borderLeftColor: '#2196F3',
  },
  updateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  updateIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  collegeIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  updateInfo: {
    flex: 1,
  },
  updateTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  updateContent: {
    flex: 1,
  },
  updateCollege: {
    fontSize: 12,
    color: '#666',
  },
  updateTime: {
    fontSize: 10,
    color: '#999',
  },
  updateDescription: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
    marginBottom: 8,
  },
  updateFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  typeText: {
    fontSize: 9,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginTop: 8,
  },
  emptySubtext: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 4,
  },
});

export default UpdatesFeed;
