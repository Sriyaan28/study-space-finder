const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const StudySpace = require('../models/StudySpace');
const Seat = require('../models/Seat');
const Reservation = require('../models/Reservation');
const Favorite = require('../models/Favorite');
const OccupancyHistory = require('../models/OccupancyHistory');

dotenv.config();

const sampleSpaces = [
  {
    name: 'Study Courtyard',
    building: 'D Block',
    floor: 'Floor 1',
    room: 'Corridor',
    description: 'A spacious open study area in D Block, suitable for casual studying, group discussions, and relaxing between classes. The open layout and natural light make it a comfortable spot for both individual and collaborative work.',
    capacity: 40,
    noiseLevel: 'moderate',
    wifiAvailable: false,
    amenities: ['Natural Daylight', 'Outdoor Seating Area'],
    openingHours: { open: '09:00', close: '18:00', days: 'Mon - Sun', is24Hours: false },
    status: 'open',
    imageUrl: 'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWl9lPqUhRA7aD6k6ncVzpB2V9lXX86IYO-V-m9_CvJK-5b2MTw7QrcyjCE1CZHGAr4H6L9PrmZbf4LE6dP-LUgV-CToTALSb4o9Bk4Cwa7CO9xXOV8620hBRJMur9wVefMSXkIwUQ=s1360-w1360-h1020-rw',
    featured: true,
    seatingGrid: { rows: 5, cols: 8 },
  },
  {
    name: 'D - Library',
    building: 'D Block',
    floor: 'Floor 1',
    room: 'Study Area',
    description: 'A quiet and well-organized study space in D Block, ideal for focused individual study, reading, and research. The library provides a calm environment for students to work between classes and prepare for exams.Vibrant collaborative environment ideal for software engineering teams, lab work, and group design reviews. Features high-res 4K external monitors and rollable whiteboards.',
    capacity: 72,
    noiseLevel: 'quiet',
    wifiAvailable: false,
    amenities: ['Group Discussion Tables', 'Books', 'Quiet Study', 'Power Outlets', 'Reference Books'],
    openingHours: { open: '11:00', close: '18:00', days: 'Mon - Sat', is24Hours: false },
    status: 'open',
    imageUrl: 'https://nba.anurag.edu.in/wp-content/uploads/2023/02/LIBRARY-1.png',
    featured: true,
    seatingGrid: { rows: 8, cols: 9 },
  },
  {
    name: 'Computer Lab - 1',
    building: 'D Block',
    floor: 'Floor 4',
    room: 'D512',
    description: 'A modern, high-specification computer lab with 66 workstations equipped with dual monitors, ergonomic chairs, and high-speed internet. Ideal for programming, software development, data analysis, and technical coursework. The lab features dedicated coding environments, ample power outlets, and controlled lighting for focused work.',
    capacity: 66,
    noiseLevel: 'moderate',
    wifiAvailable: true,
    amenities: ['Computers', 'Ergonomic Chairs', 'High-Speed Internet', 'Power Outlets', 'Controlled Lighting', 'Dedicated Workstations'],
    openingHours: { open: '09:00', close: '16:00', days: 'Mon - Fri', is24Hours: false },
    status: 'open',
    imageUrl: 'https://nba.anurag.edu.in/wp-content/uploads/2024/04/D512.png',
    featured: false,
    seatingGrid: { rows: 6, cols: 11 },
  },
  {
    name: 'Manas Auditorium',
    building: 'D Block',
    floor: 'Ground Floor',
    room: 'Auditorium',
    description: 'Manas Auditorium is a premier venue designed to host a variety of events, including large-scale conferences, academic lectures and institutional ceremonies. It features tiered seating for approximately 3000 attendees, a professional-grade sound and lighting system, a large stage with modular podium options, and integrated audiovisual technology for multimedia presentations.',
    capacity: 225,
    noiseLevel: 'moderate',
    wifiAvailable: true,
    amenities: ['Sound System', 'Lighting System', 'Stage', 'Podium', 'Audiovisual Technology', 'Wifi'],
    openingHours: { open: '09:00', close: '16:00', days: 'Mon - Sun', is24Hours: false },
    status: 'open',
    imageUrl: 'https://agi.anurag.edu.in/wp-content/themes/appply/images/infrstructure-2.jpg',
    featured: true,
    seatingGrid: { rows: 15, cols: 15 },
  },
  {
    name: 'Auditorium',
    building: 'G Block',
    floor: 'Ground Floor',
    room: 'Auditorium',
    description: 'Auditorium is a premier venue designed to host a variety of events, including large-scale conferences, academic lectures and institutional ceremonies. It features tiered seating for approximately 225 attendees, a professional-grade sound and lighting system, a large stage with modular podium options, and integrated audiovisual technology for multimedia presentations.',
    capacity: 180,
    noiseLevel: 'moderate',
    wifiAvailable: true,
    amenities: ['Sound System', 'Lighting System', 'Stage', 'Podium', 'Audiovisual Technology', 'Wifi'],
    openingHours: { open: '09:00', close: '16:00', days: 'Mon - Sun', is24Hours: false },
    status: 'open',
    imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTtyqQa9XDNKbNx_TcnEk2hi9OWCmh2jHeFPv86qCget63B0pIu8O_pkXs&s=10',
    featured: false,
    seatingGrid: { rows: 18, cols: 10 },
  },
  {
    name: 'Computer Lab - 2',
    building: 'E Block',
    floor: 'Floor 7',
    room: 'E703',
    description: 'Modern research study room tailored for medical and health science students with dual monitor workstations, anatomical reference models, and sanitized clean desks.',
    capacity: 140,
    noiseLevel: 'quiet',
    wifiAvailable: true,
    amenities: ['Computers', 'Wi-Fi', 'Quiet Environment', 'Spacious Tables', 'Air Conditioning'],
    openingHours: { open: '08:00', close: '21:00', days: 'Mon - Fri', is24Hours: false },
    status: 'open',
    imageUrl: 'https://cdn.sanity.io/images/v1rb7aqk/production/139c008c681ba45abe1a8cbcc6a11f28b8647ea0-9459x6306.jpg',
    featured: false,
    seatingGrid: { rows: 10, cols: 14 },
  },
];

const seedDatabase = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/study_space_finder';
    await mongoose.connect(uri);
    console.log('[Seed] Connected to MongoDB:', uri);

    // Clear existing collections
    await User.deleteMany({});
    await StudySpace.deleteMany({});
    await Seat.deleteMany({});
    await Reservation.deleteMany({});
    await Favorite.deleteMany({});
    await OccupancyHistory.deleteMany({});
    console.log('[Seed] Cleared existing data');

    // 1. Create Users
    console.log('[Seed] Creating demo users...');
    const adminUser = await User.create({
      name: 'Campus Administrator',
      email: 'admin@campus.edu',
      password: 'AdminPass123!',
      role: 'admin',
      status: 'active',
      department: 'Facilities & Campus Planning',
      studentId: 'ADM-001',
    });

    const studentUser = await User.create({
      name: 'Alex Rivera',
      email: 'student@campus.edu',
      password: 'StudentPass123!',
      role: 'student',
      status: 'active',
      department: 'Computer Science & Engineering',
      studentId: 'STU-849201',
    });

    const studentSarah = await User.create({
      name: 'Sarah Chen',
      email: 'sarah@campus.edu',
      password: 'StudentPass123!',
      role: 'student',
      status: 'active',
      department: 'Biomedical Engineering',
      studentId: 'STU-638192',
    });

    const blockedStudent = await User.create({
      name: 'Marcus Vance',
      email: 'marcus@campus.edu',
      password: 'StudentPass123!',
      role: 'student',
      status: 'blocked',
      department: 'School of Law',
      studentId: 'STU-918234',
    });

    console.log(`[Seed] Created ${await User.countDocuments()} users`);

    // 2. Create Study Spaces & Interactive BookMyShow-style Seats
    console.log('[Seed] Creating study spaces and seating grids...');
    const createdSpaces = [];
    const allSeats = [];
    const rowLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    for (const spaceData of sampleSpaces) {
      const space = await StudySpace.create(spaceData);
      createdSpaces.push(space);

      const rowsCount = space.seatingGrid?.rows || 4;
      const colsCount = space.seatingGrid?.cols || 6;

      for (let r = 0; r < rowsCount; r++) {
        const rowLetter = rowLetters[r];
        for (let c = 1; c <= colsCount; c++) {
          const seatId = `${rowLetter}${c}`;
          let seatType = 'standard';
          if (r === 0) seatType = 'quiet_pod';
          else if (c === 1 || c === colsCount) seatType = 'standing_desk';
          else if (r === rowsCount - 1) seatType = 'power_station';

          // Block a couple of random seats for realism
          const isBlocked = (r === 1 && c === 3 && spaceData.capacity > 25);

          allSeats.push({
            spaceId: space._id,
            seatId,
            row: rowLetter,
            column: c,
            label: `Seat ${seatId} (${seatType.replace('_', ' ')})`,
            type: seatType,
            status: isBlocked ? 'blocked' : 'available',
            hasPower: true,
            isWindowSeat: c === 1 || c === colsCount,
          });
        }
      }
    }

    const insertedSeats = await Seat.insertMany(allSeats);
    console.log(`[Seed] Created ${createdSpaces.length} study spaces with ${insertedSeats.length} total interactive seats.`);

    // 3. Create Sample Active & Completed Reservations
    console.log('[Seed] Creating reservations...');
    const now = new Date();

    // Active reservation for Alex Rivera in Engineering Library (Seat A1)
    const engSpace = createdSpaces[0];
    const engSeatA1 = insertedSeats.find((s) => s.spaceId.toString() === engSpace._id.toString() && s.seatId === 'A1');
    const engSeatA2 = insertedSeats.find((s) => s.spaceId.toString() === engSpace._id.toString() && s.seatId === 'A2');

    if (engSeatA1) {
      await Reservation.create({
        user: studentUser._id,
        studySpace: engSpace._id,
        seat: engSeatA1._id,
        seatId: engSeatA1.seatId,
        startTime: new Date(now.getTime() - 30 * 60 * 1000), // started 30 mins ago
        endTime: new Date(now.getTime() + 90 * 60 * 1000),   // ends in 90 mins
        durationMinutes: 120,
        status: 'active',
        purpose: 'Machine Learning Midterm Prep',
      });
    }

    if (engSeatA2) {
      await Reservation.create({
        user: studentSarah._id,
        studySpace: engSpace._id,
        seat: engSeatA2._id,
        seatId: engSeatA2.seatId,
        startTime: new Date(now.getTime() - 15 * 60 * 1000),
        endTime: new Date(now.getTime() + 105 * 60 * 1000),
        durationMinutes: 120,
        status: 'active',
        purpose: 'Genomics Data Analysis',
      });
    }

    // A few completed past reservations for Alex to build historical profile
    for (let dayOffset = 1; dayOffset <= 8; dayOffset++) {
      const pastSpace = createdSpaces[dayOffset % createdSpaces.length];
      const pastSeat = insertedSeats.find((s) => s.spaceId.toString() === pastSpace._id.toString() && s.seatId === `B${(dayOffset % 4) + 1}`);

      if (pastSeat) {
        const pastStart = new Date(now.getTime() - dayOffset * 24 * 60 * 60 * 1000);
        pastStart.setHours(14, 0, 0, 0);
        const pastEnd = new Date(pastStart.getTime() + 120 * 60 * 1000);

        await Reservation.create({
          user: studentUser._id,
          studySpace: pastSpace._id,
          seat: pastSeat._id,
          seatId: pastSeat.seatId,
          startTime: pastStart,
          endTime: pastEnd,
          durationMinutes: 120,
          status: 'completed',
          purpose: `Deep Study Session Day ${dayOffset}`,
        });
      }
    }

    console.log(`[Seed] Created ${await Reservation.countDocuments()} reservations.`);

    // 4. Create Favorites for Alex
    await Favorite.create([
      { user: studentUser._id, studySpace: createdSpaces[0]._id },
      { user: studentUser._id, studySpace: createdSpaces[1]._id },
    ]);
    console.log('[Seed] Created student favorites.');

    // 5. Seed Historical Occupancy Data (for statistical prediction engine)
    console.log('[Seed] Generating 30-day hourly occupancy records for statistical forecasting...');
    const historyRecords = [];

    createdSpaces.forEach((space) => {
      // Simulate occupancy patterns across all 7 days of week, hours 8 AM to 10 PM
      for (let day = 0; day < 7; day++) {
        for (let hour = 8; hour <= 22; hour++) {
          // Peak hours around 2 PM - 5 PM (14:00 - 17:00), weekdays higher than weekends
          const isWeekend = day === 0 || day === 6;
          let basePercent = isWeekend ? 35 : 55;

          if (hour >= 13 && hour <= 17) basePercent += 28; // peak afternoon
          else if (hour >= 18 && hour <= 21) basePercent += 15; // evening study
          else if (hour <= 10) basePercent -= 20; // morning ramp-up

          // Add minor space-specific flavor
          if (space.noiseLevel === 'silent') basePercent += 8;

          const occupancy = Math.min(95, Math.max(10, Math.round(basePercent + (Math.sin(hour) * 6))));
          const occupiedCount = Math.round((occupancy / 100) * space.capacity);

          historyRecords.push({
            studySpace: space._id,
            dayOfWeek: day,
            hourOfDay: hour,
            occupancyPercentage: occupancy,
            occupiedSeats: occupiedCount,
            totalSeats: space.capacity,
            sampleDate: new Date(now.getTime() - (7 - day) * 24 * 60 * 60 * 1000),
          });
        }
      }
    });

    await OccupancyHistory.insertMany(historyRecords);
    console.log(`[Seed] Successfully inserted ${historyRecords.length} historical occupancy data points for availability predictions!`);

    console.log('\n=============================================');
    console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY');
    console.log('=============================================');
    console.log('Demo Credentials for Testing:');
    console.log('  Admin Account:');
    console.log('    Email:    admin@campus.edu');
    console.log('    Password: AdminPass123!');
    console.log('  Student Account:');
    console.log('    Email:    student@campus.edu');
    console.log('    Password: StudentPass123!');
    console.log('  Student Account 2:');
    console.log('    Email:    sarah@campus.edu');
    console.log('    Password: StudentPass123!');
    console.log('  Blocked Student (Testing):');
    console.log('    Email:    marcus@campus.edu');
    console.log('    Password: StudentPass123!');
    console.log('=============================================\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]', error);
    process.exit(1);
  }
};

seedDatabase();
