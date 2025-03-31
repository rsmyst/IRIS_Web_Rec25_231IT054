import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("Please define the MONGODB_URI environment variable");
  process.exit(1);
}

// Sample data for seeding
const users = [
  {
    _id: new ObjectId(),
    name: "Admin User",
    email: "janani@nitk.com",
    password: await bcrypt.hash("12345678", 10),
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: new ObjectId(),
    name: "Student One",
    email: "student1@example.com",
    password: await bcrypt.hash("12345678", 10),
    role: "student",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: new ObjectId(),
    name: "Student Two",
    email: "student2@example.com",
    password: await bcrypt.hash("12345678", 10),
    role: "student",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const infrastructure = [
  {
    _id: new ObjectId(),
    name: "Badminton Court A",
    location: "Sports Complex, Ground Floor",
    availability: true,
    capacity: 4,
    operatingHours: {
      open: "08:00",
      close: "22:00",
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: new ObjectId(),
    name: "Tennis Court 1",
    location: "Outdoor Sports Area",
    availability: true,
    capacity: 4,
    operatingHours: {
      open: "06:00",
      close: "20:00",
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: new ObjectId(),
    name: "Basketball Court",
    location: "Sports Complex, First Floor",
    availability: true,
    capacity: 10,
    operatingHours: {
      open: "09:00",
      close: "21:00",
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: new ObjectId(),
    name: "Swimming Pool",
    location: "Aquatic Center",
    availability: true,
    capacity: 30,
    operatingHours: {
      open: "07:00",
      close: "19:00",
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Equipment data with properly formatted fields matching the Mongoose schema
const equipment = [
  {
    _id: new ObjectId(),
    name: "Badminton Racket",
    category: "Racket Sports",
    quantity: 20,
    availability: "available", // Must match enum values in schema: "available", "unavailable", "maintenance"
    condition: "good", // Must match enum values in schema: "new", "good", "fair", "poor"
    location: "Sports Equipment Room",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: new ObjectId(),
    name: "Basketball",
    category: "Ball Sports",
    quantity: 15,
    availability: "available",
    condition: "good",
    location: "Sports Equipment Room",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: new ObjectId(),
    name: "Tennis Racket",
    category: "Racket Sports",
    quantity: 10,
    availability: "available",
    condition: "good",
    location: "Sports Equipment Room",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: new ObjectId(),
    name: "Soccer Ball",
    category: "Ball Sports",
    quantity: 8,
    availability: "available",
    condition: "good",
    location: "Sports Equipment Room",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: new ObjectId(),
    name: "Volleyball",
    category: "Ball Sports",
    quantity: 6,
    availability: "available",
    condition: "new",
    location: "Sports Equipment Room",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: new ObjectId(),
    name: "Cricket Bat",
    category: "Cricket Equipment",
    quantity: 12,
    availability: "available",
    condition: "good",
    location: "Sports Equipment Room",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: new ObjectId(),
    name: "Cricket Ball",
    category: "Cricket Equipment",
    quantity: 24,
    availability: "available",
    condition: "good",
    location: "Sports Equipment Room",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: new ObjectId(),
    name: "Table Tennis Paddles",
    category: "Racket Sports",
    quantity: 8,
    availability: "available",
    condition: "fair",
    location: "Indoor Sports Room",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: new ObjectId(),
    name: "Table Tennis Balls",
    category: "Racket Sports",
    quantity: 30,
    availability: "available",
    condition: "good",
    location: "Indoor Sports Room",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: new ObjectId(),
    name: "Swimming Goggles",
    category: "Swimming Equipment",
    quantity: 15,
    availability: "available",
    condition: "good",
    location: "Aquatic Center",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: new ObjectId(),
    name: "Yoga Mat",
    category: "Fitness Equipment",
    quantity: 20,
    availability: "available",
    condition: "good",
    location: "Fitness Room",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Create bookings for today and tomorrow
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);

const infrastructureBookings = [
  {
    _id: new ObjectId(),
    user: users[1]._id, // Student One
    infrastructure: infrastructure[0]._id, // Badminton Court A
    date: new Date(),
    startTime: "14:00",
    endTime: "15:00",
    status: "approved",
    remarks: "Approved by admin",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: new ObjectId(),
    user: users[2]._id, // Student Two
    infrastructure: infrastructure[1]._id, // Tennis Court 1
    date: new Date(),
    startTime: "16:00",
    endTime: "17:00",
    status: "pending",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: new ObjectId(),
    user: users[1]._id, // Student One
    infrastructure: infrastructure[0]._id, // Badminton Court A
    date: tomorrow,
    startTime: "10:00",
    endTime: "11:00",
    status: "pending",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: new ObjectId(),
    user: users[2]._id, // Student Two
    infrastructure: infrastructure[1]._id, // Tennis Court 1
    date: tomorrow,
    startTime: "11:00",
    endTime: "12:00",
    status: "pending",
    waitlistPosition: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Updated equipmentBookings to align with the new schema
const equipmentBookings = [
  {
    _id: new ObjectId(),
    user: users[1]._id, // Student One
    equipment: equipment[0]._id, // Badminton Racket
    quantity: 2,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 60 * 60 * 1000), // 1 hour later
    status: "approved",
    remarks: "Approved by admin",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: new ObjectId(),
    user: users[2]._id, // Student Two
    equipment: equipment[2]._id, // Tennis Racket
    quantity: 1,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 60 * 60 * 1000), // 1 hour later
    status: "pending",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Sample notifications
const notifications = [
  {
    _id: new ObjectId(),
    user: users[1]._id, // Student One
    title: "Booking Approved: Badminton Court A",
    message: `Your booking for Badminton Court A on ${new Date().toLocaleDateString()} at 14:00 has been approved.`,
    type: "booking_status",
    isRead: false,
    relatedBooking: infrastructureBookings[0]._id,
    bookingType: "InfrastructureBooking",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: new ObjectId(),
    user: users[2]._id, // Student Two
    title: "Waitlist Update: Tennis Court 1",
    message: `You are now at position #1 on the waitlist for Tennis Court 1 on ${tomorrow.toLocaleDateString()} at 11:00.`,
    type: "waitlist",
    isRead: false,
    relatedBooking: infrastructureBookings[3]._id,
    bookingType: "InfrastructureBooking",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

async function seedDatabase() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db();

    // Clear existing data
    await db.collection("users").deleteMany({});
    await db.collection("infrastructures").deleteMany({});

    // IMPORTANT: Use "equipments" collection name to match Mongoose pluralization
    await db.collection("equipments").deleteMany({});

    await db.collection("infrastructurebookings").deleteMany({});
    await db.collection("equipmentbookings").deleteMany({});
    await db.collection("notifications").deleteMany({});

    console.log("Cleared existing data");

    // Insert seed data
    await db.collection("users").insertMany(users);
    console.log(`Inserted ${users.length} users`);

    await db.collection("infrastructures").insertMany(infrastructure);
    console.log(`Inserted ${infrastructure.length} infrastructure items`);

    // IMPORTANT: Use "equipments" collection name to match Mongoose pluralization
    await db.collection("equipments").insertMany(equipment);
    console.log(
      `Inserted ${equipment.length} equipment items into the 'equipments' collection`
    );

    await db
      .collection("infrastructurebookings")
      .insertMany(infrastructureBookings);
    console.log(
      `Inserted ${infrastructureBookings.length} infrastructure bookings`
    );

    await db.collection("equipmentbookings").insertMany(equipmentBookings);
    console.log(`Inserted ${equipmentBookings.length} equipment bookings`);

    await db.collection("notifications").insertMany(notifications);
    console.log(`Inserted ${notifications.length} notifications`);

    // Verify equipment data was inserted correctly
    const equipmentCount = await db.collection("equipments").countDocuments();
    console.log(
      `Verified equipment count in 'equipments' collection: ${equipmentCount}`
    );

    console.log("Database seeding completed successfully!");
    console.log("\nYou can now log in with:");
    console.log("Admin: janani@nitk.com / 12345678");
    console.log("Student: student1@example.com / 12345678");
    console.log("Student: student2@example.com / 12345678");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await client.close();
    console.log("MongoDB connection closed");
  }
}

seedDatabase();
