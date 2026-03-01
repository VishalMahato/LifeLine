import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Location from '../api/Location/Location.model.mjs';
import Helper from '../api/Helper/Helper.model.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function cleanupOrphanLocations() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/lifeline';

  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to database');

    const locations = await Location.find({ helperId: { $ne: null } }).select('_id helperId');
    let removed = 0;

    for (const location of locations) {
      const helperExists = await Helper.exists({ _id: location.helperId });
      if (!helperExists) {
        await Location.deleteOne({ _id: location._id });
        removed += 1;
      }
    }

    console.log(`Cleanup complete. Removed ${removed} orphan location records.`);
  } catch (error) {
    console.error('Cleanup failed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

cleanupOrphanLocations();
