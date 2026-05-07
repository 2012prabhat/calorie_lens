import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, SafeAreaView, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Target, Zap, ChevronRight, Save } from 'lucide-react-native';
import { Colors, BorderRadius, Spacing } from '../../constants/theme';
import { GlassCard } from '../../components/ui/GlassCard';
import { setCurrentPlan } from '../../store/slices/planSlice';
import api from '../../utils/api';

export default function PlanScreen() {
  const dispatch = useDispatch();
  const currentPlan = useSelector((state: any) => state.plan.currentPlan);
  const [loading, setLoading] = useState(!currentPlan);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('male');
  const [activityLevel, setActivityLevel] = useState('moderate');

  useEffect(() => {
    fetchPlan();
  }, []);

  useEffect(() => {
    if (currentPlan) {
      setWeight(currentPlan.weight?.toString() || '');
      setHeight(currentPlan.height?.toString() || '');
      setAge(currentPlan.age?.toString() || '');
      setGender(currentPlan.gender || 'male');
      setActivityLevel(currentPlan.activityLevel || 'moderate');
    }
  }, [currentPlan]);

  const fetchPlan = async () => {
    try {
      const response = await api.get('/plan');
      dispatch(setCurrentPlan(response.data));
    } catch (err) {
      console.error('Failed to fetch plan:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await api.post('/plan', {
        weight: Number(weight),
        height: Number(height),
        age: Number(age),
        gender,
        activityLevel,
      });
      dispatch(setCurrentPlan(response.data));
      Alert.alert('Success', 'Plan updated successfully!');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to update plan');
    } finally {
      setSaving(false);
    }
  };

  if (loading && !currentPlan) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Nutrition Plan</Text>

        <GlassCard style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Zap size={24} color={Colors.primary} />
            <Text style={styles.summaryTitle}>Current Targets</Text>
          </View>
          <View style={styles.targetsGrid}>
            <TargetItem label="Calories" value={`${currentPlan?.dailyCalories || 2000} kcal`} />
            <TargetItem label="Protein" value={`${currentPlan?.protein || 150}g`} />
            <TargetItem label="Carbs" value={`${currentPlan?.carbs || 250}g`} />
            <TargetItem label="Fat" value={`${currentPlan?.fat || 70}g`} />
          </View>
        </GlassCard>

        <Text style={styles.sectionTitle}>Calculate Your Plan</Text>
        
        <GlassCard style={styles.formCard}>
          <Text style={styles.label}>Weight (kg)</Text>
          <TextInput
            style={styles.input}
            value={weight}
            onChangeText={setWeight}
            keyboardType="numeric"
            placeholder="70"
            placeholderTextColor="#9ca3af"
          />

          <Text style={styles.label}>Height (cm)</Text>
          <TextInput
            style={styles.input}
            value={height}
            onChangeText={setHeight}
            keyboardType="numeric"
            placeholder="175"
            placeholderTextColor="#9ca3af"
          />

          <Text style={styles.label}>Age</Text>
          <TextInput
            style={styles.input}
            value={age}
            onChangeText={setAge}
            keyboardType="numeric"
            placeholder="25"
            placeholderTextColor="#9ca3af"
          />

          <TouchableOpacity 
            style={[styles.saveBtn, saving && styles.saveBtnDisabled]} 
            onPress={handleSave}
            disabled={saving}
          >
            <Save size={20} color="black" />
            <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Update Plan'}</Text>
          </TouchableOpacity>
        </GlassCard>
      </ScrollView>
    </SafeAreaView>
  );
}

function TargetItem({ label, value }: any) {
  return (
    <View style={styles.targetItem}>
      <Text style={styles.targetLabel}>{label}</Text>
      <Text style={styles.targetValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: 80,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: Spacing.lg,
    marginTop: Spacing.sm,
  },
  summaryCard: {
    marginBottom: Spacing.xl,
    padding: Spacing.md,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: Spacing.lg,
  },
  summaryTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  targetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  targetItem: {
    width: '47%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  targetLabel: {
    color: Colors.dark.subtext,
    fontSize: 12,
    marginBottom: 4,
  },
  targetValue: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  sectionTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: Spacing.md,
  },
  formCard: {
    padding: Spacing.md,
  },
  label: {
    color: 'white',
    marginBottom: Spacing.xs,
    fontWeight: '600',
    marginTop: Spacing.sm,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    color: 'white',
    marginBottom: Spacing.md,
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: 8,
    marginTop: Spacing.md,
  },
  saveBtnDisabled: {
    opacity: 0.7,
  },
  saveBtnText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
