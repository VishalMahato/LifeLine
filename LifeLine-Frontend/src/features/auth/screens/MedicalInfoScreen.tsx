import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react';
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import { useAppDispatch, useAppSelector } from '@/src/core/store';
import { fetchSignupMedicalInfo, saveSignupMedicalInfo } from '@/src/features/auth/medicalSlice';

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

export interface MedicalInfoHandle {
  handleSubmit: () => Promise<boolean>;
}

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

const toDateOrNull = (value: unknown): Date | null => {
  if (typeof value !== 'string' || !value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const toNumericString = (value: unknown): string => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }
  if (typeof value === 'string' && value.trim()) {
    return value;
  }
  return '';
};

const parseNumber = (value: string): number | undefined => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return undefined;
  }
  return parsed;
};

const MedicalInfoScreen = forwardRef<MedicalInfoHandle>((_props, ref) => {
  const [bloodType, setBloodType] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [heightCm, setHeightCm] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [disabilities, setDisabilities] = useState('');
  const [organDonor, setOrganDonor] = useState(false);

  const [allergies, setAllergies] = useState<Allergy[]>([emptyAllergy()]);
  const [conditions, setConditions] = useState<Condition[]>([emptyCondition()]);
  const [medications, setMedications] = useState<Medication[]>([emptyMedication()]);

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const dispatch = useAppDispatch();
  const { authId } = useAppSelector((state) => state.auth);
  const medicalInfo = useAppSelector((state) => state.medical.medicalInfo);
  const isLoadingMedical = useAppSelector((state) => state.medical.isLoading);
  const isSavingMedical = useAppSelector((state) => state.medical.isSaving);
  const medicalError = useAppSelector((state) => state.medical.error);
  const hasExistingData = useMemo(
    () => !!medicalInfo && Object.keys(medicalInfo).length > 0,
    [medicalInfo],
  );

  const updateAllergy = (index: number, key: keyof Allergy, value: string) => {
    setAllergies((prev) => prev.map((item, i) => (i === index ? { ...item, [key]: value } : item)));
  };

  const updateCondition = (index: number, key: keyof Condition, value: string) => {
    setConditions((prev) => prev.map((item, i) => (i === index ? { ...item, [key]: value } : item)));
  };

  const updateMedication = (index: number, key: keyof Medication, value: string) => {
    setMedications((prev) => prev.map((item, i) => (i === index ? { ...item, [key]: value } : item)));
  };

  useEffect(() => {
    if (!authId) {
      return;
    }

    dispatch(fetchSignupMedicalInfo(authId));
  }, [authId, dispatch]);

  useEffect(() => {
    if (!medicalInfo || Object.keys(medicalInfo).length === 0) {
      return;
    }

    setBloodType(typeof medicalInfo.bloodType === 'string' ? medicalInfo.bloodType : '');
    setDateOfBirth(toDateOrNull(medicalInfo.dateOfBirth));
    setHeightCm(toNumericString((medicalInfo.height as { value?: unknown } | undefined)?.value));
    setWeightKg(toNumericString((medicalInfo.weight as { value?: unknown } | undefined)?.value));
    setDisabilities(typeof medicalInfo.disabilities === 'string' ? medicalInfo.disabilities : '');
    setOrganDonor(Boolean(medicalInfo.organDonor));

    const incomingAllergies = Array.isArray(medicalInfo.allergies)
      ? (medicalInfo.allergies as Record<string, unknown>[])
      : [];
    setAllergies(
      incomingAllergies.length > 0
        ? incomingAllergies.map((item) => ({
            substance: typeof item.substance === 'string' ? item.substance : '',
            severity: typeof item.severity === 'string' ? item.severity : '',
            reaction: typeof item.reaction === 'string' ? item.reaction : '',
          }))
        : [emptyAllergy()],
    );

    const incomingConditions = Array.isArray(medicalInfo.conditions)
      ? (medicalInfo.conditions as Record<string, unknown>[])
      : [];
    setConditions(
      incomingConditions.length > 0
        ? incomingConditions.map((item) => ({
            name: typeof item.name === 'string' ? item.name : '',
            status: typeof item.status === 'string' ? item.status : '',
            notes: typeof item.notes === 'string' ? item.notes : '',
          }))
        : [emptyCondition()],
    );

    const incomingMedications = Array.isArray(medicalInfo.medications)
      ? (medicalInfo.medications as Record<string, unknown>[])
      : [];
    setMedications(
      incomingMedications.length > 0
        ? incomingMedications.map((item) => ({
            name: typeof item.name === 'string' ? item.name : '',
            dosage: typeof item.dosage === 'string' ? item.dosage : '',
            frequency: typeof item.frequency === 'string' ? item.frequency : '',
            purpose: typeof item.purpose === 'string' ? item.purpose : '',
          }))
        : [emptyMedication()],
    );
  }, [medicalInfo]);

  useEffect(() => {
    if (medicalError) {
      setSuccessMessage('');
      setErrorMessage(medicalError);
    }
  }, [medicalError]);

  const validateMedicalInfo = () => {
    if (!bloodType) {
      setSuccessMessage('');
      setErrorMessage('Please select your blood type.');
      return false;
    }

    if (!dateOfBirth) {
      setSuccessMessage('');
      setErrorMessage('Please add your date of birth.');
      return false;
    }

    const invalidAllergy = allergies.some(
      (item) => item.substance.trim().length > 0 && item.severity.trim().length === 0,
    );

    if (invalidAllergy) {
      setSuccessMessage('');
      setErrorMessage('Each allergy with a substance must also include severity.');
      return false;
    }

    setErrorMessage('');
    return true;
  };

  const handleSubmit = async () => {
    if (hasExistingData) {
      setErrorMessage('');
      setSuccessMessage('Medical information already exists and is locked for editing in signup.');
      return true;
    }

    if (!validateMedicalInfo()) {
      return false;
    }

    if (!authId) {
      setSuccessMessage('');
      setErrorMessage('Unable to save medical information: missing auth record.');
      return false;
    }

    const heightValue = parseNumber(heightCm);
    const weightValue = parseNumber(weightKg);

    const payload: Record<string, unknown> = {
      bloodType,
      dateOfBirth: toInputDate(dateOfBirth),
      organDonor,
      disabilities: disabilities.trim(),
      allergies: allergies
        .filter((item) => item.substance.trim().length > 0)
        .map((item) => ({
          substance: item.substance.trim(),
          severity: item.severity || 'moderate',
          reaction: item.reaction.trim(),
        })),
      conditions: conditions
        .filter((item) => item.name.trim().length > 0)
        .map((item) => ({
          name: item.name.trim(),
          status: item.status || 'active',
          notes: item.notes.trim(),
        })),
      medications: medications
        .filter((item) => item.name.trim().length > 0)
        .map((item) => ({
          name: item.name.trim(),
          dosage: item.dosage.trim(),
          frequency: item.frequency || 'daily',
          purpose: item.purpose.trim(),
        })),
    };

    if (heightValue) {
      payload.height = { value: heightValue, unit: 'cm' };
    }

    if (weightValue) {
      payload.weight = { value: weightValue, unit: 'kg' };
    }

    try {
      await dispatch(saveSignupMedicalInfo({ authId, medicalData: payload })).unwrap();
      setErrorMessage('');
      setSuccessMessage('Medical information saved successfully.');
      return true;
    } catch (error) {
      const message =
        typeof error === 'string' ? error : 'Failed to save medical information.';
      setSuccessMessage('');
      setErrorMessage(message);
      return false;
    }
  };

  useImperativeHandle(ref, () => ({
    handleSubmit,
  }));

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

      {isLoadingMedical ? (
        <View style={styles.infoBox}>
          <Ionicons name="sync" size={hp('2%')} color="#2F80ED" />
          <Text style={styles.infoText}>Loading saved medical information...</Text>
        </View>
      ) : null}

      {hasExistingData ? (
        <View style={styles.readOnlyBanner}>
          <Ionicons name="lock-closed" size={hp('2%')} color="#2F80ED" />
          <Text style={styles.readOnlyText}>
            Existing medical information found. Fields are read-only during signup.
          </Text>
        </View>
      ) : null}

      <View
        pointerEvents={hasExistingData ? 'none' : 'auto'}
        style={hasExistingData ? styles.readOnlySection : undefined}
      >
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
        <TextInput
          placeholder="YYYY-MM-DD"
          style={styles.input}
          value={toInputDate(dateOfBirth)}
          onChangeText={(value) => setDateOfBirth(toDateOrNull(value))}
        />
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

      <TouchableOpacity
        style={[
          styles.primaryButton,
          (isSavingMedical || hasExistingData) && styles.primaryButtonDisabled,
        ]}
        onPress={handleSubmit}
        disabled={isSavingMedical || hasExistingData}
      >
        <Text style={styles.primaryButtonText}>
          {isSavingMedical ? 'Saving...' : 'Review Medical Info'}
        </Text>
      </TouchableOpacity>
      </View>

      <View style={styles.securityRow}>
        <Ionicons name="lock-closed" size={hp('1.8%')} color="#2F80ED" />
        <Text style={styles.securityText}>
          Your medical data is encrypted and shared only with verified responders during an active SOS.
        </Text>
      </View>
    </ScrollView>
  );
});

MedicalInfoScreen.displayName = 'MedicalInfoScreen';
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
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp('2%'),
    backgroundColor: '#E8F1FF',
    borderRadius: 12,
    padding: wp('3%'),
    marginBottom: hp('2%'),
  },
  infoText: {
    color: '#1D4ED8',
    flex: 1,
    fontSize: hp('1.5%'),
  },
  readOnlyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp('2%'),
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: wp('3%'),
    marginBottom: hp('2%'),
  },
  readOnlyText: {
    color: '#1E4E8C',
    flex: 1,
    fontSize: hp('1.5%'),
    fontWeight: '600',
  },
  readOnlySection: {
    opacity: 0.8,
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
  primaryButtonDisabled: {
    backgroundColor: '#8BAFD9',
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
