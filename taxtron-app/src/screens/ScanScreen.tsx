import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ImagePreview } from '../components/ImagePreview';
import { EmptyState } from '../components/EmptyState';
import { colors, spacing, radius, typography, shadows } from '../theme';

export function ScanScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);

  async function requestCamera() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Camera permission needed',
        'Taxtron needs camera access to photograph textbook pages and questions.',
      );
      return false;
    }
    return true;
  }

  async function openCamera() {
    const granted = await requestCamera();
    if (!granted) return;
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  }

  async function openGallery() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Storage permission needed',
        'Taxtron needs storage access to select photos from your device.',
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  }

  function removeImage() {
    setImageUri(null);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Scan</Text>
      <Text style={styles.subtitle}>
        Photograph a textbook page, question, diagram, or handwritten solution.
        Image analysis will be available in a future update.
      </Text>

      {imageUri ? (
        <View style={styles.previewSection}>
          <ImagePreview uri={imageUri} onRemove={removeImage} />
          <Text style={styles.previewHint}>
            Image captured. Send-to-AI analysis is coming soon.
          </Text>
        </View>
      ) : (
        <EmptyState
          icon="📷"
          title="No image selected"
          message="Use your camera or pick a photo from your gallery to get started."
        />
      )}

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={openCamera} activeOpacity={0.7} accessibilityRole="button" accessibilityLabel="Open camera">
          <Text style={styles.actionIcon}>📷</Text>
          <Text style={styles.actionLabel}>Camera</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} onPress={openGallery} activeOpacity={0.7} accessibilityRole="button" accessibilityLabel="Pick from gallery">
          <Text style={styles.actionIcon}>🖼️</Text>
          <Text style={styles.actionLabel}>Gallery</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  title: {
    ...typography.heading,
    fontSize: 28,
    color: colors.textMain,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    fontSize: 15,
    color: colors.textMuted,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  previewSection: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  previewHint: {
    ...typography.caption,
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    ...shadows.card,
  },
  actionIcon: {
    fontSize: 28,
    marginBottom: spacing.sm,
  },
  actionLabel: {
    ...typography.heading,
    fontSize: 15,
    color: colors.textMain,
  },
});
