import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { User, LogOut, ChevronRight, Shield, Bell, CreditCard } from 'lucide-react-native';
import { Colors, BorderRadius, Spacing } from '../constants/theme';
import { GlassCard } from '../components/ui/GlassCard';

export default function ProfileScreen() {
  const router = useRouter();

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync('token');
    router.replace('/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Profile</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <User size={40} color="white" />
          </View>
          <Text style={styles.userName}>User Name</Text>
          <Text style={styles.userEmail}>user@example.com</Text>
        </View>

        <View style={styles.menuSection}>
          <MenuItem icon={<User size={20} color={Colors.primary} />} title="Edit Profile" />
          <MenuItem icon={<CreditCard size={20} color={Colors.primary} />} title="Subscription" />
          <MenuItem icon={<Bell size={20} color={Colors.primary} />} title="Notifications" />
          <MenuItem icon={<Shield size={20} color={Colors.primary} />} title="Privacy & Security" />
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <LogOut size={20} color="#ef4444" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function MenuItem({ icon, title }: any) {
  return (
    <GlassCard style={styles.menuItem}>
      <View style={styles.menuItemLeft}>
        {icon}
        <Text style={styles.menuItemTitle}>{title}</Text>
      </View>
      <ChevronRight size={20} color={Colors.dark.subtext} />
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  content: {
    padding: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  backBtn: {
    padding: 8,
  },
  backText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  userEmail: {
    color: Colors.dark.subtext,
    fontSize: 16,
  },
  menuSection: {
    marginBottom: Spacing.xl,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuItemTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: Spacing.md,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  logoutText: {
    color: '#ef4444',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
