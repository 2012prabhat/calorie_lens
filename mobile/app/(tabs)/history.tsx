import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Dimensions, SafeAreaView, ActivityIndicator, RefreshControl } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { BarChart, LineChart } from 'react-native-chart-kit';
import { TrendingUp, Scale, CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { Colors, BorderRadius, Spacing } from '../../constants/theme';
import { GlassCard } from '../../components/ui/GlassCard';
import { setHistoryData, setWeightData } from '../../store/slices/historySlice';
import api from '../../utils/api';

const screenWidth = Dimensions.get('window').width;

export default function HistoryScreen() {
  const dispatch = useDispatch();
  const historyData = useSelector((state: any) => state.history.data);
  const weightData = useSelector((state: any) => state.history.weightData);
  const [loading, setLoading] = useState(!historyData);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);

  const fetchData = async (pageNum: number) => {
    try {
      const [foodRes, weightRes] = await Promise.all([
        api.get(`/food/history?page=${pageNum}`),
        api.get('/weight/history')
      ]);
      dispatch(setHistoryData({ data: foodRes.data, page: pageNum }));
      dispatch(setWeightData(weightRes.data));
    } catch (err) {
      console.error('Failed to fetch history:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData(page);
  }, [page]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData(page);
  };

  if (loading && !historyData) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const chartConfig = {
    backgroundGradientFrom: '#111827',
    backgroundGradientTo: '#111827',
    color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.6,
    useShadowColorFromDataset: false,
    labelColor: (opacity = 1) => `rgba(156, 163, 175, ${opacity})`,
  };

  const calorieChartData = {
    labels: historyData?.history?.map((d: any) => d.displayDate.split(' ')[0]) || [],
    datasets: [{
      data: historyData?.history?.map((d: any) => d.calories) || [],
    }]
  };

  const weightChartData = {
    labels: weightData?.history?.slice(-7).map((d: any) => d.displayDate.split('/')[0]) || [],
    datasets: [{
      data: weightData?.history?.slice(-7).map((d: any) => d.weight) || [],
    }]
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        <Text style={styles.title}>History</Text>

        {/* Calories Chart */}
        <GlassCard style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <TrendingUp size={20} color={Colors.primary} />
            <Text style={styles.chartTitle}>7-Day Calories</Text>
          </View>
          {calorieChartData.labels.length > 0 ? (
            <BarChart
              data={calorieChartData}
              width={screenWidth - 64}
              height={220}
              chartConfig={chartConfig}
              style={styles.chart}
              fromZero
              showValuesOnTopOfBars
            />
          ) : (
            <Text style={styles.emptyText}>No data available</Text>
          )}
        </GlassCard>

        {/* Weight Chart */}
        <GlassCard style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Scale size={20} color="#06b6d4" />
            <Text style={styles.chartTitle}>Weight Journey</Text>
          </View>
          {weightChartData.datasets[0].data.length > 0 ? (
            <LineChart
              data={weightChartData}
              width={screenWidth - 64}
              height={220}
              chartConfig={{...chartConfig, color: (opacity = 1) => `rgba(6, 182, 212, ${opacity})` }}
              style={styles.chart}
              bezier
            />
          ) : (
            <Text style={styles.emptyText}>No weight logs found</Text>
          )}
        </GlassCard>

        {/* Daily Breakdown */}
        <View style={styles.sectionHeader}>
          <CalendarDays size={20} color={Colors.primary} />
          <Text style={styles.sectionTitle}>Daily Breakdown</Text>
        </View>

        {historyData?.history?.slice().reverse().map((day: any) => (
          <GlassCard key={day.date} style={styles.dayCard}>
            <View style={styles.dayHeader}>
              <Text style={styles.dayDate}>{day.displayDate}</Text>
              <Text style={[styles.dayCalories, { color: day.calories > historyData.goalCalories ? '#f97316' : Colors.primary }]}>
                {day.calories} kcal
              </Text>
            </View>
            <View style={styles.macroRow}>
              <Text style={styles.macroItem}>P: {day.protein}g</Text>
              <Text style={styles.macroItem}>C: {day.carbs}g</Text>
              <Text style={styles.macroItem}>F: {day.fat}g</Text>
            </View>
          </GlassCard>
        ))}
      </ScrollView>
    </SafeAreaView>
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
  chartCard: {
    marginBottom: Spacing.lg,
    padding: Spacing.md,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: Spacing.md,
  },
  chartTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  chart: {
    borderRadius: BorderRadius.md,
    marginRight: -16,
  },
  emptyText: {
    color: Colors.dark.subtext,
    textAlign: 'center',
    marginVertical: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: Spacing.md,
    marginTop: Spacing.sm,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  dayCard: {
    marginBottom: Spacing.sm,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  dayDate: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  dayCalories: {
    fontWeight: 'bold',
  },
  macroRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  macroItem: {
    color: Colors.dark.subtext,
    fontSize: 12,
  },
});
