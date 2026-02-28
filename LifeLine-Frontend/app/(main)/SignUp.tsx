import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import React from 'react'
import { router } from 'expo-router'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import UserInfo from '@/src/features/auth/screens/UserInfo'
import EmergencyContactsScreen from '@/src/features/auth/screens/EmergencyContacts'

const steps = [
  {
    id: 1,
    Element: <UserInfo />,
  },
  {
    id: 2,
    Element: <EmergencyContactsScreen />,
  },
]

const SignUp = () => {
  const [currentStep, setCurrentStep] = React.useState(0)
  const isLastStep = currentStep === steps.length - 1

  const handleNext = () => {
    if (!isLastStep) {
      setCurrentStep((prevStep) => prevStep + 1)
      return
    }

    router.replace('/Home')
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prevStep) => prevStep - 1)
    }
  }

  return (
    <View style={{ flex: 1 }}>
      {steps[currentStep].Element}

      <View style={styles.footer}>
        {currentStep > 0 && (
          <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
          <Text style={styles.nextText}>
            {isLastStep ? 'Finish' : 'Next Step →'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default SignUp


const styles = StyleSheet.create({
  container: {
    paddingHorizontal: wp('6%'),
    backgroundColor: '#FAFAFA',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp('4%'),
    marginTop: hp('3%'),
  },

  step: {
    fontSize: hp('1.4%'),
    color: '#2F80ED',
    fontWeight: '700',
  },

  title: {
    fontSize: hp('2.8%'),
    fontWeight: '800',
    marginTop: hp('2%'),
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
    marginBottom: hp('2.5%'),
    elevation: 3,
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp('1.5%'),
  },

  cardTitle: {
    fontSize: hp('2%'),
    fontWeight: '700',
    color: '#0A2540',
  },

  label: {
    fontSize: hp('1.3%'),
    color: '#8A94A6',
    fontWeight: '700',
    marginTop: hp('1.6%'),
    marginBottom: hp('0.6%'),
  },

  input: {
    backgroundColor: '#F8FAFC',
    borderRadius: hp('1%'),
    paddingHorizontal: wp('4%'),
    height: hp('5.5%'),
    fontSize: hp('1.7%'),
  },

  primaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: hp('2%'),
  },

  primaryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp('2%'),
  },

  primaryText: {
    fontSize: hp('1.7%'),
    fontWeight: '600',
    color: '#0A2540',
  },

  addBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: wp('2%'),
    borderWidth: 1,
    borderColor: '#2F80ED',
    borderStyle: 'dashed',
    borderRadius: hp('1.5%'),
    paddingVertical: hp('1.6%'),
    marginBottom: hp('3%'),
  },

  addText: {
    fontSize: hp('1.8%'),
    fontWeight: '600',
    color: '#2F80ED',
  },

  footer: {
    backgroundColor: '#FAFAFA',
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',

    marginBottom: hp('4%'),
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
})
