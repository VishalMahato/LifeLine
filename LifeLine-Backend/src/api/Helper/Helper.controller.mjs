import HelperService from './Helper.service.mjs';

const helperService = new HelperService();

class HelperController {
  createProfile = async (req, res, next) => {
    try {
      const helper = await helperService.createProfile(req.body);
      res.status(201).json({ success: true, data: helper });
    } catch (error) {
      next(error);
    }
  };

  getProfileById = async (req, res, next) => {
    try {
      const { helperId } = req.params;
      const helper = await helperService.getProfileById(helperId);

      if (!helper) {
        return res.status(404).json({ success: false, message: 'Helper not found' });
      }

      return res.status(200).json({ success: true, data: helper });
    } catch (error) {
      return next(error);
    }
  };

  updateAvailability = async (req, res, next) => {
    try {
      const { helperId } = req.params;
      const { availability } = req.body;
      const helper = await helperService.updateAvailability(helperId, availability);

      if (!helper) {
        return res.status(404).json({ success: false, message: 'Helper not found' });
      }

      return res.status(200).json({ success: true, data: helper });
    } catch (error) {
      return next(error);
    }
  };
}

export default HelperController;
