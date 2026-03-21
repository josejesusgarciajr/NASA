import { NavLink } from 'react-router-dom'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Drawer from '@mui/material/Drawer'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Divider from '@mui/material/Divider'
import HomeIcon from '@mui/icons-material/Home'
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch'
import MenuIcon from '@mui/icons-material/Menu'

import { useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'

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

const navLinks = [
  { to: '/', label: 'Home', end: true },
  { to: '/apod-explorer', label: 'APOD Explorer' },
  { to: '/neows', label: 'NEOWS' },
  { to: '/exoplanets', label: 'Exoplanets' },
]

export const NavBar = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [drawerOpen, setDrawerOpen] = useState(false)

  function handleRocketLaunch() {
    if (location.pathname === '/apod-explorer') {
      navigate('/apod-explorer?random=true')
    }
  }

  function handleDrawerClose() {
    setDrawerOpen(false)
  }

  return (
    <>
      <AppBar
        position="fixed"
        sx={{ top: 0, left: 0, right: 0, width: '100%', zIndex: 1100, margin: 0 }}
      >
        <Toolbar sx={{ px: { xs: 1.5, sm: 3 } }} disableGutters>

            {/* Hamburger — visible on mobile only, far left */}
            <IconButton
                sx={{ display: { xs: 'flex', sm: 'none' }, color: 'white', mr: 1 }}
                onClick={() => setDrawerOpen(true)}
            >
                <MenuIcon />
            </IconButton>

            {/* Title */}
            <Typography
                variant="h6"
                sx={{
                    flexGrow: 0,
                    mr: { xs: 'auto', sm: 4 },
                    fontSize: { xs: '0.75rem', sm: '1.25rem' },
                    whiteSpace: 'nowrap',
                }}
            >
                NASA Explorer
            </Typography>

            {/* Desktop nav — hidden on mobile */}
            <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 0.75 }}>
                <NavButton to="/" end>
                    <HomeIcon sx={{ fontSize: '1.25rem', display: 'block' }} />
                </NavButton>
                {navLinks.slice(1).map(link => (
                    <NavButton key={link.to} to={link.to} end={link.end}>
                        {link.label}
                    </NavButton>
                ))}
            </Box>

            {/* Spacer — pushes rocket to far right on desktop */}
            <Box sx={{ flexGrow: 1 }} />

            {/* Rocket icon — far right */}
            <IconButton onClick={handleRocketLaunch} sx={{ ml: 0.5 }}>
                <RocketLaunchIcon sx={{ fontSize: { xs: '0.75rem', sm: '1.5rem' } }} />
            </IconButton>

        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={handleDrawerClose}
        PaperProps={{
          sx: { width: 220, backgroundColor: '#1a1a2e', color: 'white' }
        }}
      >
        <Box sx={{ pt: 2, pb: 1, px: 2 }}>
          <Typography variant="h6" sx={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)' }}>
            NASA Explorer
          </Typography>
        </Box>
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
        <List>
          {navLinks.map(link => (
            <ListItem key={link.to} disablePadding>
              <NavLink
                to={link.to}
                end={link.end}
                style={{ width: '100%', textDecoration: 'none' }}
                onClick={handleDrawerClose}
              >
                {({ isActive }) => (
                  <ListItemButton
                    sx={{
                      backgroundColor: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                      borderLeft: isActive ? '3px solid white' : '3px solid transparent',
                      '&:hover': { backgroundColor: 'rgba(255,255,255,0.08)' },
                    }}
                  >
                    <ListItemText
                      primary={link.label}
                      primaryTypographyProps={{
                        sx: { color: 'white', fontSize: '0.95rem' }
                      }}
                    />
                  </ListItemButton>
                )}
              </NavLink>
            </ListItem>
          ))}
        </List>
      </Drawer>
    </>
  )
}