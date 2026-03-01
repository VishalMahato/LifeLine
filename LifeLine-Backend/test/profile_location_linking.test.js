import { jest } from '@jest/globals';
import mongoose from 'mongoose';
import Auth from '../src/api/Auth/v1/Auth.model.mjs';
import Helper from '../src/api/Helper/Helper.model.mjs';
import HelperService from '../src/api/Helper/Helper.service.mjs';
import Location from '../src/api/Location/Location.model.mjs';
import LocationService from '../src/api/Location/Location.service.mjs';
import User from '../src/api/User/User.Schema.mjs';
import UserService from '../src/api/User/User.service.mjs';

const objectId = (seed) => new mongoose.Types.ObjectId(seed);

const mockSelectResolved = (value) => ({
  select: jest.fn().mockResolvedValue(value),
});

const mockSortResolved = (value) => ({
  sort: jest.fn().mockResolvedValue(value),
});

describe('Profile linking and location ownership regression', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('UserService.createUser links created profile to Auth.userId', async () => {
    const authId = objectId('507f191e810c19729de860aa');

    jest.spyOn(User, 'findOne').mockResolvedValue(null);
    jest.spyOn(User.prototype, 'save').mockResolvedValue(undefined);
    const updateSpy = jest.spyOn(Auth, 'findByIdAndUpdate').mockResolvedValue({ _id: authId });

    await UserService.createUser({
      authId,
      fullName: 'Test User',
      email: 'user@example.com',
      phoneNumber: '9999999999',
    });

    expect(updateSpy).toHaveBeenCalledWith(authId, { userId: expect.any(mongoose.Types.ObjectId) });
  });

  test('HelperService.createHelper links created profile to Auth.helperId', async () => {
    const authId = objectId('507f191e810c19729de860ab');

    jest.spyOn(Helper, 'findOne').mockResolvedValue(null);
    jest.spyOn(Helper.prototype, 'save').mockResolvedValue(undefined);
    const updateSpy = jest.spyOn(Auth, 'findByIdAndUpdate').mockResolvedValue({ _id: authId });

    await HelperService.createHelper({
      authId,
      fullName: 'Test Helper',
      email: 'helper@example.com',
      phoneNumber: '8888888888',
    });

    expect(updateSpy).toHaveBeenCalledWith(authId, {
      helperId: expect.any(mongoose.Types.ObjectId),
    });
  });

  test('LocationService.createLocation resolves auth helper to helperId query', async () => {
    const authId = objectId('507f191e810c19729de860ac');
    const helperId = objectId('507f191e810c19729de860ad');

    const existingLocation = {
      _id: objectId('507f191e810c19729de860ae'),
      helperId,
      type: 'Point',
      coordinates: [88.434, 22.574],
      address: 'Kolkata',
      placeType: 'home',
      isActive: true,
      isVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastUpdated: new Date(),
    };

    jest.spyOn(Auth, 'findById').mockReturnValue(
      mockSelectResolved({
        _id: authId,
        role: 'helper',
        helperId,
        userId: null,
      }),
    );
    const findOneSpy = jest
      .spyOn(Location, 'findOne')
      .mockReturnValue(mockSortResolved(existingLocation));

    const response = await LocationService.createLocation({
      userId: authId.toString(),
      coordinates: [88.434, 22.574],
      address: 'Kolkata',
    });

    expect(findOneSpy).toHaveBeenCalledWith({ helperId, isActive: true });
    expect(response.helperId).toEqual(helperId);
    expect(response.userId).toBeUndefined();
  });

  test('LocationService.updateCurrentLocation resolves auth helper to helperId current query', async () => {
    const authId = objectId('507f191e810c19729de860af');
    const helperId = objectId('507f191e810c19729de860b0');

    const locationDoc = {
      _id: objectId('507f191e810c19729de860b1'),
      helperId,
      type: 'Point',
      coordinates: [88.434, 22.574],
      address: 'GPS Location',
      placeType: 'current',
      isActive: true,
      isVerified: false,
      provider: 'gps',
      createdAt: new Date(),
      updatedAt: new Date(),
      lastUpdated: new Date(),
      save: jest.fn().mockResolvedValue(undefined),
    };

    jest.spyOn(Auth, 'findById').mockReturnValue(
      mockSelectResolved({
        _id: authId,
        role: 'helper',
        helperId,
        userId: null,
      }),
    );
    const findOneSpy = jest.spyOn(Location, 'findOne').mockResolvedValue(locationDoc);

    const response = await LocationService.updateCurrentLocation(authId.toString(), {
      coordinates: [88.4342, 22.5743],
      accuracy: 5,
      provider: 'gps',
    });

    expect(findOneSpy).toHaveBeenCalledWith({
      helperId,
      placeType: 'current',
      isActive: true,
    });
    expect(locationDoc.save).toHaveBeenCalled();
    expect(response.helperId).toEqual(helperId);
    expect(response.userId).toBeUndefined();
  });
});
