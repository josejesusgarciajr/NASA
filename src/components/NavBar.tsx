import { NavLink } from 'react-router-dom'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch'

// Bridges NavLink's isActive with MUI Button styling
function NavButton({ to, end, children }: { to: string; end?: boolean; children: React.ReactNode }) {
  return (
    <NavLink to={to} end={end}>
      {({ isActive }: { isActive: boolean }) => (
        <Button
          sx={{
            color: 'white',
            borderRadius: 1,
            borderBottom: isActive ? '2px solid white' : '2px solid transparent',
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
          }}
        >
          {children}
        </Button>
      )}
    </NavLink>
  )
}

export function NavBar() {
  return (
    <AppBar position="sticky" sx={{ top: 0, zIndex: 1100 }}>
      <Toolbar>
        <RocketLaunchIcon sx={{ mr: 1 }} />
        <Typography variant="h6" sx={{ flexGrow: 0, mr: 4 }}>
          NASA Explorer
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <NavButton to="/" end>Home</NavButton>
          <NavButton to="/apod-explorer">APOD Explorer</NavButton>
        </Box>
      </Toolbar>
    </AppBar>
  )
}