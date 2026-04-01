// react
import { Routes, Route } from 'react-router-dom'

// material ui
import { Box } from '@mui/material'

// navbar & pages
import { NavBar } from './components/NavBar'
import { Home } from './pages/Home'
import { APODExplorer } from './pages/APODExplorer'
import { APODGallery } from './pages/APODGallery'
import { NEOWS } from './pages/NEOWS'
import { EONET } from './pages/EONET'
import { DOME } from './pages/DOME'

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
          <Route path="/eonet" element={<EONET />} />
          <Route path="/dome" element={<DOME />} />
        </Routes>
      </Box>
    </>
  )
}

export default App