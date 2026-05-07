import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, SafeAreaView, RefreshControl } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'expo-router';
import { Activity, Zap, Apple, Droplet, Utensils, Plus } from 'lucide-react-native';
import { Colors, BorderRadius, Spacing } from '../../constants/theme';
import { GlassCard } from '../../components/ui/GlassCard';
import { setTodayStats } from '../../store/slices/dashboardSlice';
import api from '../../utils/api';

export default function DashboardScreen() {
  const dispatch = useDispatch();
  const router = useRouter();
  const todayStats = useSelector((state: any) => state.dashboard.todayStats);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(!todayStats);

  const fetchStats = async () => {
    try {
      const response = await api.get('/food/today');
      dispatch(setTodayStats(response.data));
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  if (loading && !todayStats) {
    return (
      <View style={[styles.container, styles.center]}>
        <Activity size={48} color={Colors.primary} />
        <Text style={styles.loadingText}>Loading your daily summary...</Text>
      </View>
    );
  }

  const { stats, items } = todayStats || { stats: { caloriesConsumed: 0, protein: { consumed: 0, goal: 150 }, carbs: { consumed: 0, goal: 250 }, fat: { consumed: 0, goal: 70 }, caloriesGoal: 2000 }, items: [] };
  
  const calGoal = stats.caloriesGoal || 2000;
  const calPercent = Math.min(100, Math.round((stats.caloriesConsumed / calGoal) * 100));

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Daily Summary</Text>
            <Text style={styles.date}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</Text>
          </View>
          <TouchableOpacity style={styles.profileBtn} onPress={() => router.push('/profile')}>
            <Activity size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Calories Card */}
        <GlassCard intensity={40} style={styles.caloriesCard}>
          <View style={styles.caloriesInfo}>
            <View>
              <Text style={styles.caloriesValue}>{stats.caloriesConsumed}</Text>
              <Text style={styles.caloriesLabel}>Calories Consumed</Text>
            </View>
            <View style={styles.caloriesProgressContainer}>
              <View style={styles.progressRingOuter}>
                <View style={[styles.progressRingInner, { height: `${calPercent}%` }]} />
                <Text style={styles.percentText}>{calPercent}%</Text>
              </View>
            </View>
          </View>
          <View style={styles.caloriesGoalContainer}>
            <Text style={styles.goalText}>Daily Goal: {calGoal} kcal</Text>
            <View style={styles.goalBarBase}>
              <View style={[styles.goalBarProgress, { width: `${calPercent}%` }]} />
            </View>
          </View>
        </GlassCard>

        {/* Macros Grid */}
        <View style={styles.macrosGrid}>
          <MacroCard 
            title="Protein" 
            value={stats.protein.consumed} 
            goal={stats.protein.goal} 
            color="#3b82f6" 
            icon={<Utensils size={16} color="#3b82f6" />}
          />
          <MacroCard 
            title="Carbs" 
            value={stats.carbs.consumed} 
            goal={stats.carbs.goal} 
            color="#a855f7" 
            icon={<Apple size={16} color="#a855f7" />}
          />
          <MacroCard 
            title="Fat" 
            value={stats.fat.consumed} 
            goal={stats.fat.goal} 
            color="#eab308" 
            icon={<Droplet size={16} color="#eab308" />}
          />
        </View>

        {/* Recent Logs */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Log</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        {items.length === 0 ? (
          <GlassCard style={styles.emptyCard}>
            <Text style={styles.emptyText}>No food logged yet today.</Text>
          </GlassCard>
        ) : (
          items.map((item: any, index: number) => (
            <GlassCard key={item._id || index} style={styles.logItem}>
              <View style={styles.logHeader}>
                <Text style={styles.logName}>{item.name}</Text>
                <Text style={styles.logCalories}>{item.calories} kcal</Text>
              </View>
              <View style={styles.logDetails}>
                <Text style={styles.logMacro}>P: {item.protein}g</Text>
                <Text style={styles.logMacro}>C: {item.carbs}g</Text>
                <Text style={styles.logMacro}>F: {item.fat}g</Text>
              </View>
            </GlassCard>
          ))
        )}
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={() => router.push('/modal')}>
        <Plus size={32} color="black" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

function MacroCard({ title, value, goal, color, icon }: any) {
  const percent = Math.min(100, Math.round((value / goal) * 100));
  return (
    <GlassCard style={styles.macroCard}>
      <View style={styles.macroHeader}>
        {icon}
        <Text style={styles.macroTitle}>{title}</Text>
      </View>
      <Text style={styles.macroValue}>{value}g</Text>
      <Text style={styles.macroGoal}>of {goal}g</Text>
      <View style={styles.macroBarBase}>
        <View style={[styles.macroBarProgress, { width: `${percent}%`, backgroundColor: color }]} />
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: 100,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: Colors.dark.subtext,
    marginTop: Spacing.md,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    marginTop: Spacing.sm,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  date: {
    color: Colors.dark.subtext,
    fontSize: 16,
  },
  profileBtn: {
    backgroundColor: Colors.primary,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  caloriesCard: {
    marginBottom: Spacing.lg,
  },
  caloriesInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  caloriesValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
  },
  caloriesLabel: {
    color: Colors.dark.subtext,
    fontSize: 14,
  },
  caloriesProgressContainer: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressRingOuter: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  progressRingInner: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: Colors.primary,
    opacity: 0.3,
  },
  percentText: {
    color: 'white',
    fontWeight: 'bold',
  },
  caloriesGoalContainer: {
    marginTop: Spacing.sm,
  },
  goalText: {
    color: 'white',
    fontSize: 14,
    marginBottom: Spacing.xs,
  },
  goalBarBase: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  goalBarProgress: {
    height: '100%',
    backgroundColor: Colors.primary,
  },
  macrosGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  macroCard: {
    flex: 1,
    padding: Spacing.sm,
  },
  macroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
    gap: 4,
  },
  macroTitle: {
    color: Colors.dark.subtext,
    fontSize: 12,
    fontWeight: '600',
  },
  macroValue: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  macroGoal: {
    color: Colors.dark.subtext,
    fontSize: 10,
    marginBottom: Spacing.xs,
  },
  macroBarBase: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  macroBarProgress: {
    height: '100%',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  seeAll: {
    color: Colors.primary,
    fontWeight: '600',
  },
  emptyCard: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    color: Colors.dark.subtext,
  },
  logItem: {
    marginBottom: Spacing.sm,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  logName: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  logCalories: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
  logDetails: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  logMacro: {
    color: Colors.dark.subtext,
    fontSize: 12,
  },
  fab: {
    position: 'absolute',
    right: Spacing.lg,
    bottom: 80,
    backgroundColor: Colors.primary,
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});
