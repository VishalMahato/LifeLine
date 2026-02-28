import React from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';

type ActionButtonProps = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
};

const ActionButton = ({
  label,
  onPress,
  variant = 'primary',
}: ActionButtonProps) => (
  <TouchableOpacity
    style={[styles.buttonBase, variant === 'primary' ? styles.primaryButton : styles.secondaryButton]}
    onPress={onPress}
  >
    <Text
      style={[
        styles.buttonText,
        variant === 'primary' ? styles.primaryButtonText : styles.secondaryButtonText,
      ]}
    >
      {label}
    </Text>
  </TouchableOpacity>
);

const HelperAccountReadyScreen = () => {
  const handleGoOnline = () => {
    router.replace('/User/Helper/HelperRequest');
  };

  const handleGuidelines = () => {
    Alert.alert(
      'Helper Guidelines',
      'Keep your profile updated, respond quickly, and verify scene safety before engaging.',
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconOuter}>
          <View style={styles.iconInner}>
            <Ionicons name="checkmark" size={hp('3.2%')} color="#FFFFFF" />
          </View>
        </View>

        <Text style={styles.title}>Your helper profile is ready</Text>
        <Text style={styles.subtitle}>
          You are now part of the LifeLine responder network and can receive nearby emergency
          assistance requests.
        </Text>

        <View style={styles.infoCard}>
          <View style={styles.infoIconWrap}>
            <Ionicons name="shield-checkmark" size={hp('2.2%')} color="#2F80ED" />
          </View>
          <View style={styles.infoTextWrap}>
            <Text style={styles.infoTitle}>Helper Verified</Text>
            <Text style={styles.infoText}>
              Your credentials, certifications, and identity have been securely verified.
            </Text>
          </View>
        </View>

        <View style={styles.actionsWrap}>
          <ActionButton label="Go Online & Start Helping" onPress={handleGoOnline} />
          <ActionButton
            label="View Helper Guidelines"
            onPress={handleGuidelines}
            variant="secondary"
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default HelperAccountReadyScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: wp('6%'),
  },
  iconOuter: {
    alignSelf: 'center',
    width: hp('12%'),
    height: hp('12%'),
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EAF4FF',
    marginBottom: hp('3.5%'),
  },
  iconInner: {
    width: hp('6.2%'),
    height: hp('6.2%'),
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2F80ED',
  },
  title: {
    textAlign: 'center',
    fontSize: hp('2.8%'),
    fontWeight: '800',
    color: '#0A2540',
    marginBottom: hp('1.2%'),
  },
  subtitle: {
    textAlign: 'center',
    color: '#5F6C7B',
    fontSize: hp('1.75%'),
    lineHeight: hp('2.6%'),
    marginBottom: hp('3.2%'),
  },
  infoCard: {
    flexDirection: 'row',
    gap: wp('3.5%'),
    borderRadius: hp('1.8%'),
    borderWidth: 1,
    borderColor: '#E0E6ED',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: wp('4.5%'),
    paddingVertical: hp('1.8%'),
  },
  infoIconWrap: {
    width: hp('4.8%'),
    height: hp('4.8%'),
    borderRadius: hp('1.4%'),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EAF4FF',
  },
  infoTextWrap: {
    flex: 1,
  },
  infoTitle: {
    color: '#0A2540',
    fontSize: hp('1.9%'),
    fontWeight: '700',
    marginBottom: hp('0.5%'),
  },
  infoText: {
    color: '#5F6C7B',
    fontSize: hp('1.55%'),
    lineHeight: hp('2.2%'),
  },
  actionsWrap: {
    marginTop: hp('3.4%'),
    gap: hp('1.6%'),
  },
  buttonBase: {
    borderRadius: hp('1.2%'),
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp('1.9%'),
  },
  primaryButton: {
    backgroundColor: '#0B5ED7',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E6ED',
  },
  buttonText: {
    fontSize: hp('1.9%'),
    fontWeight: '700',
  },
  primaryButtonText: {
    color: '#FFFFFF',
  },
  secondaryButtonText: {
    color: '#0A2540',
  },
});
