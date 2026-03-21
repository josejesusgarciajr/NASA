import { Routes, Route } from 'react-router-dom'
import { NavBar } from './components/NavBar'
import { Home } from './pages/Home'
import { APODExplorer } from './pages/APODExplorer'
import { APODGallery } from './pages/APODGallery'
import { NEOWS } from './pages/NEOWS'
import { Box } from '@mui/material'
import { Exoplanets } from './pages/Exoplanets'

import './App.css'

function App() {
  return (
    <>
      <Box sx={{ pt: { xs: '56px', sm: '64px' } }}>
        <NavBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/apod-explorer" element={<APODExplorer />} />
          <Route path="/apod-gallery" element={<APODGallery />} />
          <Route path="/neows" element={<NEOWS />} />
          <Route path="/exoplanets" element={<Exoplanets />} />
        </Routes>
      </Box>
    </>
  )
}

export default App