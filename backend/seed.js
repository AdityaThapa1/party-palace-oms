require('dotenv').config();
const db = require('./models');
const { User, Customer, Inventory, Booking, Payment } = db;

const seedDatabase = async () => {
  try {
    // Force sync will drop and recreate tables.
    await db.sequelize.sync({ force: true });
    console.log('Database synced! All tables are fresh.');

    // 1. Create Admin and Staff Users
    const admin = await User.create({
      name: process.env.ADMIN_NAME,
      email: process.env.ADMIN_EMAIL,
      password: 'admin123', // Raw password for admin
      role: 'Admin',
    });
    console.log(`Admin user '${admin.name}' created.`);

    const staff = await User.create({
      name: 'Staff User',
      email: 'staff@partypalace.com',
      password: 'staff123', // Raw password for staff
      role: 'Staff',
    });
    console.log(`Staff user '${staff.name}' created.`);

    // 2. Create Sample Inventory
    await Inventory.bulkCreate([
      { itemName: 'Plastic Chairs', quantity: 200, unit: 'pcs', lowStockThreshold: 50 },
      { itemName: 'Round Tables (10-seater)', quantity: 30, unit: 'pcs', lowStockThreshold: 5 },
      { itemName: 'Decorative String Lights', quantity: 50, unit: 'sets', lowStockThreshold: 10 },
      { itemName: 'Buffet Dinner Plate Set', quantity: 500, unit: 'plates', lowStockThreshold: 100 },
    ]);
    console.log('Sample inventory items created.');

    // 3. Create Sample Customers with Passwords
    const customer1 = await Customer.create({ 
      name: 'Hari Sharma', 
      phone: '9841000001', 
      email: 'hari.sharma@example.com', 
      address: 'Baneshwor, Kathmandu',
      password: 'password123' 
    });
    const customer2 = await Customer.create({ 
      name: 'Sita Rai', 
      phone: '9851000002', 
      email: 'sita.rai@example.com', 
      address: 'Jawalakhel, Lalitpur',
      password: 'password123' 
    });
    console.log('Sample customers with login credentials created.');

    // 4. Create Sample Bookings & Associated Payments
    const booking1 = await Booking.create({
      eventType: 'Wedding Reception',
      eventDate: '2024-05-20',
      startTime: '18:00', endTime: '22:00',
      guestCount: 150,
      totalAmount: 150000.00,
      status: 'Completed',
      notes: 'DJ and special lighting requested.',
      customerId: customer1.id,
      handledByUserId: admin.id,
    });
    await Payment.create({ bookingId: booking1.id, amount: 75000.00, paymentMethod: 'Bank Transfer', notes: 'Advance payment' });
    await Payment.create({ bookingId: booking1.id, amount: 75000.00, paymentMethod: 'Cash', notes: 'Final settlement' });

    const booking2 = await Booking.create({
      eventType: 'Birthday Party',
      eventDate: new Date(),
      startTime: '13:00', endTime: '16:00',
      guestCount: 50,
      totalAmount: 45000.00,
      status: 'Confirmed',
      customerId: customer2.id,
      handledByUserId: staff.id,
    });
    await Payment.create({ bookingId: booking2.id, amount: 20000.00, paymentMethod: 'E-Sewa', notes: 'Advance paid' });
     const booking3 = await Booking.create({
      eventType: 'Corporate Seminar',
      eventDate: '2024-07-10',
      startTime: '09:00', endTime: '17:00',
      guestCount: 80,
      totalAmount: 90000.00,
      status: 'Pending',
      notes: 'Projector and sound system needed.',
      customerId: customer1.id,
      handledByUserId: staff.id,
    });

    console.log('Sample bookings and payments created.');
    console.log('Seeding complete!');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await db.sequelize.close();
  }
};
seedDatabase();