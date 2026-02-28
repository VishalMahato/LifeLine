import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import Ionicons from '@expo/vector-icons/Ionicons';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';

type Allergy = {
  substance: string;
  severity: string;
  reaction: string;
};

type Condition = {
  name: string;
  status: string;
  notes: string;
};

type Medication = {
  name: string;
  dosage: string;
  frequency: string;
  purpose: string;
};

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const ALLERGY_SEVERITIES = ['mild', 'moderate', 'severe', 'life_threatening'];
const CONDITION_STATUSES = ['active', 'inactive', 'resolved', 'chronic'];
const MEDICATION_FREQUENCIES = ['daily', 'twice_daily', 'weekly', 'as_needed'];

const emptyAllergy = (): Allergy => ({
  substance: '',
  severity: '',
  reaction: '',
});

const emptyCondition = (): Condition => ({
  name: '',
  status: '',
  notes: '',
});

const emptyMedication = (): Medication => ({
  name: '',
  dosage: '',
  frequency: '',
  purpose: '',
});

const toInputDate = (date: Date | null): string => {
  if (!date) {
    return '';
  }
  return date.toISOString().slice(0, 10);
};

const MedicalInfoScreen = () => {
  const [bloodType, setBloodType] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [heightCm, setHeightCm] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [disabilities, setDisabilities] = useState('');
  const [organDonor, setOrganDonor] = useState(false);

  const [allergies, setAllergies] = useState<Allergy[]>([emptyAllergy()]);
  const [conditions, setConditions] = useState<Condition[]>([emptyCondition()]);
  const [medications, setMedications] = useState<Medication[]>([emptyMedication()]);

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (event.type === 'set' && selectedDate) {
      setDateOfBirth(selectedDate);
    }
  };

  const updateAllergy = (index: number, key: keyof Allergy, value: string) => {
    setAllergies((prev) => prev.map((item, i) => (i === index ? { ...item, [key]: value } : item)));
  };

  const updateCondition = (index: number, key: keyof Condition, value: string) => {
    setConditions((prev) => prev.map((item, i) => (i === index ? { ...item, [key]: value } : item)));
  };

  const updateMedication = (index: number, key: keyof Medication, value: string) => {
    setMedications((prev) => prev.map((item, i) => (i === index ? { ...item, [key]: value } : item)));
  };

  const validateMedicalInfo = () => {
    if (!bloodType) {
      setSuccessMessage('');
      setErrorMessage('Please select your blood type.');
      return;
    }

    if (!dateOfBirth) {
      setSuccessMessage('');
      setErrorMessage('Please add your date of birth.');
      return;
    }

    const invalidAllergy = allergies.some(
      (item) => item.substance.trim().length > 0 && item.severity.trim().length === 0,
    );

    if (invalidAllergy) {
      setSuccessMessage('');
      setErrorMessage('Each allergy with a substance must also include severity.');
      return;
    }

    setErrorMessage('');
    setSuccessMessage('Medical information looks valid and ready to submit.');
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.step}>STEP 4 OF 5</Text>
        <TouchableOpacity>
          <Text style={styles.skip}>Skip for now</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>Medical Info</Text>
      <Text style={styles.subtitle}>
        This optional information helps first responders treat you faster and more accurately in an emergency.
      </Text>

      {errorMessage ? (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle" size={hp('2%')} color="#B3261E" />
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      ) : null}

      {successMessage ? (
        <View style={styles.successBox}>
          <Ionicons name="checkmark-circle" size={hp('2%')} color="#2E7D32" />
          <Text style={styles.successText}>{successMessage}</Text>
        </View>
      ) : null}

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="heart" size={hp('2.2%')} color="#E53935" />
          <Text style={styles.cardTitle}>Vital Info</Text>
        </View>

        <Text style={styles.label}>Blood Type</Text>
        <View style={styles.chipRow}>
          {BLOOD_TYPES.map((type) => (
            <TouchableOpacity
              key={type}
              style={[styles.chip, bloodType === type && styles.chipSelected]}
              onPress={() => setBloodType(type)}
            >
              <Text style={[styles.chipText, bloodType === type && styles.chipTextSelected]}>{type}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Date of Birth</Text>
        <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
          <Text style={toInputDate(dateOfBirth) ? styles.valueText : styles.placeholderText}>
            {toInputDate(dateOfBirth) || 'YYYY-MM-DD'}
          </Text>
        </TouchableOpacity>

        {showDatePicker ? (
          <DateTimePicker
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            value={dateOfBirth || new Date('2000-01-01')}
            onChange={onDateChange}
            maximumDate={new Date()}
          />
        ) : null}
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="body" size={hp('2.2%')} color="#2F80ED" />
          <Text style={styles.cardTitle}>Physical Traits</Text>
        </View>

        <View style={styles.row}>
          <View style={styles.field}>
            <Text style={styles.label}>Height (cm)</Text>
            <TextInput
              placeholder="175"
              style={styles.input}
              value={heightCm}
              keyboardType="numeric"
              onChangeText={setHeightCm}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Weight (kg)</Text>
            <TextInput
              placeholder="70"
              style={styles.input}
              value={weightKg}
              keyboardType="numeric"
              onChangeText={setWeightKg}
            />
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeaderBetween}>
          <View style={styles.cardHeader}>
            <Ionicons name="alert-circle" size={hp('2.2%')} color="#F2994A" />
            <Text style={styles.cardTitle}>Allergies</Text>
          </View>
          <TouchableOpacity onPress={() => setAllergies((prev) => [...prev, emptyAllergy()])}>
            <Text style={styles.addText}>+ Add</Text>
          </TouchableOpacity>
        </View>

        {allergies.map((item, index) => (
          <View key={`allergy-${index}`} style={styles.group}>
            <TextInput
              placeholder="Substance"
              style={styles.input}
              value={item.substance}
              onChangeText={(value) => updateAllergy(index, 'substance', value)}
            />
            <TextInput
              placeholder={`Severity: ${ALLERGY_SEVERITIES.join(', ')}`}
              style={styles.input}
              value={item.severity}
              onChangeText={(value) => updateAllergy(index, 'severity', value)}
            />
            <TextInput
              placeholder="Reaction"
              style={styles.input}
              value={item.reaction}
              onChangeText={(value) => updateAllergy(index, 'reaction', value)}
            />
            {allergies.length > 1 ? (
              <TouchableOpacity onPress={() => setAllergies((prev) => prev.filter((_, i) => i !== index))}>
                <Text style={styles.removeText}>Remove</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeaderBetween}>
          <View style={styles.cardHeader}>
            <Ionicons name="medkit" size={hp('2.2%')} color="#2F80ED" />
            <Text style={styles.cardTitle}>Conditions</Text>
          </View>
          <TouchableOpacity onPress={() => setConditions((prev) => [...prev, emptyCondition()])}>
            <Text style={styles.addText}>+ Add</Text>
          </TouchableOpacity>
        </View>

        {conditions.map((item, index) => (
          <View key={`condition-${index}`} style={styles.group}>
            <TextInput
              placeholder="Condition name"
              style={styles.input}
              value={item.name}
              onChangeText={(value) => updateCondition(index, 'name', value)}
            />
            <TextInput
              placeholder={`Status: ${CONDITION_STATUSES.join(', ')}`}
              style={styles.input}
              value={item.status}
              onChangeText={(value) => updateCondition(index, 'status', value)}
            />
            <TextInput
              placeholder="Notes"
              style={styles.input}
              value={item.notes}
              onChangeText={(value) => updateCondition(index, 'notes', value)}
            />
            {conditions.length > 1 ? (
              <TouchableOpacity onPress={() => setConditions((prev) => prev.filter((_, i) => i !== index))}>
                <Text style={styles.removeText}>Remove</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeaderBetween}>
          <View style={styles.cardHeader}>
            <Ionicons name="pulse" size={hp('2.2%')} color="#E53935" />
            <Text style={styles.cardTitle}>Medications</Text>
          </View>
          <TouchableOpacity onPress={() => setMedications((prev) => [...prev, emptyMedication()])}>
            <Text style={styles.addText}>+ Add</Text>
          </TouchableOpacity>
        </View>

        {medications.map((item, index) => (
          <View key={`medication-${index}`} style={styles.group}>
            <TextInput
              placeholder="Medication name"
              style={styles.input}
              value={item.name}
              onChangeText={(value) => updateMedication(index, 'name', value)}
            />
            <TextInput
              placeholder="Dosage"
              style={styles.input}
              value={item.dosage}
              onChangeText={(value) => updateMedication(index, 'dosage', value)}
            />
            <TextInput
              placeholder={`Frequency: ${MEDICATION_FREQUENCIES.join(', ')}`}
              style={styles.input}
              value={item.frequency}
              onChangeText={(value) => updateMedication(index, 'frequency', value)}
            />
            <TextInput
              placeholder="Purpose"
              style={styles.input}
              value={item.purpose}
              onChangeText={(value) => updateMedication(index, 'purpose', value)}
            />
            {medications.length > 1 ? (
              <TouchableOpacity onPress={() => setMedications((prev) => prev.filter((_, i) => i !== index))}>
                <Text style={styles.removeText}>Remove</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="shield-checkmark" size={hp('2.2%')} color="#2F80ED" />
          <Text style={styles.cardTitle}>Additional Info</Text>
        </View>

        <Text style={styles.label}>Disabilities</Text>
        <TextInput
          placeholder="Add disability details if any"
          style={[styles.input, styles.multilineInput]}
          multiline
          value={disabilities}
          onChangeText={setDisabilities}
        />

        <View style={styles.switchRow}>
          <Text style={styles.labelInline}>Organ donor consent</Text>
          <Switch value={organDonor} onValueChange={setOrganDonor} />
        </View>
      </View>

      <TouchableOpacity style={styles.primaryButton} onPress={validateMedicalInfo}>
        <Text style={styles.primaryButtonText}>Review Medical Info</Text>
      </TouchableOpacity>

      <View style={styles.securityRow}>
        <Ionicons name="lock-closed" size={hp('1.8%')} color="#2F80ED" />
        <Text style={styles.securityText}>
          Your medical data is encrypted and shared only with verified responders during an active SOS.
        </Text>
      </View>
    </ScrollView>
  );
};

export default MedicalInfoScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    marginBottom: hp('2%'),
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp('2%'),
    backgroundColor: '#FDECEA',
    borderRadius: 12,
    padding: wp('3%'),
    marginBottom: hp('2%'),
  },
  errorText: {
    color: '#B3261E',
    flex: 1,
    fontSize: hp('1.5%'),
  },
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp('2%'),
    backgroundColor: '#E9F6EC',
    borderRadius: 12,
    padding: wp('3%'),
    marginBottom: hp('2%'),
  },
  successText: {
    color: '#2E7D32',
    flex: 1,
    fontSize: hp('1.5%'),
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: wp('4.5%'),
    marginBottom: hp('2%'),
    borderWidth: 1,
    borderColor: '#EEF2F7',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp('2%'),
  },
  cardHeaderBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp('1%'),
  },
  cardTitle: {
    fontSize: hp('2%'),
    fontWeight: '700',
    color: '#0A2540',
  },
  label: {
    fontSize: hp('1.4%'),
    fontWeight: '700',
    color: '#526171',
    marginTop: hp('1.3%'),
    marginBottom: hp('0.6%'),
  },
  row: {
    flexDirection: 'row',
    gap: wp('4%'),
  },
  field: {
    flex: 1,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E4EAF1',
    height: hp('5.4%'),
    paddingHorizontal: wp('3.5%'),
    justifyContent: 'center',
    color: '#0A2540',
  },
  placeholderText: {
    color: '#8A94A6',
    fontSize: hp('1.7%'),
  },
  valueText: {
    color: '#0A2540',
    fontSize: hp('1.7%'),
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: wp('2%'),
  },
  chip: {
    borderWidth: 1,
    borderColor: '#DCE4EE',
    paddingHorizontal: wp('3.2%'),
    paddingVertical: hp('0.8%'),
    borderRadius: 20,
    marginTop: hp('0.6%'),
  },
  chipSelected: {
    backgroundColor: '#0B5ED7',
    borderColor: '#0B5ED7',
  },
  chipText: {
    color: '#0A2540',
    fontWeight: '600',
  },
  chipTextSelected: {
    color: '#FFFFFF',
  },
  addText: {
    color: '#0B5ED7',
    fontWeight: '700',
  },
  group: {
    borderTopWidth: 1,
    borderTopColor: '#EEF2F7',
    paddingTop: hp('1%'),
    marginTop: hp('1%'),
    gap: hp('0.8%'),
  },
  removeText: {
    color: '#B3261E',
    fontWeight: '600',
    marginTop: hp('0.6%'),
  },
  multilineInput: {
    height: hp('10%'),
    textAlignVertical: 'top',
    paddingVertical: hp('1.2%'),
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: hp('1.5%'),
  },
  labelInline: {
    fontSize: hp('1.7%'),
    color: '#0A2540',
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: '#0B5ED7',
    borderRadius: 12,
    height: hp('5.8%'),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hp('2%'),
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: hp('1.8%'),
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: wp('2%'),
    marginBottom: hp('4%'),
  },
  securityText: {
    flex: 1,
    color: '#5F6C7B',
    fontSize: hp('1.4%'),
  },
});
