import React, { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Text, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Activity } from 'lucide-react-native';
import { Colors, BorderRadius, Spacing } from '../constants/theme';
import { GlassCard } from '../components/ui/GlassCard';
import api from '../utils/api';

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSignup = async () => {
    if (!name || !email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await api.post('/auth/signup', { name, email, password });
      setSuccess(true);
      setTimeout(() => {
        router.replace('/login');
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Activity size={32} color="white" />
          </View>
          <Text style={styles.title}>Join Calorie Lens</Text>
          <Text style={styles.subtitle}>Start your nutrition journey</Text>
        </View>

        <View style={styles.form}>
          <GlassCard intensity={30} style={styles.card}>
            {success ? (
              <View style={styles.successContainer}>
                <Text style={styles.successText}>Account created successfully!</Text>
                <Text style={styles.successSubtext}>Please check your email to verify your account.</Text>
                <Text style={styles.successSubtext}>Redirecting to login...</Text>
              </View>
            ) : (
              <>
                {error ? <Text style={styles.errorText}>{error}</Text> : null}
                
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="John Doe"
                  placeholderTextColor="#9ca3af"
                  value={name}
                  onChangeText={setName}
                />

                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="your@email.com"
                  placeholderTextColor="#9ca3af"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />

                <Text style={styles.label}>Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#9ca3af"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />

                <TouchableOpacity 
                  style={[styles.button, loading && styles.buttonDisabled]} 
                  onPress={handleSignup}
                  disabled={loading}
                >
                  <Text style={styles.buttonText}>{loading ? 'Creating account...' : 'Sign Up'}</Text>
                </TouchableOpacity>

                <View style={styles.footer}>
                  <Text style={styles.footerText}>Already have an account? </Text>
                  <TouchableOpacity onPress={() => router.push('/login')}>
                    <Text style={styles.linkText}>Login</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </GlassCard>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  scrollContent: {
    padding: Spacing.lg,
    justifyContent: 'center',
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
    marginTop: Spacing.xl,
  },
  logoContainer: {
    backgroundColor: Colors.primary,
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.dark.subtext,
  },
  form: {
    width: '100%',
  },
  card: {
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
  button: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  errorText: {
    color: '#ef4444',
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  successContainer: {
    alignItems: 'center',
    padding: Spacing.md,
  },
  successText: {
    color: Colors.primary,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: Spacing.sm,
  },
  successSubtext: {
    color: 'white',
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.xl,
  },
  footerText: {
    color: Colors.dark.subtext,
  },
  linkText: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
});
