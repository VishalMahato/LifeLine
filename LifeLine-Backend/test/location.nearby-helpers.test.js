import { jest } from '@jest/globals';
import mongoose from 'mongoose';
import Location from '../src/api/Location/Location.model.mjs';
import LocationService from '../src/api/Location/Location.service.mjs';

describe('LocationService.searchNearbyHelpers', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('returns backend-formatted helper cards with distance and response rate', async () => {
    const helperId = new mongoose.Types.ObjectId();

    const rows = [
      {
        coordinates: [88.434, 22.574],
        helperId: {
          _id: helperId,
          authId: {
            name: 'Dr. Sarah Jenkins',
            profileImage: 'https://example.com/helper.jpg',
            phoneNumber: '+1555123456',
            role: 'helper',
          },
          credentials: [{ title: 'MD' }],
          profession: 'Cardiologist',
          responseRate: '98%',
          successRate: 92,
          isVerified: true,
        },
      },
    ];

    const findSpy = jest.spyOn(Location, 'find').mockReturnValue({
      populate: jest.fn().mockReturnValue({
        limit: jest.fn().mockResolvedValue(rows),
      }),
    });

    const response = await LocationService.searchNearbyHelpers({ lat: 22.575, lng: 88.435 }, 10);

    expect(findSpy).toHaveBeenCalledTimes(1);
    expect(response).toHaveLength(1);
    expect(response[0]).toEqual(
      expect.objectContaining({
        id: String(helperId),
        name: 'Dr. Sarah Jenkins',
        role: 'helper',
        degree: 'MD',
        responseRate: '98%',
        avatar: 'https://example.com/helper.jpg',
        verified: true,
        latitude: 22.574,
        longitude: 88.434,
        phone: '+1555123456',
      }),
    );
    expect(response[0].distance).toMatch(/km$/);
  });

  test('filters out rows missing helper auth profile or coordinates', async () => {
    const rows = [
      { coordinates: [88.434, 22.574], helperId: null },
      {
        coordinates: [88.434, 22.574],
        helperId: {
          _id: new mongoose.Types.ObjectId(),
          authId: null,
        },
      },
      {
        coordinates: [],
        helperId: {
          _id: new mongoose.Types.ObjectId(),
          authId: { name: 'x' },
        },
      },
    ];

    jest.spyOn(Location, 'find').mockReturnValue({
      populate: jest.fn().mockReturnValue({
        limit: jest.fn().mockResolvedValue(rows),
      }),
    });

    const response = await LocationService.searchNearbyHelpers({ lat: 22.575, lng: 88.435 }, 5);
    expect(response).toEqual([]);
  });
});
