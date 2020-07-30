import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';

const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#3F51B5',
      dark: '#303F9F',
      light: '#C5CAE9',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#009688',
      dark: '#00796B',
      light: '#B2DFDB',
      contrastText: '#FFFFFF',
    },
    error: {
      main: '#dc004e',
      dark: '#D32F2F',
      light: '#FFCDD2',
      contrastText: '#FFFFFF',
    },
    info: {
      main: '#ebecf0',
      dark: '#b9babe',
      light: '#FFFFFF',
      contrastText: '#000000',
    },
    typography: {
      fontFamily: [
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        '"Noto Sans"',
        'Ubuntu',
        '"Droid Sans"',
        '"Helvetica Neue"',
        'sans-serif'
      ]
    }
  },
});

export default theme;