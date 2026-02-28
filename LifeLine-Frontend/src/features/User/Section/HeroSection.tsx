import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { Image, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

export default function HeroSection() {
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768;

  return (
    <View style={styles.container}>
      <View style={styles.badge}>
        <View style={styles.dot} />
        <Text style={[styles.badgeText, isLargeScreen && styles.badgeTextLarge]}>
          NOW AVAILABLE IN YOUR AREA
        </Text>
      </View>

      <Text style={[styles.heading, isLargeScreen && styles.headingLarge]}>
        Emergency help in <Text style={styles.highlight}>minutes</Text>, not hours.
      </Text>

      <Text style={[styles.subText, isLargeScreen && styles.subTextLarge]}>
        Connect with nearby verified first responders instantly when every second counts.
      </Text>

      <View style={[styles.phoneWrapper, isLargeScreen && styles.phoneWrapperLarge]}>
        <Image source={require('../../../../assets/images/phone.png')} style={styles.phoneImage} />
      </View>

      <Pressable style={styles.primaryBtn}>
        <Ionicons name="download-outline" size={20} color="#FFFFFF" />
        <Text style={styles.primaryText}>Download App</Text>
      </Pressable>

      <Pressable style={styles.secondaryBtn}>
        <Text style={styles.secondaryText}>Become a Helper</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 28,
    backgroundColor: '#FFFFFF',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DBEAFE',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    marginBottom: 14,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 999,
    backgroundColor: '#2563EB',
    marginRight: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  badgeTextLarge: {
    fontSize: 13,
  },
  heading: {
    textAlign: 'center',
    fontSize: 34,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 42,
    marginBottom: 12,
    maxWidth: 860,
  },
  headingLarge: {
    fontSize: 42,
    lineHeight: 50,
  },
  highlight: {
    color: '#2563EB',
  },
  subText: {
    textAlign: 'center',
    fontSize: 18,
    color: '#475569',
    lineHeight: 28,
    marginBottom: 28,
    maxWidth: 760,
  },
  subTextLarge: {
    fontSize: 20,
    lineHeight: 30,
  },
  phoneWrapper: {
    width: '85%',
    maxWidth: 540,
    aspectRatio: 9 / 16,
    marginBottom: 24,
  },
  phoneWrapperLarge: {
    maxWidth: 600,
  },
  phoneImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  primaryBtn: {
    width: '100%',
    maxWidth: 460,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  primaryText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  secondaryBtn: {
    width: '100%',
    maxWidth: 460,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#0F172A',
  },
});
