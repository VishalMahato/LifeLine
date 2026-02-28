import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const features = [
  {
    icon: 'flash-outline' as const,
    title: 'One-Tap SOS',
    description: 'Trigger emergency alerts instantly without friction.',
  },
  {
    icon: 'navigate-outline' as const,
    title: 'Live Tracking',
    description: 'Share real-time location updates with helpers and family.',
  },
  {
    icon: 'medkit-outline' as const,
    title: 'Medical ID',
    description: 'Send critical medical information automatically.',
  },
  {
    icon: 'shield-checkmark-outline' as const,
    title: 'Vetted Helpers',
    description: 'Trained and verified responders only.',
  },
];

export default function CoreFeaturesSection() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Core Features</Text>

      <View style={styles.grid}>
        {features.map((feature) => (
          <View key={feature.title} style={styles.card}>
            <View style={styles.iconBox}>
              <Ionicons name={feature.icon} size={24} color="#2563EB" />
            </View>

            <Text style={styles.cardTitle}>{feature.title}</Text>
            <Text style={styles.cardDescription}>{feature.description}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingVertical: 42,
    marginTop: 28,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 24,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 16,
  },
  card: {
    width: '48.5%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderColor: '#E2E8F0',
    borderWidth: 1,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
});
