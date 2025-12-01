import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx' // ✅ เรียกใช้ App ที่เป็นตัวจัดการ State หลัก

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)