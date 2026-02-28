import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Switch,
  ScrollView,
} from 'react-native'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import Ionicons from '@expo/vector-icons/Ionicons'

const EmergencyContactsScreen = () => {
  const [contacts, setContacts] = useState([
    {
      id: 1,
      name: '',
      relationship: '',
      phone: '',
      primary: true,
    },
    {
      id: 2,
      name: '',
      relationship: '',
      phone: '',
      primary: false,
    },
  ])

  const togglePrimary = (id: number): void => {
    setContacts((prev) =>
      prev.map((c) => ({
        ...c,
        primary: c.id === id,
      }))
    )
  }

  const addContact = () => {
    setContacts((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: '',
        relationship: '',
        phone: '',
        primary: false,
      },
    ])
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="arrow-back" size={hp('2.5%')} />
        <Text style={styles.step}>STEP 2 OF 5</Text>
      </View>

      <Text style={styles.title}>Emergency Contacts</Text>
      <Text style={styles.subtitle}>{"We'll alert these people if you activate SOS."}</Text>

      {/* Contacts */}
      {contacts.map((item, index) => (
        <View key={item.id} style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Contact {index + 1}</Text>
            <Ionicons name="trash-outline" size={hp('2%')} color="#8A94A6" />
          </View>

          {/* Name */}
          <Text style={styles.label}>FULL NAME</Text>
          <TextInput
            placeholder="e.g. Sarah Jenkins"
            style={styles.input}
          />

          {/* Relationship */}
          <Text style={styles.label}>RELATIONSHIP</Text>
          <TextInput
            placeholder="Spouse"
            style={styles.input}
          />

          {/* Phone */}
          <Text style={styles.label}>PHONE</Text>
          <TextInput
            placeholder="(555) 123-456"
            keyboardType="phone-pad"
            style={styles.input}
          />

          {/* Primary */}
          <View style={styles.primaryRow}>
            <View style={styles.primaryLeft}>
              <Ionicons
                name="star"
                size={hp('2%')}
                color="#F5B301"
              />
              <Text style={styles.primaryText}>Primary contact</Text>
            </View>

            <Switch
              value={item.primary}
              onValueChange={() => togglePrimary(item.id)}
            />
          </View>
        </View>
      ))}

      {/* Add Contact */}
      <TouchableOpacity style={styles.addBtn} onPress={addContact}>
        <Ionicons name="add-circle-outline" size={hp('2.2%')} color="#2F80ED" />
        <Text style={styles.addText}>Add Another Contact</Text>
      </TouchableOpacity>

      {/* Footer Buttons */}
     
    </ScrollView>
  )
}

export default EmergencyContactsScreen


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
