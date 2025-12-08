import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx' // ✅ เรียกใช้ App ที่เป็นตัวจัดการ State หลัก

// จุดเริ่มต้นของแอปพลิเคชัน (Entry Point) ที่ใช้ React DO
createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* เรียกใช้ App Component ซึ่งเป็นตัวจัดการหลักของโปรแกรม */}
    <App />
  </StrictMode>,
)