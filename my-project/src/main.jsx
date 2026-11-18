import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { checkBrowserSession } from './utils/session'

// "Remember me" nahi tha aur browser dobara khula → pehle hi logout
checkBrowserSession()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
