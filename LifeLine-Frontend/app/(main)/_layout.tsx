import { Slot } from 'expo-router';
import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import UserNav from '@/src/features/User/Component/UserNav';

export default function MainLayout() {
  return (
    <SafeAreaView style={styles.container}>
      <UserNav />
      <Slot />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});
