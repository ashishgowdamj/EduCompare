import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ProgressBarAndroid,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFavorites } from '../contexts/FavoritesContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ApplicationStep {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  isOptional: boolean;
  dueDate?: Date;
}

interface CollegeApplication {
  collegeId: string;
  collegeName: string;
  status: 'not_started' | 'in_progress' | 'submitted' | 'accepted' | 'rejected';
  steps: ApplicationStep[];
  progress: number;
  lastUpdated: Date;
}

const ApplicationProgress: React.FC = () => {
  const [applications, setApplications] = useState<CollegeApplication[]>([]);
  const { favorites } = useFavorites();

  useEffect(() => {
    loadApplications();
  }, [favorites]);

  const loadApplications = async () => {
    try {
      const stored = await AsyncStorage.getItem('applications');
      let existingApplications: CollegeApplication[] = stored ? JSON.parse(stored) : [];
      
      // Generate applications for favorited colleges
      const generatedApplications = generateApplicationsForFavorites();
      
      // Merge with existing applications
      const allApplications = [...existingApplications];
      
      generatedApplications.forEach(newApp => {
        const existingIndex = allApplications.findIndex(app => app.collegeId === newApp.collegeId);
        if (existingIndex === -1) {
          allApplications.push(newApp);
        }
      });

      setApplications(allApplications);
      await AsyncStorage.setItem('applications', JSON.stringify(allApplications));
    } catch (error) {
      console.error('Error loading applications:', error);
    }
  };

  const generateApplicationsForFavorites = (): CollegeApplication[] => {
    return favorites.map((college, index) => {
      const baseSteps: ApplicationStep[] = [
        {
          id: 'profile',
          title: 'Complete Profile',
          description: 'Fill out personal and academic information',
          isCompleted: index < 2, // First 2 colleges have this completed
          isOptional: false,
        },
        {
          id: 'documents',
          title: 'Upload Documents',
          description: 'Upload transcripts, certificates, and ID proof',
          isCompleted: index < 1, // Only first college has this completed
          isOptional: false,
        },
        {
          id: 'essay',
          title: 'Write Essay',
          description: 'Submit statement of purpose or personal essay',
          isCompleted: false,
          isOptional: false,
        },
        {
          id: 'recommendations',
          title: 'Get Recommendations',
          description: 'Obtain letters of recommendation from teachers',
          isCompleted: false,
          isOptional: false,
        },
        {
          id: 'exam_scores',
          title: 'Submit Test Scores',
          description: 'Upload entrance exam or standardized test scores',
          isCompleted: index === 0, // Only first college has this completed
          isOptional: false,
        },
        {
          id: 'interview',
          title: 'Schedule Interview',
          description: 'Book and attend admission interview',
          isCompleted: false,
          isOptional: true,
        },
        {
          id: 'fee_payment',
          title: 'Pay Application Fee',
          description: 'Complete application fee payment',
          isCompleted: false,
          isOptional: false,
        },
        {
          id: 'submit',
          title: 'Submit Application',
          description: 'Final submission of complete application',
          isCompleted: false,
          isOptional: false,
        },
      ];

      const completedSteps = baseSteps.filter(step => step.isCompleted).length;
      const totalSteps = baseSteps.filter(step => !step.isOptional).length;
      const progress = (completedSteps / totalSteps) * 100;

      let status: CollegeApplication['status'] = 'not_started';
      if (progress > 0 && progress < 100) status = 'in_progress';
      else if (progress === 100) status = 'submitted';

      return {
        collegeId: college.id,
        collegeName: college.name,
        status,
        steps: baseSteps,
        progress,
        lastUpdated: new Date(),
      };
    });
  };

  const toggleStepCompletion = async (collegeId: string, stepId: string) => {
    const updatedApplications = applications.map(app => {
      if (app.collegeId === collegeId) {
        const updatedSteps = app.steps.map(step => 
          step.id === stepId ? { ...step, isCompleted: !step.isCompleted } : step
        );
        
        const completedSteps = updatedSteps.filter(step => step.isCompleted).length;
        const totalSteps = updatedSteps.filter(step => !step.isOptional).length;
        const progress = (completedSteps / totalSteps) * 100;

        let status: CollegeApplication['status'] = 'not_started';
        if (progress > 0 && progress < 100) status = 'in_progress';
        else if (progress === 100) status = 'submitted';

        return {
          ...app,
          steps: updatedSteps,
          progress,
          status,
          lastUpdated: new Date(),
        };
      }
      return app;
    });

    setApplications(updatedApplications);
    await AsyncStorage.setItem('applications', JSON.stringify(updatedApplications));
  };

  const getStatusColor = (status: CollegeApplication['status']): string => {
    switch (status) {
      case 'not_started': return '#999';
      case 'in_progress': return '#FF9800';
      case 'submitted': return '#2196F3';
      case 'accepted': return '#4CAF50';
      case 'rejected': return '#F44336';
      default: return '#999';
    }
  };

  const getStatusText = (status: CollegeApplication['status']): string => {
    switch (status) {
      case 'not_started': return 'Not Started';
      case 'in_progress': return 'In Progress';
      case 'submitted': return 'Submitted';
      case 'accepted': return 'Accepted';
      case 'rejected': return 'Rejected';
      default: return 'Unknown';
    }
  };

  const activeApplications = applications.filter(app => app.status !== 'not_started');

  if (applications.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Ionicons name="clipboard" size={20} color="#2196F3" />
          <Text style={styles.title}>Application Progress</Text>
        </View>
        <View style={styles.emptyState}>
          <Ionicons name="clipboard-outline" size={48} color="#ccc" />
          <Text style={styles.emptyText}>No applications yet</Text>
          <Text style={styles.emptySubtext}>Add colleges to favorites to start tracking applications</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="clipboard" size={20} color="#2196F3" />
        <Text style={styles.title}>Application Progress</Text>
        <TouchableOpacity style={styles.viewAllButton}>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.applicationsContainer} showsVerticalScrollIndicator={false}>
        {activeApplications.slice(0, 3).map((application) => (
          <View key={application.collegeId} style={styles.applicationCard}>
            <View style={styles.applicationHeader}>
              <Text style={styles.collegeName} numberOfLines={1}>
                {application.collegeName}
              </Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(application.status) + '20' }]}>
                <Text style={[styles.statusText, { color: getStatusColor(application.status) }]}>
                  {getStatusText(application.status)}
                </Text>
              </View>
            </View>

            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: `${application.progress}%`,
                      backgroundColor: getStatusColor(application.status)
                    }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>
                {Math.round(application.progress)}% Complete
              </Text>
            </View>

            <View style={styles.stepsContainer}>
              {application.steps.slice(0, 4).map((step) => (
                <TouchableOpacity
                  key={step.id}
                  style={styles.stepItem}
                  onPress={() => toggleStepCompletion(application.collegeId, step.id)}
                >
                  <View style={[
                    styles.stepCheckbox,
                    step.isCompleted && styles.stepCompleted
                  ]}>
                    {step.isCompleted && (
                      <Ionicons name="checkmark" size={12} color="#fff" />
                    )}
                  </View>
                  <View style={styles.stepContent}>
                    <Text style={[
                      styles.stepTitle,
                      step.isCompleted && styles.stepTitleCompleted
                    ]}>
                      {step.title}
                      {step.isOptional && <Text style={styles.optionalText}> (Optional)</Text>}
                    </Text>
                    <Text style={styles.stepDescription} numberOfLines={1}>
                      {step.description}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
              
              {application.steps.length > 4 && (
                <Text style={styles.moreStepsText}>
                  +{application.steps.length - 4} more steps
                </Text>
              )}
            </View>
          </View>
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
  applicationsContainer: {
    maxHeight: 400,
  },
  applicationCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  applicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  collegeName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e9ecef',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 11,
    color: '#666',
    textAlign: 'right',
  },
  stepsContainer: {
    gap: 8,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ddd',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepCompleted: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  stepTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  stepDescription: {
    fontSize: 10,
    color: '#666',
    marginTop: 1,
  },
  optionalText: {
    color: '#999',
    fontWeight: 'normal',
  },
  moreStepsText: {
    fontSize: 11,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 4,
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

export default ApplicationProgress;
