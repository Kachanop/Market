// src/data/marketData.js

export const initialMarkets = [
  {
    id: 1,
    name: "ตลาดเสรีมาร์เก็ต (Seri Market)",
    floors: [
      {
        floorNumber: 1,
        // รูปตัวอย่าง (ในระบบจริง แอดมินจะอัปโหลดรูปใหม่เข้าไปแทนที่รูปนี้)
        image: "https://via.placeholder.com/1000x600/f0f0f0/cccccc?text=Upload+Market+Plan+Here", 
        locks: [
          // ตัวอย่างล็อกแบบ Polygon (สี่เหลี่ยม A01)
          { 
            id: "A01", 
            price: 500, 
            area: 4.5,
            status: "available",
            isPolygon: true,
            color: "#4ADE80",
            fontSize: 12,
            borderRadius: 2,
            // พิกัดจุดวาด (จำลอง)
            points: [
                {x: 20, y: 20},
                {x: 30, y: 20},
                {x: 30, y: 30},
                {x: 20, y: 30}
            ],
            x: 25, y: 25 // จุดกึ่งกลางสำหรับวางป้ายชื่อ
          },
          // ตัวอย่างล็อกแบบ Polygon (A02)
          { 
            id: "A02", 
            price: 600, 
            area: 5.0,
            status: "booked", // จองแล้ว
            isPolygon: true,
            color: "#F472B6", // สีชมพู
            fontSize: 12,
            borderRadius: 5,
            points: [
                {x: 32, y: 20},
                {x: 42, y: 20},
                {x: 42, y: 30},
                {x: 32, y: 30}
            ],
            x: 37, y: 25
          }
        ]
      },
      {
        floorNumber: 2,
        image: "https://via.placeholder.com/1000x600/e0e0e0/aaaaaa?text=Floor+2",
        locks: []
      }
    ]
  },
  {
    id: 2,
    name: "ตลาดนัดจตุจักร (Chatuchak)",
    floors: []
  }
];