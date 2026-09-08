const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGO_URI = process.env.MONGO_URI;
const ADMIN_NAME = process.env.SEED_ADMIN_NAME;
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD;

if (!MONGO_URI || !ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error(
    'Missing required env vars. Set MONGO_URI, SEED_ADMIN_NAME, SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD before running this script.'
  );
  process.exit(1);
}

if (ADMIN_PASSWORD.length < 6) {
  console.error('SEED_ADMIN_PASSWORD must be at least 6 characters.');
  process.exit(1);
}

async function seedAdmin() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to DB');

    const db = mongoose.connection.db;
    const adminCollection = db.collection('admins');

    const existingAdmin = await adminCollection.findOne({ email: ADMIN_EMAIL });
    if (existingAdmin) {
      console.log('Admin already exists');
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);

    await adminCollection.insertOne({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
      failedLoginAttempts: 0,
      lockUntil: null
    });

    console.log('Admin seeded successfully');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seedAdmin();
