import mongoose from 'mongoose';
import NGO from './NGO.model.mjs';
import * as NGOPaymentUtils from './NGOPayment.utils.mjs';

export default class NGOController {
  static async createPayment(req, res) {
    try {
      const { id } = req.params;
      const { amount, method, transactionId } = req.body;
      const payment = await NGOPaymentUtils.createNGOPayment({
        ngoId: id,
        amount,
        method,
        transactionId,
      });

      res.status(201).json({ success: true, data: payment });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async getPayments(req, res) {
    try {
      const { id } = req.params;
      const payments = await NGOPaymentUtils.getNGOPayments(id);
      res.status(200).json({ success: true, data: payments });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async updatePaymentStatus(req, res) {
    try {
      const { paymentId } = req.params;
      const { status } = req.body;
      const payment = await NGOPaymentUtils.updateNGOPaymentStatus(
        paymentId,
        status,
      );
      res.status(200).json({ success: true, data: payment });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async register(req, res) {
    try {
      const ngoData = req.body;
      const ngo = new NGO({
        name: ngoData.name,
        serviceType: ngoData.serviceType,
        contact: ngoData.contact,
        location: {
          type: 'Point',
          coordinates: ngoData?.location?.coordinates,
          address: ngoData?.location?.address,
        },
        documents: ngoData.documents || [],
        registrationStatus: 'pending',
      });

      await ngo.save();

      res.status(201).json({
        success: true,
        message: 'NGO registered successfully, pending approval.',
        data: ngo,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: `Failed to register NGO: ${error.message}`,
      });
    }
  }

  static async getNearby(req, res) {
    try {
      const { lat, lng, radius = 10000 } = req.query;

      if (!lat || !lng) {
        return res.status(400).json({
          success: false,
          message: 'Latitude and longitude are required.',
        });
      }

      const longitude = parseFloat(lng);
      const latitude = parseFloat(lat);
      const maxDistance = parseInt(radius, 10);

      if (
        Number.isNaN(longitude) ||
        Number.isNaN(latitude) ||
        Number.isNaN(maxDistance)
      ) {
        return res.status(400).json({
          success: false,
          message: 'Invalid coordinates provided.',
        });
      }

      const ngos = await NGO.find({
        'location.coordinates': {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [longitude, latitude],
            },
            $maxDistance: maxDistance,
          },
        },
        registrationStatus: 'approved',
      });

      return res.status(200).json({
        success: true,
        data: ngos,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: `Failed to get nearby NGOs: ${error.message}`,
      });
    }
  }

  static async getAll(req, res) {
    try {
      const ngos = await NGO.find({});
      res.status(200).json({
        success: true,
        data: ngos,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: `Failed to fetch NGOs: ${error.message}`,
      });
    }
  }

  static async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!['approved', 'rejected', 'pending'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status provided.',
        });
      }

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid NGO identifier.',
        });
      }

      const ngo = await NGO.findByIdAndUpdate(
        id,
        { registrationStatus: status },
        { new: true },
      );

      if (!ngo) {
        return res.status(404).json({
          success: false,
          message: 'NGO not found.',
        });
      }

      return res.status(200).json({
        success: true,
        message: `NGO status updated to ${status}.`,
        data: ngo,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: `Failed to update NGO status: ${error.message}`,
      });
    }
  }

  static async deleteNGO(req, res) {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid NGO identifier.',
        });
      }

      const ngo = await NGO.findByIdAndDelete(id);

      if (!ngo) {
        return res.status(404).json({
          success: false,
          message: 'NGO not found.',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'NGO deleted successfully.',
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: `Failed to delete NGO: ${error.message}`,
      });
    }
  }
}
