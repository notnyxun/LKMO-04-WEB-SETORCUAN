// File: my-prisma-app/prisma/seed.js

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();
const saltRounds = 10;

async function main() {
  console.log("Memulai proses seeding...");

  // 1. Seed Recyclables
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
  } else {
    console.log("Recyclables sudah ada.");
  }

  // 2. Seed Locations
  const LOCATIONS = [
    { id: "lokasi1", name: "Bank Sampah SetorCuan - Pulau Damar", lat: -5.376526338272906, lng: 105.28818970242115, address: "Jl. Pulau Damar Gg. Nusa Satu No.23" },
    { id: "lokasi2", name: "Bank Sampah SetorCuan - Raden Saleh", lat: -5.3646679769006695, lng: 105.29603722423592, address: "Jl. Raden Saleh, Way Huwi" },
    { id: "lokasi3", name: "Bank Sampah SetorCuan - ITERA", lat: -5.3609809417718, lng: 105.32137968044056, address: "Jl. Terusan Ryacudu, Way Huwi" },
  ];
  const locationCount = await prisma.location.count();
  if (locationCount === 0) {
    console.log("Seeding Locations...");
    await prisma.location.createMany({
      data: LOCATIONS.map(l => ({ id: l.id, name: l.name, lat: l.lat, lng: l.lng, address: l.address })),
    });
  } else {
    console.log("Locations sudah ada.");
  }

  // 3. Seed Admin User
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

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log("Proses seeding selesai.");
  });
