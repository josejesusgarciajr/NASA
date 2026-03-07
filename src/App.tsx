import { Routes, Route } from 'react-router-dom'
//import { NavBar } from './components/NavBar'
import { Home } from './pages/Home'
//import { APODExplorer } from './pages/APODExplorer'
import './App.css'

function App() {
  return (
    <>
      {/* <NavBar /> */}
      <Routes>
        <Route path="/" element={<Home />} />
        {/* <Route path="/apod-explorer" element={<APODExplorer />} /> */}
      </Routes>
    </>
  )
}

export default App