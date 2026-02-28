import React, { useState } from "react";
import { Dimensions, ScrollView, StyleSheet, Text, View } from "react-native";
import {
    heightPercentageToDP as hp,
    widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import Ionicons from '@expo/vector-icons/Ionicons';

const { width } = Dimensions.get("window");

const WhyLifeLineSection = () => {
  const isLargeScreen = wp("100%") >= 768; // Tablet / Laptop breakpoint
  const [currentIndex, setCurrentIndex] = useState(0);

  const cards = [
    {
      icon: "alert-circle",
      iconColor: "#E53935",
      iconBg: "#FDECEA",
      title: "Ambulance Delays",
      desc: "Average ambulance wait times can exceed 15 minutes in urban areas.",
      problemText: "THE PROBLEM",
      problemColor: "#E53935",
    },
    {
      icon: "walk",
      iconColor: "#F9A825",
      iconBg: "#FFF7E0",
      title: "Elderly at Risk",
      desc: "Immediate help is critical for seniors during falls or emergencies.",
      problemText: "THE RISK",
      problemColor: "#F9A825",
    },
    {
      icon: "heart",
      iconColor: "#2F80ED",
      iconBg: "#EAF4FF",
      title: "Quick Response",
      desc: "Get help from verified responders in minutes, not hours.",
      problemText: "THE SOLUTION",
      problemColor: "#2F80ED",
    },
  ];

  const handleScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / width);
    setCurrentIndex(index);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, isLargeScreen && styles.titleLarge]}>
          Why LifeLine?
        </Text>
        {!isLargeScreen && (
          <View style={styles.dots}>
            {cards.map((_, index) => (
              <View
                key={index}
                style={[styles.dot, index === currentIndex && styles.activeDot]}
              />
            ))}
          </View>
        )}
      </View>

      {isLargeScreen ? (
        <View style={styles.largeScreenGrid}>
          {cards.map((card, index) => (
            <View
              key={index}
              style={[styles.card, styles.cardLarge]}
            >
              <View style={[styles.iconBox, { backgroundColor: card.iconBg }]}>
                <Ionicons
                  name={card.icon as any}
                  size={hp("3%")}
                  color={card.iconColor}
                />
              </View>

              <Text
                style={[
                  styles.cardTitle,
                  styles.cardTitleLarge,
                ]}
              >
                {card.title}
              </Text>
              <Text
                style={[styles.cardDesc, styles.cardDescLarge]}
              >
                {card.desc}
              </Text>

              <View style={styles.divider} />

              <Text
                style={[
                  styles.problemText,
                  { color: card.problemColor },
                  styles.problemTextLarge,
                ]}
              >
                {card.problemText}
              </Text>
            </View>
          ))}
        </View>
      ) : (
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          style={styles.scrollView}
        >
          {cards.map((card, index) => (
            <View
              key={index}
              style={[
                styles.cardWrapper,
                isLargeScreen && styles.cardWrapperLarge,
              ]}
            >
              <View style={[styles.card, isLargeScreen && styles.cardLarge]}>
                <View style={[styles.iconBox, { backgroundColor: card.iconBg }]}>
                  <Ionicons
                    name={card.icon as any}
                    size={isLargeScreen ? hp("3%") : hp("2.5%")}
                    color={card.iconColor}
                  />
                </View>

                <Text
                  style={[
                    styles.cardTitle,
                    isLargeScreen && styles.cardTitleLarge,
                  ]}
                >
                  {card.title}
                </Text>
                <Text
                  style={[styles.cardDesc, isLargeScreen && styles.cardDescLarge]}
                >
                  {card.desc}
                </Text>

                <View style={styles.divider} />

                <Text
                  style={[
                    styles.problemText,
                    { color: card.problemColor },
                    isLargeScreen && styles.problemTextLarge,
                  ]}
                >
                  {card.problemText}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

export default WhyLifeLineSection;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: wp("6%"),
    paddingTop: hp("4%"),
    marginTop: hp("5%"),
    backgroundColor: "#FAFAFA",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: hp("3%"),
  },

  title: {
    fontSize: hp("2.8%"),
    fontWeight: "800",
    color: "#0A2540",
  },

  titleLarge: {
    fontSize: hp("3.5%"),
  },

  dots: {
    flexDirection: "row",
    gap: wp("1.5%"),
  },

  dot: {
    width: hp("0.9%"),
    height: hp("0.9%"),
    borderRadius: 50,
    backgroundColor: "#D0D5DD",
  },

  activeDot: {
    backgroundColor: "#2F80ED",
  },

  scrollView: {
    marginHorizontal: -wp("6%"), // to make full width
  },

  largeScreenGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: wp("3%"),
  },

  cardWrapper: {
    width: width,
    paddingHorizontal: wp("6%"),
  },

  cardWrapperLarge: {
    // adjust if needed
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: hp("2%"),
    padding: wp("5%"),
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },

  cardLarge: {
    padding: wp("6%"),
    borderRadius: hp("2.5%"),
  },

  iconBox: {
    width: hp("5%"),
    height: hp("5%"),
    borderRadius: hp("1.5%"),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: hp("2%"),
  },

  cardTitle: {
    fontSize: hp("2.1%"),
    fontWeight: "700",
    color: "#0A2540",
    marginBottom: hp("1%"),
  },

  cardTitleLarge: {
    fontSize: hp("2.5%"),
  },

  cardDesc: {
    fontSize: hp("1.8%"),
    color: "#5F6C7B",
    lineHeight: hp("2.6%"),
  },

  cardDescLarge: {
    fontSize: hp("2%"),
    lineHeight: hp("2.8%"),
  },

  divider: {
    height: 1,
    backgroundColor: "#EEF2F6",
    marginVertical: hp("2%"),
  },

  problemText: {
    fontSize: hp("1.4%"),
    fontWeight: "700",
    letterSpacing: 1,
  },

  problemTextLarge: {
    fontSize: hp("1.6%"),
  },

  viewAll: {
    fontSize: hp("1.7%"),
    fontWeight: "600",
    color: "#2F80ED",
  },

  viewAllLarge: {
    fontSize: hp("2%"),
  },
});
