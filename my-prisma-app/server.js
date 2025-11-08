const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer'); // Import multer
const path = require('path'); // Import path
const fs = require('fs'); // Import fs

const prisma = new PrismaClient();
const app = express();
const PORT = 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'gK7pWqXz9Bv2RjE';
const saltRounds = 10;

// Setup Folder Upload
const uploadDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json());

// Buat folder 'public' dapat diakses via URL
app.use('/public', express.static(path.join(__dirname, 'public')));

// Konfigurasi Multer (Penyimpanan File)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Simpan di 'public/uploads'
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'proof-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });


// --- DATA MASTER & Seeder ---
const LOCATIONS = [
  { id: "lokasi1", name: "Bank Sampah SetorCuan - Pulau Damar", lat: -5.376526338272906, lng: 105.28818970242115, address: "Jl. Pulau Damar Gg. Nusa Satu No.23" },
  { id: "lokasi2", name: "Bank Sampah SetorCuan - Raden Saleh", lat: -5.3646679769006695, lng: 105.29603722423592, address: "Jl. Raden Saleh, Way Huwi" },
  { id: "lokasi3", name: "Bank Sampah SetorCuan - ITERA", lat: -5.3609809417718, lng: 105.32137968044056, address: "Jl. Terusan Ryacudu, Way Huwi" },
];

async function seedData() {
  const recyclableCount = await prisma.recyclable.count();
  if (recyclableCount === 0) {
    console.log("Seeding Recyclables...");
    await prisma.recyclable.createMany({
      data: [
        { name: "plastik", pricePerKg: 5000 },
        { name: "kardus", pricePerKg: 4000 },
        { name: "kaca", pricePerKg: 7000 },
      ],
    });
  }

  const locationCount = await prisma.location.count();
  if (locationCount === 0) {
    console.log("Seeding Locations...");
    await prisma.location.createMany({
      data: LOCATIONS.map(l => ({ id: l.id, name: l.name, lat: l.lat, lng: l.lng, address: l.address })),
    });
  }

  console.log("Mencari admin user...");
  const adminUser = await prisma.user.findUnique({
    where: { username: 'admin' },
  });

  if (!adminUser) {
    console.log("Admin user not found, creating one...");
    const hashedPassword = await bcrypt.hash('admin123', saltRounds);
    await prisma.user.create({
      data: {
        username: 'admin',
        email: 'admin@setorcuan.com',
        password: hashedPassword,
        role: 'admin',
        profileCompleted: true,
      },
    });
    console.log("Admin user created successfully (admin/admin123).");
  } else {
    console.log("Admin user already exists.");
  }
}

seedData().catch(e => console.error("Seeding data gagal:", e));


// --- Middleware Otentikasi (INI YANG HILANG) ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (token == null) return res.sendStatus(401); // Unauthorized

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403); // Forbidden
    req.user = user;
    next();
  });
};

// --- Middleware Cek Admin (INI YANG HILANG) ---
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: "Akses ditolak. Memerlukan role admin." });
  }
  next();
};

// =================================
// --- ENDPOINT PUBLIC ---
// =================================

app.get('/api/locations', async (req, res) => {
  try {
    const locations = await prisma.location.findMany();
    res.json(locations);
  } catch (error) {
    res.status(500).json({ error: "Gagal mengambil lokasi." });
  }
});

app.get('/api/waste-prices', async (req, res) => {
   try {
    const prices = await prisma.recyclable.findMany();
    res.json(prices.map(p => ({ id: p.id, category: p.name, points: p.pricePerKg })));
  } catch (error) {
    res.status(500).json({ error: "Gagal mengambil harga sampah." });
  }
});

// =================================
// --- ENDPOINT OTENTIKASI (AUTH) ---
// =================================

app.post('/api/auth/register', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: "Semua field harus diisi" });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role: 'customer',
      },
    });
    res.status(201).json({ success: true, user: { id: user.id, username: user.username, email: user.email } });
  } catch (error) {
    if (error.code === 'P2002') {
      res.status(409).json({ error: "Username atau email sudah terdaftar" });
    } else {
      res.status(500).json({ error: "Gagal mendaftarkan pengguna", details: error.message });
    }
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { usernameOrEmail, password } = req.body;
  try {
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: usernameOrEmail },
          { username: usernameOrEmail },
        ],
      },
    });
    if (!user) {
      return res.status(401).json({ error: "Username/Email atau password salah" });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: "Username/Email atau password salah" });
    }
    const userPayload = { id: user.id, username: user.username, email: user.email, role: user.role };
    const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn: '7d' });
    delete user.password;
    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ error: "Terjadi kesalahan server", details: error.message });
  }
});

// =================================
// --- ENDPOINT USER (TERPROTEKSI) ---
// =================================

// Middleware ini SEKARANG sudah terdefinisi di atas
app.use('/api/user', authenticateToken);

app.get('/api/user/profile', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });
    if (!user) return res.status(404).json({ error: "User tidak ditemukan" });
    delete user.password;
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Gagal mengambil profil", details: error.message });
  }
});

app.put('/api/user/profile', async (req, res) => {
  const { whatsapp, firstName, lastName, ewallet, ewalletNumber, profileCompleted, address } = req.body;
  try {
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        whatsapp,
        firstName,
        lastName,
        ewallet,
        ewalletNumber,
        profileCompleted,
        address
      },
    });
    delete updatedUser.password;
    res.json({ success: true, user: updatedUser });
  } catch (error) {
    res.status(500).json({ error: "Gagal memperbarui profil", details: error.message });
  }
});

app.put('/api/user/password', async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ error: "User tidak ditemukan" });
    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) {
      return res.status(401).json({ error: "Password saat ini salah" });
    }
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedNewPassword },
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Gagal memperbarui password", details: error.message });
  }
});

// =================================
// --- ENDPOINT TRANSAKSI (TERPROTEKSI) ---
// =================================

app.use('/api/transactions', authenticateToken);

app.post('/api/transactions/sampah', async (req, res) => {
  const { kategori, berat, totalCoin, locationId } = req.body;
  try {
    const recyclable = await prisma.recyclable.findFirst({
      where: { name: kategori }
    });
    if (!recyclable) {
      return res.status(404).json({ error: `Kategori sampah '${kategori}' tidak ditemukan` });
    }
    const location = await prisma.location.findUnique({
      where: { id: locationId }
    });
    if (!location) {
        return res.status(404).json({ error: `Lokasi dengan ID '${locationId}' tidak ditemukan` });
    }
    const newDeposit = await prisma.deposit.create({
      data: {
        userId: req.user.id,
        recyclableId: recyclable.id,
        locationId: location.id,
        kategori: kategori,
        weightKg: parseFloat(berat),
        totalCoin: parseInt(totalCoin),
        status: 'pending',
      },
    });
    res.status(201).json({ success: true, id: newDeposit.id, transaction: newDeposit });
  } catch (error) {
    res.status(500).json({ error: "Gagal mengajukan tukar sampah", details: error.message });
  }
});

app.post('/api/transactions/poin', async (req, res) => {
  const { coins, harga } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ error: "User tidak ditemukan" });
    if (user.totalCoins < coins) {
      return res.status(400).json({ error: "Poin tidak mencukupi" });
    }
    const newWithdrawal = await prisma.withdrawal.create({
      data: {
        userId: req.user.id,
        amountCoin: parseInt(coins),
        amountRupiah: parseInt(harga),
        status: 'pending',
      },
    });
    res.status(201).json({ success: true, id: newWithdrawal.id, transaction: newWithdrawal });
  } catch (error) {
    res.status(500).json({ error: "Gagal mengajukan tukar poin", details: error.message });
  }
});

app.get('/api/transactions', async (req, res) => {
  try {
    const deposits = await prisma.deposit.findMany({
      where: { userId: req.user.id },
      include: { user: { select: { username: true } }, location: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });
    const withdrawals = await prisma.withdrawal.findMany({
      where: { userId: req.user.id },
      include: { user: { select: { username: true } } },
      orderBy: { createdAt: 'desc' },
    });
    
    const formattedDeposits = deposits.map(d => ({
      id: d.id,
      type: 'sampah',
      userId: d.userId,
      username: d.user.username,
      locationId: d.locationId,
      locationName: d.location?.name || 'Lokasi Dihapus',
      kategori: d.kategori,
      berat: d.weightKg,
      harga: d.totalCoin,
      status: d.status.toLowerCase().replace('validated', 'berhasil').replace('cancelled', 'dibatalkan'),
      createdAt: d.createdAt.toISOString(),
      updatedAt: d.updatedAt.toISOString(),
    }));
    
    const formattedWithdrawals = withdrawals.map(w => ({
      id: w.id,
      type: 'poin',
      userId: w.userId,
      username: w.user.username,
      coins: w.amountCoin,
      harga: w.amountCoin,
      status: w.status.toLowerCase().replace('completed', 'berhasil').replace('processing', 'pending').replace('cancelled', 'dibatalkan'),
      createdAt: w.createdAt.toISOString(),
      updatedAt: w.updatedAt.toISOString(),
    }));

    const allTransactions = [...formattedDeposits, ...formattedWithdrawals]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json(allTransactions);
  } catch (error) {
    res.status(500).json({ error: "Gagal mengambil history transaksi", details: error.message });
  }
});


// =================================
// --- ENDPOINT ADMIN (TERPROTEKSI) ---
// =================================

app.use('/api/admin', authenticateToken, isAdmin);

app.get('/api/admin/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { role: 'customer' },
      select: {
        id: true,
        username: true,
        totalCoins: true
      },
      orderBy: { username: 'asc' }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Gagal mengambil data user", details: error.message });
  }
});

app.get('/api/admin/transactions', async (req, res) => {
  try {
    const deposits = await prisma.deposit.findMany({
      include: { 
        user: { select: { id: true, username: true, firstName: true, lastName: true, whatsapp: true } }, 
        location: { select: { name: true } } 
      },
      orderBy: { createdAt: 'desc' },
    });
    const withdrawals = await prisma.withdrawal.findMany({
      include: { 
        user: { select: { id: true, username: true, firstName: true, lastName: true, whatsapp: true, ewallet: true, ewalletNumber: true } } 
      },
      orderBy: { createdAt: 'desc' },
    });
    
    const formattedDeposits = deposits.map(d => ({
      id: d.id,
      type: 'deposit',
      status: d.status.toLowerCase().replace('validated', 'berhasil').replace('cancelled', 'dibatalkan'),
      totalCoin: d.totalCoin,
      weightKg: d.weightKg,
      kategori: d.kategori,
      location: d.location?.name || 'Lokasi Dihapus',
      description: null,
      ewallet: null,
      ewalletNumber: null,
      createdAt: d.createdAt.toISOString(),
      user: d.user
    }));
    
    const formattedWithdrawals = withdrawals.map(w => ({
      id: w.id,
      type: 'withdrawal',
      status: w.status.toLowerCase().replace('completed', 'berhasil').replace('processing', 'pending').replace('cancelled', 'dibatalkan'),
      totalCoin: w.amountCoin,
      weightKg: null,
      kategori: null,
      location: null,
      description: null,
      ewallet: w.user.ewallet,
      ewalletNumber: w.user.ewalletNumber,
      proofUrl: w.proofUrl,
      createdAt: w.createdAt.toISOString(),
      user: w.user
    }));

    const allTransactions = [...formattedDeposits, ...formattedWithdrawals]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json(allTransactions);
  } catch (error) {
     res.status(500).json({ error: "Gagal mengambil transaksi admin", details: error.message });
  }
});

app.post('/api/admin/upload-proof', upload.single('proof'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Tidak ada file yang di-upload." });
  }
  const fileUrl = `${req.protocol}://${req.get('host')}/public/uploads/${req.file.filename}`;
  res.json({ success: true, url: fileUrl });
});

app.put('/api/admin/transactions/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status, proofUrl } = req.body;
  
  try {
    let updatedTransaction;
    const transId = id;
    const deposit = await prisma.deposit.findUnique({ where: { id: transId } });
    if (deposit) {
      if (deposit.status !== 'pending') {
        return res.status(400).json({ error: "Hanya transaksi pending yang bisa diubah" });
      }
      let newStatus;
      if (status === 'berhasil' || status === 'validated') {
        newStatus = 'validated';
      } else if (status === 'dibatalkan' || status === 'cancelled' || status === 'rejected') {
        newStatus = 'cancelled';
      } else {
        return res.status(400).json({ error: `Status tidak valid untuk deposit: ${status}` });
      }
      updatedTransaction = await prisma.deposit.update({
        where: { id: transId },
        data: { 
          status: newStatus,
          validatedBy: req.user.id
        },
      });
      if (newStatus === 'validated') {
        await prisma.user.update({
          where: { id: deposit.userId },
          data: {
            totalCoins: { increment: deposit.totalCoin },
            totalKg: { increment: deposit.weightKg },
            coinExchanged: { increment: deposit.totalCoin }
          },
        });
      }
    } else {
      const withdrawal = await prisma.withdrawal.findUnique({ where: { id: transId } });
      if (withdrawal) {
        let newStatus = status;
        if (status === 'rejected') {
          newStatus = 'cancelled';
        }
        const validStatuses = ['processing', 'completed', 'cancelled'];
        if (!validStatuses.includes(newStatus)) {
            return res.status(400).json({ error: `Status tidak valid untuk withdrawal: ${status}` });
        }
        if (withdrawal.status !== 'pending' && withdrawal.status !== 'processing') {
            return res.status(400).json({ error: "Transaksi ini sudah selesai atau dibatalkan." });
        }
        if (newStatus === 'completed' && !proofUrl) {
            return res.status(400).json({ error: "Bukti transfer (proofUrl) wajib diisi untuk menyelesaikan transaksi." });
        }
        updatedTransaction = await prisma.withdrawal.update({
          where: { id: transId },
          data: { 
            status: newStatus,
            processedBy: req.user.id,
            proofUrl: newStatus === 'completed' ? proofUrl : withdrawal.proofUrl
          },
        });
        if (newStatus === 'completed') {
           await prisma.user.update({
            where: { id: withdrawal.userId },
            data: {
              totalCoins: { decrement: withdrawal.amountCoin },
            },
          });
        }
      } else {
        return res.status(404).json({ error: "Transaksi tidak ditemukan" });
      }
    }
    res.json({ success: true, transaction: updatedTransaction });
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ error: "Gagal memperbarui status transaksi", details: error.message });
  }
});

app.post('/api/admin/points/adjust', async (req, res) => {
  const { userId, amount, operation } = req.body;
  try {
    const userIdInt = parseInt(userId);
    const amountInt = parseInt(amount);
    if (isNaN(userIdInt) || isNaN(amountInt)) {
      return res.status(400).json({ error: "User ID dan Amount harus angka" });
    }
    const user = await prisma.user.findUnique({ where: { id: userIdInt } });
    if (!user) {
      return res.status(404).json({ error: `User dengan ID ${userIdInt} tidak ditemukan` });
    }
    if (operation === 'subtract' && user.totalCoins < amountInt) {
      return res.status(400).json({ error: `Poin user tidak mencukupi. Sisa poin: ${user.totalCoins}` });
    }
    const updateOperation = operation === 'add' ? { increment: amountInt } : { decrement: amountInt };
    const updatedUser = await prisma.user.update({
      where: { id: userIdInt },
      data: {
        totalCoins: updateOperation,
      },
    });
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: `${operation} points`,
        targetTable: 'User',
        targetId: updatedUser.id,
      }
    });
    res.json({ success: true, newTotalCoins: updatedUser.totalCoins });
  } catch (error) {
     if (error.code === 'P2025') {
       return res.status(404).json({ error: `User dengan ID ${userId} tidak ditemukan` });
     }
    res.status(500).json({ error: "Gagal mengubah poin user", details: error.message });
  }
});


// Server Listener
app.listen(PORT, () => {
  console.log(`🚀 Server backend berjalan di http://localhost:${PORT}`);
});