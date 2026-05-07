import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Image, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Image as ImageIcon, Send, X, Check } from 'lucide-react-native';
import { Colors, BorderRadius, Spacing } from '../constants/theme';
import { GlassCard } from '../components/ui/GlassCard';
import api from '../utils/api';

export default function LogFoodModal() {
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingUser, setFetchingUser] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [image, setImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const router = useRouter();

  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get('/auth/me');
        setUser(response.data.data);
      } catch (err) {
        console.error("Failed to fetch user:", err);
      } finally {
        setFetchingUser(false);
      }
    };
    fetchUser();
  }, []);

  const isSubscribed = user && (
    user.subscriptionStatus === 'active' ||
    (user.subscriptionStatus === 'trialing' && new Date(user.trialEndDate) > new Date())
  );

  const pickImage = async (useCamera: boolean) => {
    let result;
    if (useCamera) {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'We need camera access to analyze your food.');
        return;
      }
      result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.7,
        base64: true,
      });
    } else {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.7,
        base64: true,
      });
    }

    if (!result.canceled && result.assets[0].base64) {
      setImage(result.assets[0].uri);
      analyzeImage(result.assets[0].base64, result.assets[0].mimeType || 'image/jpeg');
    }
  };

  const analyzeImage = async (base64: string, mimeType: string) => {
    setLoading(true);
    setAnalysis(null);
    try {
      const formData = new FormData();
      // On mobile, we might need to handle FormData differently or use a different endpoint
      // if the backend expects a multipart form with a file.
      // However, our backend also takes base64 in the analyzeFoodByImage function.
      // Let's try to send it as a file first.

      const filename = image ? image.split('/').pop() : 'food.jpg';
      const file: any = {
        uri: image,
        name: filename,
        type: mimeType,
      };
      formData.append('file', file);

      const response = await api.post('/food/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setAnalysis(response.data);
    } catch (err: any) {
      Alert.alert('Analysis Failed', err.response?.data?.error || 'Could not analyze image');
    } finally {
      setLoading(false);
    }
  };

  const handleTextLog = async () => {
    if (!userInput && !analysis) return;

    setLoading(true);
    try {
      const payload: any = {
        userInput: userInput,
      };
      if (analysis) {
        payload.aiData = analysis;
      }

      await api.post('/food/log', payload);
      router.back();
    } catch (err: any) {
      Alert.alert('Logging Failed', err.response?.data?.error || 'Could not log food');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Log Your Meal</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <X size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {fetchingUser ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Verifying subscription...</Text>
          </View>
        ) : !isSubscribed ? (
          <View style={styles.premiumContainer}>
            <View style={styles.premiumIconContainer}>
              <Check size={40} color={Colors.primary} />
            </View>
            <Text style={styles.premiumTitle}>Premium Feature</Text>
            <Text style={styles.premiumText}>
              Logging food and AI analysis are premium features. Please upgrade your plan or start a free trial on our website to continue.
            </Text>
            <TouchableOpacity
              style={styles.premiumBtn}
              onPress={() => router.back()}
            >
              <Text style={styles.premiumBtnText}>Got it</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={styles.label}>Describe your meal</Text>
            <GlassCard style={styles.inputCard}>
              <TextInput
                style={styles.textInput}
                placeholder="E.g. Two eggs and a toast"
                placeholderTextColor="#9ca3af"
                value={userInput}
                onChangeText={setUserInput}
                multiline
              />
            </GlassCard>

            <View style={styles.divider}>
              <View style={styles.line} />
              <Text style={styles.orText}>OR</Text>
              <View style={styles.line} />
            </View>

            <View style={styles.imageActions}>
              <TouchableOpacity style={styles.imageBtn} onPress={() => pickImage(true)}>
                <Camera size={24} color="white" />
                <Text style={styles.imageBtnText}>Camera</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.imageBtn} onPress={() => pickImage(false)}>
                <ImageIcon size={24} color="white" />
                <Text style={styles.imageBtnText}>Gallery</Text>
              </TouchableOpacity>
            </View>

            {image && (
              <View style={styles.previewContainer}>
                <Image source={{ uri: image }} style={styles.preview} />
                <TouchableOpacity style={styles.removeImage} onPress={() => { setImage(null); setAnalysis(null); }}>
                  <X size={16} color="white" />
                </TouchableOpacity>
              </View>
            )}

            {loading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.loadingText}>Analyzing food data...</Text>
              </View>
            )}

            {analysis && (
              <GlassCard style={styles.analysisCard}>
                <Text style={styles.analysisTitle}>Analysis Results</Text>
                {analysis.items.map((item: any, idx: number) => (
                  <View key={idx} style={styles.analysisItem}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemCals}>{item.calories} kcal</Text>
                  </View>
                ))}
                <View style={styles.analysisTotal}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalValue}>{analysis.total.calories} kcal</Text>
                </View>
              </GlassCard>
            )}
          </>
        )}
      </ScrollView>

      {isSubscribed && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.logBtn, (!userInput && !analysis) && styles.logBtnDisabled]}
            onPress={handleTextLog}
            disabled={loading || (!userInput && !analysis)}
          >
            <Text style={styles.logBtnText}>
              {analysis ? 'Confirm Log' : 'Analyze & Log'}
            </Text>
            <Check size={20} color="black" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  closeBtn: {
    padding: 4,
  },
  content: {
    padding: Spacing.md,
  },
  label: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  inputCard: {
    padding: 0,
    marginBottom: Spacing.lg,
  },
  textInput: {
    color: 'white',
    padding: Spacing.md,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.dark.border,
  },
  orText: {
    color: Colors.dark.subtext,
    paddingHorizontal: Spacing.md,
    fontSize: 12,
    fontWeight: 'bold',
  },
  imageActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  imageBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: 8,
  },
  imageBtnText: {
    color: 'white',
    fontWeight: '600',
  },
  previewContainer: {
    marginBottom: Spacing.lg,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    height: 200,
    position: 'relative',
  },
  preview: {
    width: '100%',
    height: '100%',
  },
  removeImage: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 12,
    padding: 4,
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  loadingText: {
    color: Colors.dark.subtext,
    marginTop: Spacing.sm,
  },
  analysisCard: {
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  analysisTitle: {
    color: Colors.primary,
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: Spacing.md,
  },
  analysisItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  itemName: {
    color: 'white',
  },
  itemCals: {
    color: Colors.dark.subtext,
  },
  analysisTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
  },
  totalLabel: {
    color: 'white',
    fontWeight: 'bold',
  },
  totalValue: {
    color: Colors.primary,
    fontWeight: 'bold',
    fontSize: 18,
  },
  footer: {
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
  },
  logBtn: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: 8,
  },
  logBtnDisabled: {
    opacity: 0.5,
  },
  logBtnText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 18,
  },
  premiumContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  premiumIconContainer: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(52, 211, 153, 0.1)',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  premiumTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: Spacing.sm,
  },
  premiumText: {
    color: Colors.dark.subtext,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing.xl,
  },
  premiumBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  premiumBtnText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
