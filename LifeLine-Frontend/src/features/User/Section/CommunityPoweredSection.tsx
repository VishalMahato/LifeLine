import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const steps = [
  {
    icon: 'alert-circle-outline' as const,
    color: '#DC2626',
    background: '#FEE2E2',
    title: 'Press SOS',
    description: 'One tap alerts verified helpers and your emergency contacts nearby.',
  },
  {
    icon: 'notifications-outline' as const,
    color: '#2563EB',
    background: '#DBEAFE',
    title: 'Helpers Notified',
    description: 'Nearby responders receive your live location and medical profile.',
  },
  {
    icon: 'heart-outline' as const,
    color: '#16A34A',
    background: '#DCFCE7',
    title: 'Help Arrives',
    description: 'A qualified responder stabilizes the situation until ambulance handoff.',
  },
];

export default function CommunityPoweredSection() {
  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>COMMUNITY POWERED</Text>
      <Text style={styles.title}>Help is closer than you think.</Text>
      <Text style={styles.subtitle}>
        LifeLine connects you with trained medical professionals and vetted volunteers in your
        immediate vicinity.
      </Text>

      <View style={styles.stepsWrapper}>
        {steps.map((step, index) => (
          <View key={step.title} style={styles.stepRow}>
            <View style={styles.iconColumn}>
              <View style={[styles.iconBox, { backgroundColor: step.background }]}>
                <Ionicons name={step.icon} size={22} color={step.color} />
              </View>
              {index !== steps.length - 1 ? <View style={styles.verticalLine} /> : null}
            </View>

            <View style={styles.textColumn}>
              <Text style={styles.stepTitle}>{step.title}</Text>
              <Text style={styles.stepDescription}>{step.description}</Text>
            </View>
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
    backgroundColor: '#FFFFFF',
    marginTop: 36,
  },
  eyebrow: {
    textAlign: 'center',
    color: '#2563EB',
    fontWeight: '700',
    fontSize: 12,
    letterSpacing: 1,
    marginBottom: 8,
  },
  title: {
    textAlign: 'center',
    fontSize: 34,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 17,
    color: '#475569',
    lineHeight: 26,
    marginBottom: 28,
  },
  stepsWrapper: {
    marginTop: 8,
  },
  stepRow: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  iconColumn: {
    alignItems: 'center',
    width: 48,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  verticalLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E2E8F0',
    marginTop: 8,
  },
  textColumn: {
    flex: 1,
    paddingLeft: 16,
  },
  stepTitle: {
    fontSize: 21,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  stepDescription: {
    fontSize: 16,
    color: '#475569',
    lineHeight: 24,
  },
});
