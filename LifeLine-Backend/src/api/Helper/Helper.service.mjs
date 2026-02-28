import Helper from './Helper.model.mjs';

class HelperService {
  createProfile = async (payload) => Helper.create(payload);

  getProfileById = async (helperId) => Helper.findById(helperId);

  updateAvailability = async (helperId, availability) =>
    Helper.findByIdAndUpdate(
      helperId,
      {
        availability,
        lastActive: new Date(),
      },
      { new: true, runValidators: true },
    );
}

export default HelperService;
