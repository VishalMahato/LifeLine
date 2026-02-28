import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import Ionicons from '@expo/vector-icons/Ionicons'

const MedicalInfoScreen = () => {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.step}>STEP 4 OF 5</Text>
        <TouchableOpacity>
          <Text style={styles.skip}>Skip for now</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>Medical Info</Text>
      <Text style={styles.subtitle}>
        This optional information helps first responders treat you faster
        and more accurately in an emergency.
      </Text>

      {/* Vital Info */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="heart" size={hp('2.2%')} color="#E53935" />
          <Text style={styles.cardTitle}>Vital Info</Text>
        </View>

        <View style={styles.row}>
          <View style={styles.field}>
            <Text style={styles.label}>Blood Type</Text>
            <TextInput
              placeholder="Select"
              style={styles.input}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Date of Birth</Text>
            <TextInput
              placeholder="mm/dd/yyyy"
              style={styles.input}
            />
          </View>
        </View>
      </View>

      {/* Physical Traits */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="body" size={hp('2.2%')} color="#2F80ED" />
          <Text style={styles.cardTitle}>Physical Traits</Text>
        </View>

        <View style={styles.row}>
          <View style={styles.field}>
            <Text style={styles.label}>Height</Text>
            <TextInput
              placeholder="5'10"
              style={styles.input}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Weight</Text>
            <TextInput
              placeholder="160 lbs"
              style={styles.input}
            />
          </View>
        </View>
      </View>

      {/* Health History */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="medkit" size={hp('2.2%')} color="#F2994A" />
          <Text style={styles.cardTitle}>Health History</Text>
        </View>

        <Text style={styles.label}>Allergies</Text>
        <TextInput
          placeholder="e.g. Peanuts, Penicillin, Bee stings"
          style={styles.input}
        />

        <View style={styles.badge}>
          <Text style={styles.badgeText}>Latex ✕</Text>
        </View>

        <Text style={styles.label}>Current Medications</Text>
        <TextInput
          placeholder="e.g. Asthma inhaler"
          style={styles.input}
        />

        <Text style={styles.label}>Medical Conditions</Text>
        <TextInput
          placeholder="e.g. Asthma, Diabetes"
          style={styles.input}
        />
      </View>

      

      {/* Security Info */}
      <View style={styles.securityRow}>
        <Ionicons name="lock-closed" size={hp('1.6%')} color="#2F80ED" />
        <Text style={styles.securityText}>
          Your medical data is encrypted and only shared with verified
          responders during an active SOS.
        </Text>
      </View>
    </ScrollView>
  )
}

export default MedicalInfoScreen

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: wp('6%'),
    backgroundColor: '#FAFAFA',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: hp('3%'),
  },

  step: {
    fontSize: hp('1.4%'),
    fontWeight: '700',
    color: '#2F80ED',
  },

  skip: {
    fontSize: hp('1.5%'),
    fontWeight: '600',
    color: '#8A94A6',
  },

  title: {
    fontSize: hp('2.8%'),
    fontWeight: '800',
    color: '#0A2540',
    marginTop: hp('1.5%'),
  },

  subtitle: {
    fontSize: hp('1.8%'),
    color: '#5F6C7B',
    marginBottom: hp('3%'),
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: hp('2%'),
    padding: wp('5%'),
    marginBottom: hp('3%'),
    elevation: 3,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp('2%'),
    marginBottom: hp('2%'),
  },

  cardTitle: {
    fontSize: hp('2%'),
    fontWeight: '700',
    color: '#0A2540',
  },

  row: {
    flexDirection: 'row',
    gap: wp('4%'),
  },

  field: {
    flex: 1,
  },

  label: {
    fontSize: hp('1.3%'),
    fontWeight: '700',
    color: '#8A94A6',
    marginTop: hp('1.5%'),
    marginBottom: hp('0.6%'),
  },

  input: {
    backgroundColor: '#F8FAFC',
    borderRadius: hp('1%'),
    paddingHorizontal: wp('4%'),
    height: hp('5.5%'),
    fontSize: hp('1.7%'),
  },

  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FDECEA',
    borderRadius: 20,
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('0.8%'),
    marginVertical: hp('1%'),
  },

  badgeText: {
    color: '#E53935',
    fontWeight: '600',
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp('3%'),
  },

  backBtn: {
    width: '30%',
    borderWidth: 1,
    borderColor: '#E0E6ED',
    borderRadius: hp('1.2%'),
    alignItems: 'center',
    paddingVertical: hp('1.5%'),
  },

  backText: {
    fontWeight: '600',
    color: '#0A2540',
  },

  nextBtn: {
    width: '65%',
    backgroundColor: '#0B5ED7',
    borderRadius: hp('1.2%'),
    alignItems: 'center',
    paddingVertical: hp('1.6%'),
  },

  nextText: {
    color: '#fff',
    fontSize: hp('1.9%'),
    fontWeight: '700',
  },

  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp('2%'),
    marginBottom: hp('4%'),
  },

  securityText: {
    fontSize: hp('1.4%'),
    color: '#5F6C7B',
    flex: 1,
  },
})
