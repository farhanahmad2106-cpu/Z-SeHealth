import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from './context/AuthContext'
import { UserStatsProvider } from './context/UserStatsContext'
import { UserProfileProvider } from './context/UserProfileContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <UserStatsProvider>
        <UserProfileProvider>
          <App />
        </UserProfileProvider>
      </UserStatsProvider>
    </AuthProvider>
  </StrictMode>,
)