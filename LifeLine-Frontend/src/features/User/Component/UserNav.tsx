import AntDesign from '@expo/vector-icons/AntDesign';
import { Link, router } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

const MOBILE_MENU_HEIGHT = 170;

export default function UserNav() {
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768;

  const [menuOpen, setMenuOpen] = useState(false);
  const menuHeight = useRef(new Animated.Value(0)).current;

  const toggleMenu = () => {
    const nextOpen = !menuOpen;
    setMenuOpen(nextOpen);

    Animated.timing(menuHeight, {
      toValue: nextOpen ? MOBILE_MENU_HEIGHT : 0,
      duration: 220,
      useNativeDriver: false,
    }).start();
  };

  return (
    <View>
      <View style={styles.navbar}>
        <Link href="/" asChild>
          <Pressable style={styles.left}>
            <View style={styles.logoBox}>
              <AntDesign name="heart" size={20} color="#FFFFFF" />
            </View>
            <Text style={styles.brand}>LifeLine</Text>
          </Pressable>
        </Link>

        {isLargeScreen ? (
          <View style={styles.center}>
            <Link href="/(main)/Home" style={styles.link}>
              Home
            </Link>
            <Link href="/User" style={styles.link}>
              User
            </Link>
            <Link href="/modal" style={styles.link}>
              About
            </Link>
          </View>
        ) : null}

        {isLargeScreen ? (
          <Pressable style={styles.loginBtn} onPress={() => router.push('/Login')}>
            <Text style={styles.loginText}>Login</Text>
          </Pressable>
        ) : (
          <Pressable onPress={toggleMenu} hitSlop={8}>
            <AntDesign name={menuOpen ? 'close' : 'menu-fold'} size={22} color="#1F2937" />
          </Pressable>
        )}
      </View>

      {!isLargeScreen ? (
        <Animated.View style={[styles.mobileMenu, { height: menuHeight }]}>
          <Link href="/(main)/Home" style={styles.mobileLink} onPress={toggleMenu}>
            Home
          </Link>
          <Link href="/User" style={styles.mobileLink} onPress={toggleMenu}>
            User
          </Link>
          <Link href="/modal" style={styles.mobileLink} onPress={toggleMenu}>
            About
          </Link>

          <Pressable
            style={styles.mobileLogin}
            onPress={() => {
              toggleMenu();
              router.push('/Login');
            }}
          >
            <Text style={styles.loginText}>Login</Text>
          </Pressable>
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    minHeight: 64,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderBottomColor: '#E5E7EB',
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  brand: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  center: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  link: {
    fontSize: 15,
    color: '#374151',
    fontWeight: '600',
  },
  loginBtn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    backgroundColor: '#2563EB',
    borderRadius: 10,
  },
  loginText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  mobileMenu: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    paddingHorizontal: 20,
    borderBottomColor: '#E5E7EB',
    borderBottomWidth: 1,
  },
  mobileLink: {
    fontSize: 16,
    paddingTop: 14,
    color: '#374151',
    fontWeight: '600',
  },
  mobileLogin: {
    marginTop: 14,
    marginBottom: 12,
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
});
