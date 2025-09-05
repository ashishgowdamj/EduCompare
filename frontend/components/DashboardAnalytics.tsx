import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFavorites } from '../contexts/FavoritesContext';
import { usePreferences } from '../contexts/PreferencesContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AnalyticsData {
  totalCollegesViewed: number;
  favoritesCount: number;
  applicationsInProgress: number;
  upcomingDeadlines: number;
  browsingStreak: number;
  lastActiveDate: string;
}

const DashboardAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalCollegesViewed: 0,
    favoritesCount: 0,
    applicationsInProgress: 0,
    upcomingDeadlines: 0,
    browsingStreak: 0,
    lastActiveDate: new Date().toISOString(),
  });

  const { favorites } = useFavorites();
  const { preferences } = usePreferences();

  useEffect(() => {
    loadAnalytics();
  }, [favorites]);

  const loadAnalytics = async () => {
    try {
      // Load browsing history
      const browsingHistory = await AsyncStorage.getItem('browsingHistory');
      const history = browsingHistory ? JSON.parse(browsingHistory) : [];
      
      // Load applications
      const applications = await AsyncStorage.getItem('applications');
      const apps = applications ? JSON.parse(applications) : [];
      
      // Load deadlines
      const deadlines = await AsyncStorage.getItem('deadlines');
      const deadlinesList = deadlines ? JSON.parse(deadlines) : [];
      
      // Calculate analytics
      const uniqueColleges = new Set(history.map((item: any) => item.collegeId));
      const inProgressApps = apps.filter((app: any) => 
        app.status === 'in_progress' || app.status === 'not_started'
      );
      
      const now = new Date();
      const upcomingDeadlines = deadlinesList.filter((deadline: any) => {
        const deadlineDate = new Date(deadline.date);
        const daysDiff = (deadlineDate.getTime() - now.getTime()) / (1000 * 3600 * 24);
        return daysDiff <= 30 && daysDiff >= 0 && !deadline.isCompleted;
      });

      // Calculate browsing streak (simplified)
      const streak = calculateBrowsingStreak(history);

      setAnalytics({
        totalCollegesViewed: uniqueColleges.size,
        favoritesCount: favorites.length,
        applicationsInProgress: inProgressApps.length,
        upcomingDeadlines: upcomingDeadlines.length,
        browsingStreak: streak,
        lastActiveDate: history.length > 0 ? history[history.length - 1].timestamp : new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  const calculateBrowsingStreak = (history: any[]): number => {
    if (history.length === 0) return 0;
    
    const today = new Date();
    const dates = history.map(item => new Date(item.timestamp).toDateString());
    const uniqueDates = [...new Set(dates)].sort();
    
    let streak = 0;
    let currentDate = new Date(today);
    
    for (let i = uniqueDates.length - 1; i >= 0; i--) {
      const historyDate = new Date(uniqueDates[i]);
      const daysDiff = Math.floor((currentDate.getTime() - historyDate.getTime()) / (1000 * 3600 * 24));
      
      if (daysDiff === streak) {
        streak++;
        currentDate = historyDate;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const getStreakMessage = (streak: number): string => {
    if (streak === 0) return 'Start exploring!';
    if (streak === 1) return 'Great start!';
    if (streak < 7) return `${streak} days strong!`;
    if (streak < 30) return `${streak} days streak! 🔥`;
    return `${streak} days! Amazing! 🚀`;
  };

  const getProgressColor = (value: number, max: number): string => {
    const percentage = (value / max) * 100;
    if (percentage < 25) return '#F44336';
    if (percentage < 50) return '#FF9800';
    if (percentage < 75) return '#FFC107';
    return '#4CAF50';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="analytics" size={20} color="#2196F3" />
        <Text style={styles.title}>📊 Your Progress</Text>
        <TouchableOpacity style={styles.detailsButton}>
          <Text style={styles.detailsText}>Details</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.metricsGrid}>
        {/* Colleges Explored */}
        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Ionicons name="school-outline" size={16} color="#2196F3" />
            <Text style={styles.metricValue}>{analytics.totalCollegesViewed}</Text>
          </View>
          <Text style={styles.metricLabel}>Colleges Explored</Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${Math.min((analytics.totalCollegesViewed / 50) * 100, 100)}%`,
                  backgroundColor: getProgressColor(analytics.totalCollegesViewed, 50)
                }
              ]} 
            />
          </View>
        </View>

        {/* Favorites */}
        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Ionicons name="heart" size={16} color="#E91E63" />
            <Text style={styles.metricValue}>{analytics.favoritesCount}</Text>
          </View>
          <Text style={styles.metricLabel}>Favorites</Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${Math.min((analytics.favoritesCount / 10) * 100, 100)}%`,
                  backgroundColor: getProgressColor(analytics.favoritesCount, 10)
                }
              ]} 
            />
          </View>
        </View>

        {/* Applications */}
        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Ionicons name="document-text" size={16} color="#FF9800" />
            <Text style={styles.metricValue}>{analytics.applicationsInProgress}</Text>
          </View>
          <Text style={styles.metricLabel}>Active Apps</Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${Math.min((analytics.applicationsInProgress / 5) * 100, 100)}%`,
                  backgroundColor: getProgressColor(analytics.applicationsInProgress, 5)
                }
              ]} 
            />
          </View>
        </View>

        {/* Upcoming Deadlines */}
        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Ionicons name="time" size={16} color="#F44336" />
            <Text style={styles.metricValue}>{analytics.upcomingDeadlines}</Text>
          </View>
          <Text style={styles.metricLabel}>Deadlines</Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${Math.min((analytics.upcomingDeadlines / 10) * 100, 100)}%`,
                  backgroundColor: analytics.upcomingDeadlines > 5 ? '#F44336' : '#4CAF50'
                }
              ]} 
            />
          </View>
        </View>
      </View>

      {/* Browsing Streak */}
      <View style={styles.streakContainer}>
        <View style={styles.streakHeader}>
          <Ionicons name="flame" size={20} color="#FF5722" />
          <Text style={styles.streakTitle}>Browsing Streak</Text>
        </View>
        <Text style={styles.streakValue}>{getStreakMessage(analytics.browsingStreak)}</Text>
        <View style={styles.streakBar}>
          <View 
            style={[
              styles.streakFill, 
              { 
                width: `${Math.min((analytics.browsingStreak / 30) * 100, 100)}%`,
                backgroundColor: analytics.browsingStreak > 7 ? '#FF5722' : '#FFC107'
              }
            ]} 
          />
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.quickStats}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Profile</Text>
          <Text style={styles.statValue}>
            {preferences?.academicProfile?.field ? '✅' : '⏳'}
          </Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Preferences</Text>
          <Text style={styles.statValue}>
            {preferences?.location?.preferredStates?.length ? '✅' : '⏳'}
          </Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Budget Set</Text>
          <Text style={styles.statValue}>
            {preferences?.budget?.maxBudget ? '✅' : '⏳'}
          </Text>
        </View>
      </View>
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
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  detailsButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#f0f7ff',
  },
  detailsText: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: '600',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metricCard: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  metricLabel: {
    fontSize: 11,
    color: '#666',
    marginBottom: 6,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e9ecef',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  streakContainer: {
    backgroundColor: '#fff3e0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FF5722',
  },
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  streakTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  streakValue: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  streakBar: {
    height: 6,
    backgroundColor: '#ffcc80',
    borderRadius: 3,
    overflow: 'hidden',
  },
  streakFill: {
    height: '100%',
    borderRadius: 3,
  },
  quickStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10,
    color: '#666',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 16,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#dee2e6',
    marginHorizontal: 8,
  },
});

export default DashboardAnalytics;
