import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from './context/AuthContext'
import { UserStatsProvider } from './context/UserStatsContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <UserStatsProvider>
        <App />
      </UserStatsProvider>
    </AuthProvider>
  </StrictMode>,
)