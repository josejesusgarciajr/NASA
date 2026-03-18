import { NavLink } from 'react-router-dom'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import HomeIcon from '@mui/icons-material/Home';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch'

import { useLocation, useNavigate } from 'react-router-dom'

type NavButtonProps = {
  to: string;
  end?: boolean;
  children: React.ReactNode;
}

export const NavButton = ({ to, end, children }: NavButtonProps) => {
  return (
    <NavLink to={to} end={end}>
      {({ isActive }: { isActive: boolean }) => (
        <Button
          sx={{
            color: 'white',
            borderRadius: 1,
            borderBottom: isActive ? '2px solid white' : '2px solid transparent',
            minWidth: 'unset',
            px: { xs: 1.25, sm: 2 },
            fontSize: { xs: '0.6rem', sm: '0.875rem' },
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
          }}
        >
          {children}
        </Button>
      )}
    </NavLink>
  )
}

export const NavBar =() => {
  const location = useLocation();
  const navigate = useNavigate();

  function handleRocketLaunch() {
    if (location.pathname === '/apod-explorer') {
      navigate('/apod-explorer?random=true');
    }
  }

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
        <IconButton onClick={handleRocketLaunch}>
          <RocketLaunchIcon sx={{ mr: 1, fontSize: { xs: '0.75rem', sm: '1.5rem' } }} />
        </IconButton>
        <Typography
        variant="h6"
        sx={{
            flexGrow: 0,
            mr: { xs: 1, sm: 4 },
            fontSize: { xs: '0.60rem', sm: '1.25rem' },
            whiteSpace: 'nowrap',
        }}
        >
        NASA Explorer
        </Typography>
        <Box sx={{ display: 'flex', gap: { xs: 0.25, sm: 0.75 } }}>
          <NavButton to="/" end>
            <HomeIcon />
          </NavButton>
          <NavButton to="/apod-explorer">APOD X</NavButton>
          <NavButton to='/neows'>NEOWS</NavButton>
          <NavButton to="/exoplanets">Exoplanets</NavButton>
        </Box>
      </Toolbar>
    </AppBar>
  )
}