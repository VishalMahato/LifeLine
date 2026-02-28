import { ScrollView, StyleSheet } from 'react-native'
import React from 'react'
import HeroSection from '@/src/features/User/Section/HeroSection'
import WhyLifeLineSection from '@/src/features/User/Section/WhyLifeLineSec'
import CommunityPoweredSection from '@/src/features/User/Section/CommunityPoweredSection'
import CoreFeaturesSection from '@/src/features/User/Section/CoreFeaturesSection'
import VerifiedHelpersSection from '@/src/features/User/Section/VerifiedHelpersSection'
import RealImpactSection from '@/src/features/User/Section/RealImpactSection'
import PrivacySection from '@/src/features/User/Section/PrivacySection'
import FooterCTASection from '@/src/features/User/Component/FooterCTASection'
import { widthPercentageToDP as wp } from 'react-native-responsive-screen'

export default function Home() {
  const isLargeScreen = wp('100%') >= 768

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        isLargeScreen && styles.containerLarge,
      ]}
    >
      <HeroSection />
      <WhyLifeLineSection />
      <CommunityPoweredSection />
      <CoreFeaturesSection />
      <VerifiedHelpersSection />
      <RealImpactSection />
      <PrivacySection />
      <FooterCTASection />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  containerLarge: {
    alignItems: 'center',
    maxWidth: 1200,
    alignSelf: 'center',
  },
})
