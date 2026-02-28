import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { Link, Stack } from 'expo-router';
import { useTheme } from '@/theme/useTheme';

export default function NotFoundScreen() {
  const theme = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -10,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [fadeAnim, scaleAnim, floatAnim]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.default,
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing.xl,
    },
    content: {
      alignItems: 'center',
      maxWidth: 400,
    },
    iconContainer: {
      marginBottom: theme.spacing.xl,
    },
    heartbeatIcon: {
      fontSize: 80,
      marginBottom: theme.spacing.md,
    },
    errorCode: {
      fontSize: 120,
      fontWeight: '800',
      color: theme.colors.status.error,
      letterSpacing: -4,
      marginBottom: theme.spacing.sm,
      textAlign: 'center',
    },
    title: {
      ...theme.typography.h2,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.sm,
      textAlign: 'center',
    },
    description: {
      ...theme.typography.body,
      color: theme.colors.text.secondary,
      textAlign: 'center',
      marginBottom: theme.spacing.lg,
      lineHeight: 24,
    },
    buttonContainer: {
      width: '100%',
      gap: theme.spacing.md,
      marginTop: theme.spacing.lg,
    },
    primaryButton: {
      backgroundColor: theme.colors.status.error,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.xl,
      borderRadius: 12,
      alignItems: 'center',
      shadowColor: theme.colors.status.error,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    primaryButtonText: {
      ...theme.typography.button,
      color: '#FFFFFF',
      fontSize: 16,
    },
    secondaryButton: {
      backgroundColor: theme.colors.background.paper,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.xl,
      borderRadius: 12,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border.default,
    },
    secondaryButtonText: {
      ...theme.typography.button,
      color: theme.colors.text.primary,
      fontSize: 16,
    },
    decorativeCircle: {
      position: 'absolute',
      width: 300,
      height: 300,
      borderRadius: 150,
      backgroundColor: theme.colors.status.error,
      opacity: 0.05,
      top: -100,
      right: -100,
    },
    decorativeCircle2: {
      position: 'absolute',
      width: 200,
      height: 200,
      borderRadius: 100,
      backgroundColor: theme.colors.brand.primary,
      opacity: 0.05,
      bottom: -50,
      left: -50,
    },
  });

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.container}>
        <View style={styles.decorativeCircle} />
        <View style={styles.decorativeCircle2} />

        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Animated.View
            style={[
              styles.iconContainer,
              {
                transform: [{ translateY: floatAnim }],
              },
            ]}
          >
            <Text style={styles.heartbeatIcon}>💔</Text>
          </Animated.View>

          <Text style={styles.errorCode}>404</Text>
          <Text style={styles.title}>Page Not Found</Text>

          <Text style={styles.description}>
            Oops! This page seems to be out of reach. Don&apos;t worry, LifeLine is here to help you
            find your way back.
          </Text>

          <View style={styles.buttonContainer}>
            <Link href="/" asChild>
              <Pressable style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>🏠 Go to Home</Text>
              </Pressable>
            </Link>

            <Pressable
              style={styles.secondaryButton}
              onPress={() => {
                if (typeof window !== 'undefined' && window.history.length > 1) {
                  window.history.back();
                }
              }}
            >
              <Text style={styles.secondaryButtonText}>← Go Back</Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </>
  );
}
