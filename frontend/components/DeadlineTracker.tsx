import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFavorites } from '../contexts/FavoritesContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Deadline {
  id: string;
  collegeId: string;
  collegeName: string;
  type: 'application' | 'entrance_exam' | 'scholarship' | 'document_submission';
  title: string;
  date: Date;
  description?: string;
  isCompleted: boolean;
  priority: 'high' | 'medium' | 'low';
}

const DeadlineTracker: React.FC = () => {
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const { favorites } = useFavorites();

  useEffect(() => {
    loadDeadlines();
  }, [favorites]);

  const loadDeadlines = async () => {
    try {
      const stored = await AsyncStorage.getItem('deadlines');
      let existingDeadlines: Deadline[] = stored ? JSON.parse(stored) : [];
      
      // Convert date strings back to Date objects
      existingDeadlines = existingDeadlines.map(deadline => ({
        ...deadline,
        date: new Date(deadline.date)
      }));
      
      // Generate sample deadlines for favorited colleges
      const generatedDeadlines = generateSampleDeadlines();
      
      // Merge with existing deadlines
      const allDeadlines = [...existingDeadlines, ...generatedDeadlines];
      
      // Remove duplicates and sort by date
      const uniqueDeadlines = allDeadlines
        .filter((deadline, index, self) => 
          index === self.findIndex(d => d.id === deadline.id)
        )
        .sort((a, b) => {
          const dateA = (deadline: Deadline) => deadline.date instanceof Date ? deadline.date : new Date(deadline.date);
          const dateB = (deadline: Deadline) => deadline.date instanceof Date ? deadline.date : new Date(deadline.date);
          return dateA(a).getTime() - dateB(b).getTime();
        });

      setDeadlines(uniqueDeadlines);
      await AsyncStorage.setItem('deadlines', JSON.stringify(uniqueDeadlines));
    } catch (error) {
      console.error('Error loading deadlines:', error);
    }
  };

  const generateSampleDeadlines = (): Deadline[] => {
    const sampleDeadlines: Deadline[] = [];
    const now = new Date();
    
    favorites.forEach((college, index) => {
      // Application deadline
      const appDeadline = new Date(now);
      appDeadline.setDate(now.getDate() + 30 + (index * 15));
      
      sampleDeadlines.push({
        id: `app-${college.id}`,
        collegeId: college.id,
        collegeName: college.name,
        type: 'application',
        title: 'Application Deadline',
        date: appDeadline,
        description: 'Submit your complete application with all required documents',
        isCompleted: false,
        priority: 'high',
      });

      // Entrance exam deadline
      const examDeadline = new Date(now);
      examDeadline.setDate(now.getDate() + 45 + (index * 10));
      
      sampleDeadlines.push({
        id: `exam-${college.id}`,
        collegeId: college.id,
        collegeName: college.name,
        type: 'entrance_exam',
        title: 'Entrance Exam Registration',
        date: examDeadline,
        description: 'Register for the entrance examination',
        isCompleted: false,
        priority: 'medium',
      });

      // Scholarship deadline
      if (index % 2 === 0) {
        const scholarshipDeadline = new Date(now);
        scholarshipDeadline.setDate(now.getDate() + 20 + (index * 8));
        
        sampleDeadlines.push({
          id: `scholarship-${college.id}`,
          collegeId: college.id,
          collegeName: college.name,
          type: 'scholarship',
          title: 'Scholarship Application',
          date: scholarshipDeadline,
          description: 'Apply for merit-based scholarships',
          isCompleted: false,
          priority: 'medium',
        });
      }
    });

    return sampleDeadlines;
  };

  const markAsCompleted = async (deadlineId: string) => {
    const updatedDeadlines = deadlines.map(deadline =>
      deadline.id === deadlineId
        ? { ...deadline, isCompleted: true }
        : deadline
    );
    
    setDeadlines(updatedDeadlines);
    await AsyncStorage.setItem('deadlines', JSON.stringify(updatedDeadlines));
  };

  const getDaysUntilDeadline = (date: Date): number => {
    const now = new Date();
    const deadline = new Date(date);
    const diffTime = deadline.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getDeadlineIcon = (type: Deadline['type']): string => {
    switch (type) {
      case 'application': return 'material-symbols:description';
      case 'entrance_exam': return 'material-symbols:school';
      case 'scholarship': return 'material-symbols:emoji-events';
      case 'document_submission': return 'material-symbols:folder';
      default: return 'material-symbols:calendar-month';
    }
  };

  const getPriorityColor = (priority: Deadline['priority']): string => {
    switch (priority) {
      case 'high': return '#FF5722';
      case 'medium': return '#FF9800';
      case 'low': return '#4CAF50';
      default: return '#666';
    }
  };

  const getUrgencyStyle = (daysUntil: number) => {
    if (daysUntil <= 7) return styles.urgent;
    if (daysUntil <= 14) return styles.warning;
    return styles.normal;
  };

  const upcomingDeadlines = deadlines
    .filter(deadline => !deadline.isCompleted && getDaysUntilDeadline(deadline.date) >= 0)
    .slice(0, 5);

  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  if (upcomingDeadlines.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Ionicons name="calendar" size={20} color="#2196F3" />
          <Text style={[styles.title, isDark && { color: '#E5E7EB' }]}>Upcoming Deadlines</Text>
        </View>
        <View style={styles.emptyState}>
          <Ionicons name="calendar-outline" size={48} color={isDark ? '#5B6472' : '#ccc'} />
          <Text style={[styles.emptyText, isDark && { color: '#AEB6C2' }]}>No upcoming deadlines</Text>
          <Text style={[styles.emptySubtext, isDark && { color: '#6B7280' }]}>Add colleges to favorites to track important dates</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="calendar" size={20} color="#2196F3" />
        <Text style={[styles.title, isDark && { color: '#E5E7EB' }]}>Upcoming Deadlines</Text>
        <TouchableOpacity style={styles.viewAllButton}>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.deadlinesContainer}>
        {upcomingDeadlines.map((deadline) => {
          const daysUntil = getDaysUntilDeadline(deadline.date);
          
          return (
            <View key={deadline.id} style={[styles.deadlineCard, getUrgencyStyle(daysUntil), isDark && { backgroundColor: '#0F172A' }]}>
              <View style={[styles.accentBar, { backgroundColor: getPriorityColor(deadline.priority) }]} />
              <View style={styles.deadlineHeader}>
                <View style={styles.deadlineIconContainer}>
                  <Ionicons 
                    name="time" 
                    size={18} 
                    color="#1976D2" 
                  />
                </View>
                <TouchableOpacity
                  style={styles.completeButton}
                  onPress={() => markAsCompleted(deadline.id)}
                >
                  <Ionicons name="checkmark-circle-outline" size={16} color="#4CAF50" />
                </TouchableOpacity>
              </View>

              <Text style={[styles.deadlineTitle, isDark && { color: '#E5E7EB' }]} numberOfLines={2}>
                {deadline.title}
              </Text>
              
              <Text style={[styles.collegeName, isDark && { color: '#AEB6C2' }]} numberOfLines={1}>
                {deadline.collegeName}
              </Text>

              <View style={styles.dateContainer}>
                <Text style={styles.daysUntil}>
                  {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil} days`}
                </Text>
                <Text style={[styles.date, isDark && { color: '#93A3B8' }]}>
                  {deadline.date.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </Text>
              </View>

              {deadline.description && (
                <Text style={[styles.description, isDark && { color: '#93A3B8' }]} numberOfLines={2}>
                  {deadline.description}
                </Text>
              )}
            </View>
          );
        })}
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
  deadlinesContainer: {
    paddingRight: 16,
  },
  deadlineCard: {
    width: 200,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    position: 'relative',
  },
  urgent: {
    borderLeftColor: '#FF5722',
    backgroundColor: '#fff5f5',
  },
  warning: {
    borderLeftColor: '#FF9800',
    backgroundColor: '#fffbf0',
  },
  normal: {
    backgroundColor: '#f8f9fa',
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
  deadlineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  deadlineIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  completeButton: {
    padding: 4,
  },
  deadlineTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
    lineHeight: 18,
  },
  collegeName: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  daysUntil: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2196F3',
  },
  date: {
    fontSize: 11,
    color: '#666',
  },
  description: {
    fontSize: 11,
    color: '#666',
    lineHeight: 14,
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

export default DeadlineTracker;
