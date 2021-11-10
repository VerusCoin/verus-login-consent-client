import { createTheme } from '@mui/material/styles';

export const mainTheme = createTheme({
  palette: {
    type: 'light',
    primary: {
      main: '#3165D4',
    },
    secondary: {
      main: '#D4313E',
    },
    success: {
      main: '#4AA658',
    },
  },
  typography: {
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
    //fontFamily: 'Source Sans Pro',
  },
  shape: {
    borderRadius: 14,
  },
});