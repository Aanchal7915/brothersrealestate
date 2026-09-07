const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGO_URI = 'mongodb+srv://aan:2hUO8ZrbsQaR5pzy@cluster0.zxddb3t.mongodb.net/Arpanamtech';

async function seedAdmin() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to DB');

    const db = mongoose.connection.db;
    const adminCollection = db.collection('admins');

    const existingAdmin = await adminCollection.findOne({ email: 'aanchal2115@gmail.com' });
    if (existingAdmin) {
      console.log('Admin already exists');
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('123456', salt);

    await adminCollection.insertOne({
      name: 'Aanchal',
      email: 'aanchal2115@gmail.com',
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
