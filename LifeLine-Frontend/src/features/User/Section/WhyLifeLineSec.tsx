import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useMemo, useState } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

const cards = [
  {
    icon: 'alert-circle-outline' as const,
    iconColor: '#DC2626',
    iconBg: '#FEE2E2',
    title: 'Ambulance Delays',
    description: 'Average ambulance wait times can exceed 15 minutes in crowded areas.',
    label: 'THE PROBLEM',
  },
  {
    icon: 'walk-outline' as const,
    iconColor: '#CA8A04',
    iconBg: '#FEF9C3',
    title: 'Elderly at Risk',
    description: 'Immediate local support matters most during falls and sudden medical events.',
    label: 'THE RISK',
  },
  {
    icon: 'heart-outline' as const,
    iconColor: '#2563EB',
    iconBg: '#DBEAFE',
    title: 'Quick Response',
    description: 'Verified nearby responders can reach you in minutes, not hours.',
    label: 'THE SOLUTION',
  },
];

export default function WhyLifeLineSection() {
  const { width } = useWindowDimensions();
  const [currentIndex, setCurrentIndex] = useState(0);

  const cardWidth = useMemo(() => Math.max(280, Math.min(440, width - 48)), [width]);
  const pageWidth = cardWidth + 16;

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / pageWidth);
    const safeIndex = Math.min(cards.length - 1, Math.max(0, index));
    setCurrentIndex(safeIndex);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Why LifeLine?</Text>
        <View style={styles.dots}>
          {cards.map((_, index) => (
            <View key={index} style={[styles.dot, currentIndex === index && styles.activeDot]} />
          ))}
        </View>
      </View>

      <ScrollView
        horizontal
        pagingEnabled
        snapToInterval={pageWidth}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {cards.map((card) => (
          <View key={card.title} style={[styles.card, { width: cardWidth }]}>
            <View style={[styles.iconBox, { backgroundColor: card.iconBg }]}>
              <Ionicons name={card.icon} size={24} color={card.iconColor} />
            </View>

            <Text style={styles.cardTitle}>{card.title}</Text>
            <Text style={styles.cardDescription}>{card.description}</Text>

            <View style={styles.divider} />
            <Text style={[styles.cardLabel, { color: card.iconColor }]}>{card.label}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingTop: 36,
    marginTop: 28,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#0F172A',
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 99,
    backgroundColor: '#CBD5E1',
  },
  activeDot: {
    backgroundColor: '#2563EB',
  },
  scrollContent: {
    paddingRight: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    marginRight: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 16,
    lineHeight: 24,
    color: '#475569',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 16,
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
});
