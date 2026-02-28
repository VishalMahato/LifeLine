import Ionicons from '@expo/vector-icons/Ionicons'
import { useNavigation } from '@react-navigation/native'
import React, { useState } from 'react'
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen'

const INITIAL_VALUES = {
  fullName: 'Johnathan Doe',
  phone: '+1 (555) 012-3456',
  email: 'j.doe@lifeline-app.com',
}

type FieldCardProps = {
  label: string
  value: string
  editable: boolean
  keyboardType?: 'default' | 'email-address' | 'phone-pad'
  onChange: (value: string) => void
}

function FieldCard({ label, value, editable, keyboardType = 'default', onChange }: FieldCardProps) {
  return (
    <View style={[styles.card, editable && styles.cardEdit]}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        editable={editable}
        keyboardType={keyboardType}
        autoCapitalize={keyboardType === 'default' ? 'words' : 'none'}
        style={[styles.input, !editable && styles.readOnlyInput]}
      />
    </View>
  )
}

export default function AccountDetailsPage() {
  const navigation = useNavigation<any>()

  const [isEdit, setIsEdit] = useState(false)
  const [fullName, setFullName] = useState(INITIAL_VALUES.fullName)
  const [phone, setPhone] = useState(INITIAL_VALUES.phone)
  const [email, setEmail] = useState(INITIAL_VALUES.email)

  const handleCancel = () => {
    setFullName(INITIAL_VALUES.fullName)
    setPhone(INITIAL_VALUES.phone)
    setEmail(INITIAL_VALUES.email)
    setIsEdit(false)
  }

  const handleSave = () => {
    setIsEdit(false)
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="#111827" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Account Details</Text>

          <TouchableOpacity onPress={() => setIsEdit((prev) => !prev)}>
            <Ionicons name={isEdit ? 'close' : 'create-outline'} size={22} color="#1E73E8" />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarCircle}>
              <Image
                source={{ uri: 'https://cdn-icons-png.flaticon.com/512/149/149071.png' }}
                style={styles.avatar}
              />
            </View>
          </View>

          <FieldCard
            label="FULL NAME"
            value={fullName}
            editable={isEdit}
            onChange={setFullName}
          />

          <FieldCard
            label="PHONE NUMBER"
            value={phone}
            editable={isEdit}
            keyboardType="phone-pad"
            onChange={setPhone}
          />

          <FieldCard
            label="EMAIL ADDRESS"
            value={email}
            editable={isEdit}
            keyboardType="email-address"
            onChange={setEmail}
          />

          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
              <Ionicons name="close" size={20} color="#374151" />
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Ionicons name="checkmark" size={20} color="#FFFFFF" />
              <Text style={styles.saveText}>Save Changes</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoBox}>
            <Ionicons name="shield-checkmark" size={18} color="#9CA3AF" />
            <Text style={styles.infoText}>
              Your personal information is encrypted and only used for emergency response
              verification.
            </Text>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#F2F4F7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp('5%'),
    paddingTop: hp('6%'),
    paddingBottom: hp('2%'),
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: hp('2.3%'),
    fontWeight: '700',
    color: '#111827',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: wp('5%'),
    paddingTop: hp('3%'),
    paddingBottom: hp('10%'),
  },
  avatarWrapper: {
    alignItems: 'center',
    marginBottom: hp('4%'),
  },
  avatarCircle: {
    width: hp('14%'),
    height: hp('14%'),
    borderRadius: 100,
    backgroundColor: '#F5CBA7',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
  },
  avatar: {
    width: hp('9%'),
    height: hp('9%'),
    opacity: 0.7,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: wp('5%'),
    marginBottom: hp('2%'),
    elevation: 2,
  },
  cardEdit: {
    borderWidth: 1.5,
    borderColor: '#1E73E8',
  },
  label: {
    fontSize: hp('1.3%'),
    color: '#6B7280',
    fontWeight: '600',
    marginBottom: hp('0.8%'),
  },
  input: {
    fontSize: hp('1.8%'),
    fontWeight: '600',
    color: '#111827',
    borderBottomWidth: 1,
    borderBottomColor: '#1E73E8',
    paddingVertical: hp('0.4%'),
  },
  readOnlyInput: {
    borderBottomColor: '#D1D5DB',
    color: '#374151',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: hp('1%'),
  },
  cancelBtn: {
    flex: 0.48,
    backgroundColor: '#E5E7EB',
    paddingVertical: hp('2%'),
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: hp('0.3%'),
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
    justifyContent: 'center',
    gap: hp('0.3%'),
    elevation: 4,
  },
  saveText: {
    fontWeight: '700',
    color: '#FFFFFF',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp('3%'),
  },
  infoText: {
    fontSize: hp('1.4%'),
    color: '#9CA3AF',
    marginLeft: wp('3%'),
    flex: 1,
  },
})
