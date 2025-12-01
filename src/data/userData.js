// src/data/userData.js

// 1. ข้อมูลผู้ใช้ (Users)
export const initialUsers = [
  { 
    id: 1, 
    email: "user@mail.com", 
    password: "123", 
    role: "customer",
    name: "คุณลูกค้า ตัวอย่าง"
  },
  { 
    id: 99, 
    email: "admin@admin.com", 
    password: "123", 
    role: "admin",
    name: "Admin Master"
  }
];

// 2. ข้อมูลการจอง (Bookings)
export const initialBookings = [
  {
    id: 101,
    userId: 1,        // เชื่อมกับ user@mail.com
    marketId: 1,      // เชื่อมกับตลาด ID 1
    floorNumber: 1,
    lockId: "A01",
    dates: "2023-12-01 ถึง 2023-12-02",
    time: "08:00 - 18:00",
    price: 500,
    status: "paid",   // paid = รอตรวจสอบ, approved = อนุมัติ
    slipImage: "https://via.placeholder.com/150?text=Slip+Preview"
  }
];