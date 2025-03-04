import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router'
import { UpProvider } from './contexts/UpProvider.jsx'
import './index.scss'
import './styles/global.scss'


import Home from './routes/Home.jsx'
import Admin from './routes/Admin.jsx'

const root = document.getElementById('root')

createRoot(root).render(
  <BrowserRouter>
    <Routes>
      <Route index element={<UpProvider><Home /></UpProvider>} />
      <Route path="admin" element={<Admin />} />
    </Routes>
  </BrowserRouter>
)
