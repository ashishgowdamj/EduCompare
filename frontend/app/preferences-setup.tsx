import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { usePreferences, UserPreferences } from '../contexts/PreferencesContext';
import { H1, H3, Body } from '../components/Typography';

const popularCourses = [
  'Computer Science', 'Information Technology', 'Mechanical Engineering',
  'Electronics', 'Civil Engineering', 'Chemical Engineering',
  'Biotechnology', 'Aerospace Engineering', 'Electrical Engineering',
  'Data Science', 'Artificial Intelligence', 'Business Administration',
  'Medicine', 'Pharmacy', 'Architecture', 'Design'
];

const popularStates = [
  'Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Telangana',
  'Uttar Pradesh', 'West Bengal', 'Gujarat', 'Rajasthan', 'Haryana'
];

const universityTypes = ['Government', 'Private', 'Deemed'];

const entranceExams = [
  'JEE Main', 'JEE Advanced', 'NEET', 'GATE', 'CAT', 'XAT', 'GMAT',
  'CLAT', 'AIIMS', 'BITSAT', 'VITEEE', 'COMEDK'
];

export default function PreferencesSetup() {
  const router = useRouter();
  const { updatePreferences } = usePreferences();
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<UserPreferences>>({
    preferredCourses: [],
    budgetRange: { min: 0, max: 500000 },
    preferredStates: [],
    preferredCities: [],
    universityTypes: [],
    placementPriority: 3,
    feesPriority: 3,
    rankingPriority: 3,
    entranceExams: [],
  });

  const toggleArrayItem = (array: string[], item: string) => {
    return array.includes(item) 
      ? array.filter(i => i !== item)
      : [...array, item];
  };

  const updateFormData = (key: keyof UserPreferences, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    try {
      await updatePreferences(formData);
      Alert.alert(
        'Preferences Saved!',
        'Your preferences have been saved. We\'ll use this to recommend the best colleges for you.',
        [{ text: 'OK', onPress: () => router.replace('/(tabs)/home') }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to save preferences. Please try again.');
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <H3 style={styles.stepTitle}>Academic Profile</H3>
      
      <View style={styles.inputGroup}>
        <Body style={styles.label}>Academic Percentage (Optional)</Body>
        <TextInput
          style={styles.textInput}
          placeholder="e.g., 85"
          value={formData.academicPercentage?.toString() || ''}
          onChangeText={(text) => updateFormData('academicPercentage', text ? parseFloat(text) : undefined)}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Body style={styles.label}>Preferred Courses *</Body>
        <View style={styles.chipContainer}>
          {popularCourses.map((course) => (
            <TouchableOpacity
              key={course}
              style={[
                styles.chip,
                formData.preferredCourses?.includes(course) && styles.chipActive
              ]}
              onPress={() => updateFormData('preferredCourses', 
                toggleArrayItem(formData.preferredCourses || [], course)
              )}
            >
              <Text style={[
                styles.chipText,
                formData.preferredCourses?.includes(course) && styles.chipTextActive
              ]}>
                {course}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Body style={styles.label}>Entrance Exams</Body>
        <View style={styles.chipContainer}>
          {entranceExams.map((exam) => (
            <TouchableOpacity
              key={exam}
              style={[
                styles.chip,
                formData.entranceExams?.includes(exam) && styles.chipActive
              ]}
              onPress={() => updateFormData('entranceExams', 
                toggleArrayItem(formData.entranceExams || [], exam)
              )}
            >
              <Text style={[
                styles.chipText,
                formData.entranceExams?.includes(exam) && styles.chipTextActive
              ]}>
                {exam}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <H3 style={styles.stepTitle}>Budget & Location</H3>
      
      <View style={styles.inputGroup}>
        <Body style={styles.label}>Annual Fee Budget (₹) *</Body>
        <View style={styles.rangeContainer}>
          <TextInput
            style={styles.rangeInput}
            placeholder="Min"
            value={formData.budgetRange?.min.toString() || '0'}
            onChangeText={(text) => updateFormData('budgetRange', {
              ...formData.budgetRange,
              min: text ? parseInt(text) : 0
            })}
            keyboardType="numeric"
          />
          <Text style={styles.rangeSeparator}>to</Text>
          <TextInput
            style={styles.rangeInput}
            placeholder="Max"
            value={formData.budgetRange?.max.toString() || ''}
            onChangeText={(text) => updateFormData('budgetRange', {
              ...formData.budgetRange,
              max: text ? parseInt(text) : 1000000
            })}
            keyboardType="numeric"
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Body style={styles.label}>Preferred States *</Body>
        <View style={styles.chipContainer}>
          {popularStates.map((state) => (
            <TouchableOpacity
              key={state}
              style={[
                styles.chip,
                formData.preferredStates?.includes(state) && styles.chipActive
              ]}
              onPress={() => updateFormData('preferredStates', 
                toggleArrayItem(formData.preferredStates || [], state)
              )}
            >
              <Text style={[
                styles.chipText,
                formData.preferredStates?.includes(state) && styles.chipTextActive
              ]}>
                {state}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Body style={styles.label}>University Type</Body>
        <View style={styles.chipContainer}>
          {universityTypes.map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.chip,
                formData.universityTypes?.includes(type) && styles.chipActive
              ]}
              onPress={() => updateFormData('universityTypes', 
                toggleArrayItem(formData.universityTypes || [], type)
              )}
            >
              <Text style={[
                styles.chipText,
                formData.universityTypes?.includes(type) && styles.chipTextActive
              ]}>
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderPrioritySlider = (label: string, value: number, onChange: (value: number) => void) => (
    <View style={styles.priorityGroup}>
      <View style={styles.priorityHeader}>
        <Body style={styles.priorityLabel}>{label}</Body>
        <Body style={styles.priorityValue}>{value}/5</Body>
      </View>
      <View style={styles.sliderContainer}>
        {[1, 2, 3, 4, 5].map((num) => (
          <TouchableOpacity
            key={num}
            style={[
              styles.sliderDot,
              num <= value && styles.sliderDotActive
            ]}
            onPress={() => onChange(num)}
          />
        ))}
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <H3 style={styles.stepTitle}>Priorities</H3>
      <Body style={styles.stepSubtitle}>Rate the importance of each factor (1 = Low, 5 = High)</Body>
      
      {renderPrioritySlider('Placement Records', formData.placementPriority || 3, 
        (value) => updateFormData('placementPriority', value))}
      
      {renderPrioritySlider('Low Fees', formData.feesPriority || 3, 
        (value) => updateFormData('feesPriority', value))}
      
      {renderPrioritySlider('College Ranking', formData.rankingPriority || 3, 
        (value) => updateFormData('rankingPriority', value))}

      <View style={styles.inputGroup}>
        <Body style={styles.label}>Minimum Star Rating</Body>
        <View style={styles.ratingContainer}>
          {[1, 2, 3, 4, 5].map((rating) => (
            <TouchableOpacity
              key={rating}
              style={styles.starButton}
              onPress={() => updateFormData('minRating', rating)}
            >
              <Ionicons 
                name={rating <= (formData.minRating || 0) ? 'star' : 'star-outline'} 
                size={32} 
                color={rating <= (formData.minRating || 0) ? '#FFC107' : '#E0E0E0'} 
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContainer}>
      <H3 style={styles.stepTitle}>Review & Confirm</H3>
      
      <View style={styles.summaryContainer}>
        <View style={styles.summaryItem}>
          <Body style={styles.summaryLabel}>Courses:</Body>
          <Body style={styles.summaryValue}>
            {formData.preferredCourses?.join(', ') || 'None selected'}
          </Body>
        </View>
        
        <View style={styles.summaryItem}>
          <Body style={styles.summaryLabel}>Budget:</Body>
          <Body style={styles.summaryValue}>
            ₹{formData.budgetRange?.min?.toLocaleString()} - ₹{formData.budgetRange?.max?.toLocaleString()}
          </Body>
        </View>
        
        <View style={styles.summaryItem}>
          <Body style={styles.summaryLabel}>States:</Body>
          <Body style={styles.summaryValue}>
            {formData.preferredStates?.join(', ') || 'None selected'}
          </Body>
        </View>
        
        <View style={styles.summaryItem}>
          <Body style={styles.summaryLabel}>University Types:</Body>
          <Body style={styles.summaryValue}>
            {formData.universityTypes?.join(', ') || 'All types'}
          </Body>
        </View>
      </View>
    </View>
  );

  const isStepValid = () => {
    switch (step) {
      case 1:
        return formData.preferredCourses && formData.preferredCourses.length > 0;
      case 2:
        return formData.budgetRange && formData.preferredStates && formData.preferredStates.length > 0;
      case 3:
      case 4:
        return true;
      default:
        return false;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <H1 style={styles.title}>Setup Preferences</H1>
        <View style={styles.stepIndicator}>
          <Text style={styles.stepText}>{step}/4</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
      </ScrollView>

      <View style={styles.footer}>
        {step > 1 && (
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => setStep(step - 1)}
          >
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={[styles.nextButton, !isStepValid() && styles.nextButtonDisabled]} 
          onPress={handleNext}
          disabled={!isStepValid()}
        >
          <Text style={styles.nextButtonText}>
            {step === 4 ? 'Complete Setup' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  stepIndicator: {
    backgroundColor: '#2196F3',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  stepText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  stepContainer: {
    paddingVertical: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  rangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rangeInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
  },
  rangeSeparator: {
    marginHorizontal: 12,
    fontSize: 14,
    color: '#666',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  chipActive: {
    backgroundColor: '#2196F3',
  },
  chipText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  chipTextActive: {
    color: '#fff',
  },
  priorityGroup: {
    marginBottom: 24,
  },
  priorityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  priorityLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  priorityValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  sliderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  sliderDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sliderDotActive: {
    backgroundColor: '#2196F3',
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
  },
  starButton: {
    padding: 8,
  },
  summaryContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
  },
  summaryItem: {
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    color: '#333',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  backButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#2196F3',
    borderRadius: 8,
    paddingVertical: 12,
    marginRight: 8,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    color: '#2196F3',
    fontWeight: '600',
  },
  nextButton: {
    flex: 2,
    backgroundColor: '#2196F3',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: '#B0BEC5',
  },
  nextButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});
