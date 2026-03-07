import { NavLink } from 'react-router-dom'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch'

function NavButton({ to, end, children }: { to: string; end?: boolean; children: React.ReactNode }) {
  return (
    <NavLink to={to} end={end}>
      {({ isActive }: { isActive: boolean }) => (
        <Button
          sx={{
            color: 'white',
            borderRadius: 1,
            borderBottom: isActive ? '2px solid white' : '2px solid transparent',
            minWidth: 'unset',
            px: { xs: 1.5, sm: 2 },
            fontSize: { xs: '0.8rem', sm: '0.875rem' },
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
    <AppBar
      position="fixed"
      sx={{
        top: 0,
        left: 0,
        right: 0,
        width: '100%',
        zIndex: 1100,
        margin: 0,
      }}
    >
      <Toolbar sx={{ px: { xs: 1.5, sm: 3 } }} disableGutters>
        <RocketLaunchIcon sx={{ mr: 1, fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />
        <Typography
        variant="h6"
        sx={{
            flexGrow: 0,
            mr: 4,
            fontSize: { xs: '1rem', sm: '1.25rem' },
            whiteSpace: 'nowrap',
        }}
        >
        NASA Explorer
        </Typography>
        <Box sx={{ display: 'flex', gap: { xs: 0.5, sm: 1 } }}>
          <NavButton to="/" end>Home</NavButton>
          {/* <NavButton to="/apod-explorer">APOD Explorer</NavButton> */}
        </Box>
      </Toolbar>
    </AppBar>
  )
}