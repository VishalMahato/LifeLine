import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import Ionicons from '@expo/vector-icons/Ionicons'

const skillsList = [
  'CPR Certified',
  'First Aid',
  'Registered Nurse',
  'EMT / Paramedic',
  'Medical Doctor',
  'Lifeguard',
]

const VerifySkillsScreen = () => {
  const [selectedSkills, setSelectedSkills] = useState(['CPR Certified', 'First Aid'])

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill)
        ? prev.filter((s) => s !== skill)
        : [...prev, skill]
    )
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="arrow-back" size={hp('2.5%')} />
        <Text style={styles.step}>STEP 3 OF 5</Text>
      </View>

      <Text style={styles.title}>Verify Your Skills</Text>
      <Text style={styles.subtitle}>
        Select your qualifications and upload proof to earn your verified badge.
      </Text>

      {/* Skills Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="school" size={hp('2.2%')} color="#2F80ED" />
          <Text style={styles.cardTitle}>Skills & Certifications</Text>
          <Text style={styles.helper}>Select all that apply</Text>
        </View>

        <View style={styles.chipsWrapper}>
          {skillsList.map((skill) => {
            const active = selectedSkills.includes(skill)
            return (
              <TouchableOpacity
                key={skill}
                style={[
                  styles.chip,
                  active && styles.chipActive,
                ]}
                onPress={() => toggleSkill(skill)}
              >
                {active && (
                  <Ionicons
                    name="checkmark"
                    size={hp('1.6%')}
                    color="#2F80ED"
                  />
                )}
                <Text
                  style={[
                    styles.chipText,
                    active && styles.chipTextActive,
                  ]}
                >
                  {skill}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>
      </View>

      {/* Upload Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="cloud-upload" size={hp('2.2%')} color="#2F80ED" />
          <Text style={styles.cardTitle}>Upload Credentials</Text>
        </View>

        {/* Uploaded File */}
        <View style={styles.fileRow}>
          <Ionicons name="document" size={hp('2.4%')} color="#E53935" />
          <View style={{ flex: 1 }}>
            <Text style={styles.fileName}>CPR_Certificate_2023.pdf</Text>
            <Text style={styles.fileStatus}>Uploaded</Text>
          </View>
          <Ionicons name="close" size={hp('2%')} color="#8A94A6" />
        </View>

        {/* Upload Box */}
        <View style={styles.uploadBox}>
          <Ionicons name="camera" size={hp('2.5%')} color="#8A94A6" />
          <Text style={styles.uploadTitle}>Upload ID / License</Text>
          <Text style={styles.uploadSub}>
            JPG, PNG or PDF up to 5MB
          </Text>
        </View>

        {/* Info */}
        <View style={styles.infoRow}>
          <Ionicons name="lock-closed" size={hp('1.8%')} color="#2F80ED" />
          <Text style={styles.infoText}>
            Documents are encrypted and reviewed manually within 24 hours.
          </Text>
        </View>
      </View>
    </ScrollView>
  )
}

export default VerifySkillsScreen


const styles = StyleSheet.create({
  container: {
    paddingHorizontal: wp('6%'),
    paddingTop: hp('3%'),
    backgroundColor: '#FAFAFA',
    flex: 1,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp('4%'),
    marginBottom: hp('2%'),
  },

  step: {
    fontSize: hp('1.4%'),
    fontWeight: '700',
    color: '#2F80ED',
  },

  title: {
    fontSize: hp('2.8%'),
    fontWeight: '800',
    color: '#0A2540',
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
    flex: 1,
  },

  helper: {
    fontSize: hp('1.4%'),
    color: '#8A94A6',
  },

  chipsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: wp('3%'),
  },

  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp('1%'),
    borderWidth: 1,
    borderColor: '#E0E6ED',
    borderRadius: 50,
    paddingVertical: hp('1%'),
    paddingHorizontal: wp('4%'),
  },

  chipActive: {
    borderColor: '#2F80ED',
    backgroundColor: '#EAF4FF',
  },

  chipText: {
    fontSize: hp('1.6%'),
    color: '#0A2540',
    fontWeight: '600',
  },

  chipTextActive: {
    color: '#2F80ED',
  },

  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp('3%'),
    backgroundColor: '#F8FAFC',
    borderRadius: hp('1.2%'),
    padding: wp('4%'),
    marginBottom: hp('2%'),
  },

  fileName: {
    fontSize: hp('1.6%'),
    fontWeight: '600',
  },

  fileStatus: {
    fontSize: hp('1.4%'),
    color: '#27AE60',
  },

  uploadBox: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#D0D5DD',
    borderRadius: hp('1.5%'),
    alignItems: 'center',
    paddingVertical: hp('3%'),
    marginBottom: hp('2%'),
  },

  uploadTitle: {
    fontSize: hp('1.8%'),
    fontWeight: '600',
    marginTop: hp('1%'),
  },

  uploadSub: {
    fontSize: hp('1.4%'),
    color: '#8A94A6',
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp('2%'),
  },

  infoText: {
    fontSize: hp('1.4%'),
    color: '#5F6C7B',
    flex: 1,
  },
})
