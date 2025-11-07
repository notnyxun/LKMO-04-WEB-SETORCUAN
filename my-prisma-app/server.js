// server.js

const express = require('express');

// Inisialisasi Express
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const app = express();
const PORT = 4000;

// Middleware untuk mem-parsing JSON dari permintaan masuk
app.use(express.json());

// Endpoint API dasar untuk memastikan server berjalan
app.get('/', (req, res) => {
  res.send('Server Backend SetorCuan berjalan!');
});
app.get('/api/users', async (req, res) => {
  try {
    // 2. Gunakan Prisma Client untuk mencari semua record di tabel User
    const users = await prisma.user.findMany();
    
    // 3. Kirim data pengguna kembali sebagai JSON
    res.json(users);
  } catch (error) {
    console.error("Gagal mengambil data pengguna:", error);
    res.status(500).json({ error: "Gagal memuat data dari database." });
  }
});
app.get('/api/users/:id', async (req, res) => {
  try {
    // Ambil ID dari parameter URL dan pastikan itu adalah integer
    const userId = parseInt(req.params.id);
    
    // Gunakan Prisma Client untuk mencari satu record unik
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    // Cek apakah user ditemukan
    if (!user) {
      return res.status(404).json({ error: 'Pengguna tidak ditemukan.' });
    }

    // Kirim User yang ditemukan
    res.json(user);
  } catch (error) {
    console.error("Gagal mengambil pengguna:", error);
    res.status(500).json({ error: "Gagal memuat data pengguna." });
  }
});
app.delete('/api/users/:id', async (req, res) => {
  try {
    // 1. Ambil ID dari parameter URL
    const userId = parseInt(req.params.id);
    
    // 2. Gunakan Prisma Client untuk menjalankan operasi DELETE
    await prisma.user.delete({
      where: {
        id: userId, // Tentukan baris mana yang akan dihapus
      },
    });

    // 3. Kirim status 204 No Content untuk operasi penghapusan yang sukses
    res.status(204).send(); 
  } catch (error) {
    // Penanganan kasus jika ID tidak ditemukan
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Pengguna tidak ditemukan.' });
    } else {
      console.error("Gagal menghapus pengguna:", error);
      res.status(500).json({ error: "Gagal menghapus data pengguna." });
    }
  }
});
app.post('/api/users', async (req, res) => {
  try {
    // Data yang dikirim oleh Frontend ada di req.body
    const userData = req.body; 

    // Gunakan Prisma Client untuk membuat record baru
    const newUser = await prisma.user.create({
      data: userData,
    });

    // Kirim kembali User yang baru dibuat dengan status 201 Created
    res.status(201).json(newUser);
  } catch (error) {
    // Pengecekan error unik (misalnya, email sudah ada)
    if (error.code === 'P2002') {
      res.status(409).json({ error: 'Email sudah terdaftar.' });
    } else {
      console.error("Gagal membuat pengguna:", error);
      res.status(500).json({ error: "Gagal menyimpan data pengguna." });
    }
  }
});
app.patch('/api/users/:id', async (req, res) => {
  try {
    // 1. Ambil ID dari parameter URL
    const userId = parseInt(req.params.id);
    
    // 2. Ambil data yang ingin diubah dari body permintaan
    const updateData = req.body;

    // 3. Gunakan Prisma Client untuk menjalankan operasi UPDATE
    const updatedUser = await prisma.user.update({
      where: {
        id: userId, // Tentukan baris mana yang akan diperbarui
      },
      data: updateData, // Tentukan data apa yang akan diperbarui
    });

    // 4. Kirim kembali User yang telah diperbarui
    res.json(updatedUser);
  } catch (error) {
    // Penanganan kasus jika ID tidak ditemukan atau data salah
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Pengguna tidak ditemukan.' });
    } else {
      console.error("Gagal memperbarui pengguna:", error);
      res.status(500).json({ error: "Gagal memperbarui data pengguna." });
    }
  }
});
// Mulai server
app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
});
