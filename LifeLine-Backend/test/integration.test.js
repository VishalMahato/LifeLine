import assert from 'node:assert/strict';
import test from 'node:test';
import HelperService from '../src/api/Helper/Helper.service.mjs';
import UserService from '../src/api/User/User.service.mjs';
import MedicalService from '../src/api/Medical/Medical.service.mjs';
import LocationService from '../src/api/Location/Location.service.mjs';
import EmergencyService from '../src/api/Emergency/Emergency.service.mjs';
import AuthService from '../src/api/Auth/v1/Auth.service.mjs';

test('HelperService exports expected methods', () => {
  assert.equal(typeof HelperService.createHelper, 'function');
  assert.equal(typeof HelperService.getHelperById, 'function');
});

test('UserService exports expected methods', () => {
  assert.equal(typeof UserService.createUser, 'function');
  assert.equal(typeof UserService.getUserById, 'function');
});

test('MedicalService exports expected methods', () => {
  assert.equal(typeof MedicalService.createMedicalInfo, 'function');
  assert.equal(typeof MedicalService.getMedicalInfoById, 'function');
});

test('LocationService exports expected methods', () => {
  assert.equal(typeof LocationService.createLocation, 'function');
  assert.equal(typeof LocationService.getLocationById, 'function');
});

test('EmergencyService exports expected methods', () => {
  assert.equal(typeof EmergencyService.createEmergency, 'function');
  assert.equal(typeof EmergencyService.triggerSOS, 'function');
  assert.equal(typeof EmergencyService.getEmergency, 'function');
});

test('AuthService exports expected methods', () => {
  assert.equal(typeof AuthService.getUserById, 'function');
});
