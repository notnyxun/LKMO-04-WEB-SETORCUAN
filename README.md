# SETORCUAN 🌱♻️

Platform penukaran sampah daur ulang menjadi poin yang dapat ditukarkan dengan saldo e-wallet. Berkontribusi untuk lingkungan yang lebih bersih sambil mendapatkan reward!

## 📋 Deskripsi

SETORCUAN adalah aplikasi web yang memfasilitasi penukaran sampah daur ulang menjadi poin (koin) yang dapat dicairkan menjadi saldo e-wallet. Platform ini menghubungkan masyarakat yang ingin mendaur ulang sampah dengan sistem reward yang transparan dan mudah digunakan.

### Nilai Tukar
- **1 Koin = Rp 1**
- Sistem transparan dan real-time

## ✨ Fitur Utama

### 👤 Fitur Customer

#### 1. Pendaftaran & Profil
- Input nomor rekening/e-wallet
- Data lengkap: nama, alamat, dan nomor telepon aktif
- Manajemen profil pengguna

#### 2. Katalog & Harga Sampah
Jenis sampah yang diterima:
- **Plastik**: Rp 5.000/kg
- **Botol Kaca**: Rp 6.000/kg  
- **Kardus**: Rp 4.000/kg (kondisi apapun)

#### 3. Dashboard Riwayat & Saldo
- Monitoring saldo koin real-time
- Riwayat transaksi lengkap
- Status pencairan:
  - 🟡 Pending
  - 🔵 Processing
  - 🟢 Completed

#### 4. Permintaan Pencairan
- Pop-up otomatis untuk menghubungi admin via WhatsApp
- Template pesan WhatsApp otomatis
- Tracking status pencairan

### 🔧 Fitur Admin

#### 1. Audit Log
- Pencatatan semua aktivitas penting
- Tracking perubahan harga sampah
- Log koreksi saldo
- Riwayat perubahan status pencairan

#### 2. Manajemen Saldo Pengguna
- Monitoring saldo seluruh pengguna
- Koreksi saldo (dengan audit trail)
- Laporan transaksi

#### 3. Dashboard Permintaan Pencairan
- View semua request pencairan
- Filter berdasarkan status
- Data lengkap: User ID, jumlah koin, nominal rupiah, detail rekening

#### 4. Verifikasi Penyetoran
- **Pemberian Koin Otomatis**: 
  - Sistem menghitung: Berat Aktual × Harga Koin
  - Auto-credit ke saldo pengguna
- **Notifikasi Otomatis**: 
  - Pemberitahuan ke user via WhatsApp
  - Konfirmasi setoran tervalidasi

#### 5. Manajemen Pencairan
- **Tampilan Data**: User ID, Jumlah Koin, Nominal Rupiah, Detail Rekening
- **Status Tracking**: 
  - Pending → Processing → Completed
- **Upload Bukti Transfer**: 
  - Wajib sebelum status Completed
  - Audit trail untuk keamanan

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14.2.3
- **Language**: TypeScript
- **UI Components**: Radix UI
- **Styling**: Tailwind CSS 4.1.9
- **Forms**: React Hook Form + Zod validation
- **State Management**: Zustand
- **Charts**: Recharts
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js 5.1.0
- **Database**: PostgreSQL
- **ORM**: Prisma 6.19.0
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcrypt
- **File Upload**: Multer

### Additional Features
- **PWA Support**: next-pwa
- **Analytics**: Vercel Analytics
- **Theme**: Dark/Light mode (next-themes)
- **Notifications**: Sonner (toast notifications)

## 📁 Struktur Project

```
LKMO-04-WEB-SETORCUAN/
├── app/                    # Next.js App Directory
│   ├── components/         # React Components
│   ├── api/               # API Routes
│   └── ...
├── my-prisma-app/         # Backend API
│   ├── prisma/            # Database Schema
│   ├── server.js          # Express Server
│   └── package.json
├── public/                # Static Assets
├── package.json           # Frontend Dependencies
└── README.md
```

## 🚀 Instalasi

### Prerequisites
- Node.js (v18 atau lebih tinggi)
- PostgreSQL
- npm atau yarn

### 1. Clone Repository
```bash
git clone https://github.com/notnyxun/LKMO-04-WEB-SETORCUAN.git
cd LKMO-04-WEB-SETORCUAN
```

### 2. Install Dependencies Frontend
```bash
npm install
```

### 3. Install Dependencies Backend
```bash
cd my-prisma-app
npm install
```

### 4. Setup Database
```bash
# Di folder my-prisma-app
npx prisma migrate dev
npx prisma generate
```

### 5. Konfigurasi Environment Variables

**Root (.env.local)**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**my-prisma-app/.env**
```env
DATABASE_URL="postgresql://user:password@localhost:5432/setorcuan"
JWT_SECRET="your-secret-key"
PORT=3001
```

### 6. Jalankan Aplikasi

**Terminal 1 - Frontend**
```bash
npm run dev
```

**Terminal 2 - Backend**
```bash
cd my-prisma-app
npm start
```

Aplikasi akan berjalan di:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## 📱 Penggunaan

### Untuk Customer
1. Daftar akun dengan data lengkap dan nomor rekening/e-wallet
2. Login ke dashboard
3. Lihat katalog sampah dan harga per kg
4. Setor sampah ke admin (offline/koordinasi via WA)
5. Terima koin otomatis setelah verifikasi admin
6. Ajukan pencairan koin ke saldo e-wallet
7. Lacak status pencairan di dashboard

### Untuk Admin
1. Login ke dashboard admin
2. Verifikasi setoran sampah dari customer
3. Sistem auto-credit koin ke customer
4. Kelola permintaan pencairan:
   - Review data pencairan
   - Proses transfer manual
   - Upload bukti transfer
   - Update status ke Completed
5. Monitor audit log untuk transparansi

## 🔐 Keamanan

- JWT-based authentication
- Password hashing dengan bcrypt
- Audit log untuk semua aktivitas penting
- Wajib bukti transfer sebelum completing pencairan
- CORS protection pada API

## 📊 Database Schema (Prisma)

Database menggunakan PostgreSQL dengan Prisma ORM untuk manajemen schema dan migrasi.

## 🤝 Kontribusi

Project ini dibuat untuk LKMO-04. Kontribusi dan saran sangat diterima!

## 📄 Lisensi

Private Repository

## 👥 Tim Pengembang

Project LKMO-04 - SETORCUAN

## 📞 Kontak & Support

Untuk pertanyaan atau bantuan, silakan hubungi tim pengembang.

---

**SETORCUAN** - Setor Sampah, Cuan Mengalir! 🌍💚
