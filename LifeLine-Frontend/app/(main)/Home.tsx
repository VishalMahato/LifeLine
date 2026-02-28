import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import CommunityPoweredSection from '@/src/features/User/Section/CommunityPoweredSection';
import CoreFeaturesSection from '@/src/features/User/Section/CoreFeaturesSection';
import HeroSection from '@/src/features/User/Section/HeroSection';
import WhyLifeLineSection from '@/src/features/User/Section/WhyLifeLineSec';

export default function Home() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <HeroSection />
      <WhyLifeLineSection />
      <CommunityPoweredSection />
      <CoreFeaturesSection />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    paddingBottom: 36,
  },
});
