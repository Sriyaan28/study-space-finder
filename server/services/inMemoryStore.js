const bcrypt = require('bcryptjs');

// In-Memory Store for instant zero-dependency local execution
class InMemoryStore {
  constructor() {
    this.users = [];
    this.spaces = [];
    this.seats = [];
    this.reservations = [];
    this.favorites = [];
    this.history = [];
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;

    const hash = await bcrypt.hash('AdminPass123!', 10);
    const studentHash = await bcrypt.hash('StudentPass123!', 10);

    // Users
    this.users = [
      {
        _id: 'usr_admin_1',
        name: 'Campus Administrator',
        email: 'admin@campus.edu',
        password: hash,
        role: 'admin',
        status: 'active',
        department: 'Campus Facilities & Planning',
        studentId: 'ADM-001',
        createdAt: new Date(),
      },
      {
        _id: 'usr_student_1',
        name: 'Alex Rivera',
        email: 'student@campus.edu',
        password: studentHash,
        role: 'student',
        status: 'active',
        department: 'Computer Science & Engineering',
        studentId: 'STU-849201',
        createdAt: new Date(),
      },
      {
        _id: 'usr_student_2',
        name: 'Sarah Chen',
        email: 'sarah@campus.edu',
        password: studentHash,
        role: 'student',
        status: 'active',
        department: 'Biomedical Sciences',
        studentId: 'STU-638192',
        createdAt: new Date(),
      },
      {
        _id: 'usr_student_3',
        name: 'Marcus Vance',
        email: 'marcus@campus.edu',
        password: studentHash,
        role: 'student',
        status: 'blocked',
        department: 'School of Law',
        studentId: 'STU-918234',
        createdAt: new Date(),
      },
    ];

    // Study Spaces
    this.spaces = [
      {
        _id: 'sp_1',
        name: 'Ada Lovelace Engineering Library',
        building: 'Engineering Hall (Building A)',
        floor: 'Floor 3',
        room: 'Room 302 - Silent Wing',
        description: 'A tranquil, light-filled high-focus sanctuary overlooking the north quad. Equipped with ultra-fast Wi-Fi 6E, individual sound-dampened pods, and height-adjustable standing desks.',
        capacity: 32,
        noiseLevel: 'silent',
        wifiAvailable: true,
        amenities: ['Wi-Fi 6E', 'Power Outlets at Every Seat', 'Standing Desks', 'Silent Zone', 'Natural Daylight', 'Ergonomic Chairs'],
        openingHours: { open: '06:00', close: '00:00', days: 'Mon - Sun', is24Hours: false },
        status: 'open',
        imageUrl: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1000&q=80',
        featured: true,
        seatingGrid: { rows: 4, cols: 8 },
        createdAt: new Date(),
      },
      {
        _id: 'sp_2',
        name: 'Turing Science & Tech Commons',
        building: 'Science & Innovation Center (Building C)',
        floor: 'Floor 1',
        room: 'Atrium Collaborative Pod 105',
        description: 'Vibrant collaborative environment ideal for software engineering teams, lab work, and group design reviews. Features high-res 4K external monitors and rollable whiteboards.',
        capacity: 30,
        noiseLevel: 'moderate',
        wifiAvailable: true,
        amenities: ['4K External Monitors', 'Rollable Whiteboards', 'Group Discussion Tables', 'Coffee Bar Access', 'Power Stations', 'Fast Wi-Fi'],
        openingHours: { open: '07:00', close: '23:00', days: 'Mon - Sat', is24Hours: false },
        status: 'open',
        imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1000&q=80',
        featured: true,
        seatingGrid: { rows: 5, cols: 6 },
        createdAt: new Date(),
      },
      {
        _id: 'sp_3',
        name: 'Hemingway Humanities Reading Room',
        building: 'Arts & Letters Complex (Building B)',
        floor: 'Floor 2',
        room: 'Reading Room 210',
        description: 'Classic oak-paneled reading room with green banker lamps, warm ambiance, and comfortable armchair alcoves. Perfect for deep reading, literature reviews, and essay writing.',
        capacity: 24,
        noiseLevel: 'quiet',
        wifiAvailable: true,
        amenities: ['Classic Oak Tables', 'Warm Banker Lamps', 'Quiet Study', 'Power Outlets', 'High Ceiling', 'Reference Books'],
        openingHours: { open: '08:00', close: '22:00', days: 'Mon - Fri', is24Hours: false },
        status: 'open',
        imageUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1000&q=80',
        featured: false,
        seatingGrid: { rows: 4, cols: 6 },
        createdAt: new Date(),
      },
      {
        _id: 'sp_4',
        name: 'Justice Quad Law Study Sanctum',
        building: 'Law School Quadrangle',
        floor: 'Floor 4',
        room: 'Law Library Carrels 401-424',
        description: 'Strict silent policy enforced. Individual acoustic study carrels with privacy partitions, dedicated reading lights, and extensive legal databases.',
        capacity: 24,
        noiseLevel: 'silent',
        wifiAvailable: true,
        amenities: ['Acoustic Privacy Carrels', 'Dedicated Task Lamps', 'Zero-Noise Policy', 'Dual Power Plugs', 'Ergonomic Mesh Seating'],
        openingHours: { open: '07:30', close: '23:30', days: 'Mon - Sun', is24Hours: false },
        status: 'open',
        imageUrl: 'https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&w=1000&q=80',
        featured: true,
        seatingGrid: { rows: 4, cols: 6 },
        createdAt: new Date(),
      },
      {
        _id: 'sp_5',
        name: 'Student Union Skyline 24/7 Lounge',
        building: 'Campus Center & Student Union',
        floor: 'Floor 5',
        room: 'Skyline Terrace Lounge',
        description: 'Panoramic 5th-floor campus views, comfortable booth seating, charging stations, and 24/7 access for registered students during midterm and finals weeks.',
        capacity: 35,
        noiseLevel: 'moderate',
        wifiAvailable: true,
        amenities: ['24/7 Keycard Access', 'Skyline View', 'Comfortable Booths', 'Microwave & Vending', 'USB-C Fast Charging', 'Wi-Fi 6'],
        openingHours: { open: '00:00', close: '23:59', days: 'Mon - Sun', is24Hours: true },
        status: 'open',
        imageUrl: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=1000&q=80',
        featured: false,
        seatingGrid: { rows: 5, cols: 7 },
        createdAt: new Date(),
      },
      {
        _id: 'sp_6',
        name: 'Bio-Medical Health Sciences Hub',
        building: 'Health Sciences Complex (Building D)',
        floor: 'Floor 2',
        room: 'Medical Study Lab 204',
        description: 'Modern research study room tailored for medical and health science students with dual monitor workstations, anatomical reference models, and sanitized clean desks.',
        capacity: 20,
        noiseLevel: 'quiet',
        wifiAvailable: true,
        amenities: ['Dual Monitors', 'Clean Sanitized Desks', 'Fast Wi-Fi', 'Quiet Environment', 'Standing Desks', 'Spacious Tables'],
        openingHours: { open: '08:00', close: '21:00', days: 'Mon - Fri', is24Hours: false },
        status: 'open',
        imageUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1000&q=80',
        featured: false,
        seatingGrid: { rows: 4, cols: 5 },
        createdAt: new Date(),
      },
    ];

    // Seats Generator
    const rowLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    this.spaces.forEach((space) => {
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

          const isBlocked = (r === 1 && c === 3 && space.capacity > 25);

          this.seats.push({
            _id: `seat_${space._id}_${seatId}`,
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
    });

    // Sample Reservations
    const now = new Date();
    this.reservations = [
      {
        _id: 'res_active_1',
        user: this.users[1],
        studySpace: this.spaces[0],
        seat: this.seats.find((s) => s.spaceId === 'sp_1' && s.seatId === 'A1') || this.seats[0],
        seatId: 'A1',
        startTime: new Date(now.getTime() - 25 * 60 * 1000),
        endTime: new Date(now.getTime() + 95 * 60 * 1000),
        durationMinutes: 120,
        status: 'active',
        purpose: 'Deep Study & Machine Learning Review',
        notes: '',
        createdAt: new Date(),
      },
      {
        _id: 'res_active_2',
        user: this.users[2],
        studySpace: this.spaces[0],
        seat: this.seats.find((s) => s.spaceId === 'sp_1' && s.seatId === 'A2') || this.seats[1],
        seatId: 'A2',
        startTime: new Date(now.getTime() - 10 * 60 * 1000),
        endTime: new Date(now.getTime() + 110 * 60 * 1000),
        durationMinutes: 120,
        status: 'active',
        purpose: 'Biomedical Genetics Project',
        notes: '',
        createdAt: new Date(),
      },
      {
        _id: 'res_past_1',
        user: this.users[1],
        studySpace: this.spaces[1],
        seat: this.seats.find((s) => s.spaceId === 'sp_2' && s.seatId === 'B2') || this.seats[2],
        seatId: 'B2',
        startTime: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        endTime: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000 + 120 * 60 * 1000),
        durationMinutes: 120,
        status: 'completed',
        purpose: 'Algorithm Design Session',
        notes: '',
        createdAt: new Date(),
      },
    ];

    // Favorites
    this.favorites = [
      { _id: 'fav_1', user: this.users[1]._id, studySpace: this.spaces[0] },
      { _id: 'fav_2', user: this.users[1]._id, studySpace: this.spaces[1] },
    ];

    // Historical Occupancy Records
    for (let day = 0; day < 7; day++) {
      for (let hour = 8; hour <= 22; hour++) {
        this.spaces.forEach((sp) => {
          const isWeekend = day === 0 || day === 6;
          let basePercent = isWeekend ? 35 : 55;
          if (hour >= 13 && hour <= 17) basePercent += 28;
          else if (hour >= 18 && hour <= 21) basePercent += 15;
          else if (hour <= 10) basePercent -= 20;

          const occupancy = Math.min(95, Math.max(10, Math.round(basePercent + (Math.sin(hour) * 6))));
          this.history.push({
            studySpace: sp._id,
            dayOfWeek: day,
            hourOfDay: hour,
            occupancyPercentage: occupancy,
            occupiedSeats: Math.round((occupancy / 100) * sp.capacity),
            totalSeats: sp.capacity,
          });
        });
      }
    }

    this.initialized = true;
    console.log('[InMemoryStore] Initialized with demo users, spaces, BookMyShow seats, and predictions.');
  }
}

const store = new InMemoryStore();
store.init();

module.exports = store;
