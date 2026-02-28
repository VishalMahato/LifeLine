import Ionicons from '@expo/vector-icons/Ionicons'
import { useNavigation } from '@react-navigation/native'
import React from 'react'
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen'

export default function SavedAddress() {
  const navigation = useNavigation<any>()

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>Back</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Saved Address</Text>

        <TouchableOpacity>
          <Ionicons name="pencil" size={20} color="#1E73E8" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.contentContainer}>
        <View style={styles.mapCard}>
          <Image
            source={{ uri: 'https://maps.gstatic.com/tactile/basepage/pegman_sherlock.png' }}
            style={styles.mapImage}
          />

          <TouchableOpacity style={styles.locationBtn}>
            <Ionicons name="locate" size={18} color="#1E73E8" />
            <Text style={styles.locationText}>Update Current Location</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <LabelValue label="Street Address" value="123 Maple Street" />

          <View style={styles.rowSplit}>
            <View style={styles.half}>
              <LabelValue label="City" value="Springfield" />
            </View>
            <View style={[styles.half, styles.dividerLeft]}>
              <LabelValue label="State" value="IL" />
            </View>
          </View>

          <LabelValue label="ZIP Code" value="62704" />
          <LabelValue label="Landmark" value="Red door, across from Oak Park" />

          <View style={styles.notesSection}>
            <View style={styles.notesHeader}>
              <Text style={styles.notesTitle}>EMERGENCY ACCESS NOTES</Text>
            </View>
            <Text style={styles.notesText}>
              Gate code is 5678. Beware of small dog in the backyard. Lockbox on side porch.
            </Text>
          </View>
        </View>

        <View style={styles.encryptionBox}>
          <Ionicons name="lock-closed" size={16} color="#9CA3AF" />
          <Text style={styles.encryptionText}>End-to-end encrypted</Text>
        </View>

        <Text style={styles.subInfo}>
          LOCATION IS SHARED ONLY DURING ACTIVE EMERGENCIES WITH VERIFIED FIRST RESPONDERS.
        </Text>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.saveBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.saveText}>Save Changes</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

function LabelValue({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label.toUpperCase()}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F4F7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp('5%'),
    paddingTop: hp('6%'),
    paddingBottom: hp('2%'),
    backgroundColor: '#FFFFFF',
  },
  back: {
    color: '#1E73E8',
    fontSize: hp('1.8%'),
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: hp('2.2%'),
    fontWeight: '700',
    color: '#111827',
  },
  contentContainer: {
    paddingHorizontal: wp('5%'),
    paddingTop: hp('3%'),
    paddingBottom: hp('20%'),
  },
  mapCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: wp('3%'),
    marginBottom: hp('3%'),
    elevation: 4,
  },
  mapImage: {
    width: '100%',
    height: hp('20%'),
    borderRadius: 14,
  },
  locationBtn: {
    position: 'absolute',
    bottom: -hp('2%'),
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp('1.3%'),
    paddingHorizontal: wp('6%'),
    borderRadius: 12,
    elevation: 6,
  },
  locationText: {
    marginLeft: wp('2%'),
    color: '#1E73E8',
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: wp('5%'),
    elevation: 2,
  },
  field: {
    marginBottom: hp('2%'),
  },
  label: {
    fontSize: hp('1.3%'),
    color: '#9CA3AF',
    fontWeight: '600',
    marginBottom: hp('0.7%'),
  },
  value: {
    fontSize: hp('1.8%'),
    fontWeight: '600',
    color: '#111827',
  },
  rowSplit: {
    flexDirection: 'row',
  },
  half: {
    flex: 1,
  },
  dividerLeft: {
    borderLeftWidth: 1,
    borderLeftColor: '#E5E7EB',
    paddingLeft: wp('4%'),
  },
  notesSection: {
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    padding: wp('4%'),
    marginTop: hp('1%'),
  },
  notesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notesTitle: {
    fontSize: hp('1.4%'),
    fontWeight: '700',
    color: '#1E73E8',
    marginBottom: hp('1%'),
  },
  notesText: {
    fontSize: hp('1.5%'),
    color: '#374151',
    fontStyle: 'italic',
  },
  encryptionBox: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: hp('4%'),
  },
  encryptionText: {
    marginLeft: wp('2%'),
    fontSize: hp('1.4%'),
    color: '#9CA3AF',
  },
  subInfo: {
    textAlign: 'center',
    fontSize: hp('1.2%'),
    color: '#9CA3AF',
    marginTop: hp('1%'),
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: wp('5%'),
    paddingVertical: hp('2%'),
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  cancelBtn: {
    flex: 0.48,
    backgroundColor: '#E5E7EB',
    paddingVertical: hp('2%'),
    borderRadius: 14,
    alignItems: 'center',
  },
  cancelText: {
    fontWeight: '600',
    color: '#374151',
  },
  saveBtn: {
    flex: 0.48,
    backgroundColor: '#1E73E8',
    paddingVertical: hp('2%'),
    borderRadius: 14,
    alignItems: 'center',
    elevation: 4,
  },
  saveText: {
    fontWeight: '700',
    color: '#FFFFFF',
  },
})
