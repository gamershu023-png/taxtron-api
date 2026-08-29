import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, radius } from '../theme';

interface ImagePreviewProps {
  uri: string;
  onRemove: () => void;
}

export function ImagePreview({ uri, onRemove }: ImagePreviewProps) {
  return (
    <View style={styles.container}>
      <Image source={{ uri }} style={styles.image} resizeMode="cover" />
      <TouchableOpacity
        style={styles.removeBtn}
        onPress={onRemove}
        accessibilityLabel="Remove selected image"
        accessibilityRole="button"
      >
        <Text style={styles.removeText}>✕</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    margin: spacing.md,
  alignSelf: 'flex-start',
  borderRadius: radius.md,
    overflow: 'hidden',
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: radius.md,
  },
  removeBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
});
