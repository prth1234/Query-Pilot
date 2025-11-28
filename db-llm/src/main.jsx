import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@primer/react-brand/lib/css/main.css'
import '@primer/react-brand/fonts/fonts.css'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)



// Primer Brand CSS and fonts (load early)



// createRoot(document.getElementById('root')).render(<App />)