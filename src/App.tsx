import { Routes, Route } from 'react-router-dom'
import { NavBar } from './components/NavBar'
import { Home } from './pages/Home'
import { APODExplorer } from './pages/APODExplorer'
import './App.css'
import { Box } from '@mui/material'

function App() {
  return (
    <>
    <Box sx={{ pt: { xs: '56px', sm: '64px' } }}>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/apod-explorer" element={<APODExplorer />} />
      </Routes>
    </Box>
    </>
  )
}

export default App