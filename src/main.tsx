import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// ui/ux
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

const theme = createTheme({
  palette: {
    mode: "dark", // 👈 if you want the darker Vite look
    primary: {
      main: "#1976d2",
    },
    background: {
      default: "#242424", // old Vite dark background
      paper: "#1e1e1e",   // surfaces like cards
    },
  },
  components: {
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "#1976d2",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#115293",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#1976d2",
            borderWidth: 2,
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        outlined: {
          borderColor: "#1976d2",
          "&:hover": {
            borderColor: "#115293",
          },
        },
      },
    },
  },
});

createRoot(document.getElementById('root')!).render(
  // <StrictMode>
  //   <App />
  // </StrictMode>,
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <App />
  </ThemeProvider>
)
