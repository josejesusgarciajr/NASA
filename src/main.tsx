import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'

// ui/ux
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#38bdf8",     // stellar cyan
      light: "#7dd3fc",
      dark: "#0369a1",     // deep cosmic blue
    },
    secondary: {
      main: "#a78bfa",     // nebula purple
      light: "#c4b5fd",
      dark: "#7c3aed",
    },
    background: {
      default: "#05091a",  // deep space void
      paper: "#0d1628",    // deep navy
    },
    text: {
      primary: "#e2e8f0",
      secondary: "#94a3b8",
    },
  },
  components: {
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "rgba(56,189,248,0.35)",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#38bdf8",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#38bdf8",
            borderWidth: 2,
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        outlined: {
          borderColor: "rgba(56,189,248,0.45)",
          "&:hover": {
            borderColor: "#38bdf8",
            boxShadow: "0 0 12px rgba(56,189,248,0.25)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          border: "1px solid rgba(56,189,248,0.12)",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
  },
});

createRoot(document.getElementById('root')!).render(
    <BrowserRouter>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <App />
      </LocalizationProvider>
    </ThemeProvider>
  </BrowserRouter>
)
