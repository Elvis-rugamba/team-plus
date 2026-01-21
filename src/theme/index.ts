import { createTheme, type Theme } from '@mui/material/styles';
import { designTokens } from './tokens';

/**
 * Creates Material-UI theme based on design tokens and dark mode setting
 */
export const createAppTheme = (darkMode: boolean): Theme => {
  return createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: designTokens.colors.primary,
      secondary: designTokens.colors.secondary,
      error: designTokens.colors.error,
      warning: designTokens.colors.warning,
      info: designTokens.colors.info,
      success: designTokens.colors.success,
      ...(darkMode
        ? {
            background: {
              default: '#121212',
              paper: '#1e1e1e',
            },
          }
        : {
            background: {
              default: '#fafafa',
              paper: '#ffffff',
            },
          }),
    },
    typography: {
      fontFamily: designTokens.typography.fontFamily,
      fontSize: designTokens.typography.fontSizeBase,
      fontWeightLight: designTokens.typography.fontWeights.light,
      fontWeightRegular: designTokens.typography.fontWeights.regular,
      fontWeightMedium: designTokens.typography.fontWeights.medium,
      fontWeightBold: designTokens.typography.fontWeights.bold,
      h1: {
        fontSize: '2.5rem',
        fontWeight: designTokens.typography.fontWeights.bold,
        lineHeight: designTokens.typography.lineHeights.tight,
      },
      h2: {
        fontSize: '2rem',
        fontWeight: designTokens.typography.fontWeights.semiBold,
        lineHeight: designTokens.typography.lineHeights.tight,
      },
      h3: {
        fontSize: '1.75rem',
        fontWeight: designTokens.typography.fontWeights.semiBold,
        lineHeight: designTokens.typography.lineHeights.normal,
      },
      h4: {
        fontSize: '1.5rem',
        fontWeight: designTokens.typography.fontWeights.medium,
        lineHeight: designTokens.typography.lineHeights.normal,
      },
      h5: {
        fontSize: '1.25rem',
        fontWeight: designTokens.typography.fontWeights.medium,
        lineHeight: designTokens.typography.lineHeights.normal,
      },
      h6: {
        fontSize: '1rem',
        fontWeight: designTokens.typography.fontWeights.medium,
        lineHeight: designTokens.typography.lineHeights.normal,
      },
      body1: {
        fontSize: '1rem',
        lineHeight: designTokens.typography.lineHeights.normal,
      },
      body2: {
        fontSize: '0.875rem',
        lineHeight: designTokens.typography.lineHeights.normal,
      },
    },
    spacing: designTokens.spacing.unit,
    shape: {
      borderRadius: designTokens.borders.radius.md,
    },
    transitions: {
      duration: {
        shortest: designTokens.transitions.duration.shortest,
        shorter: designTokens.transitions.duration.shorter,
        short: designTokens.transitions.duration.short,
        standard: designTokens.transitions.duration.standard,
        complex: designTokens.transitions.duration.complex,
      },
      easing: {
        easeInOut: designTokens.transitions.easing.easeInOut,
        easeOut: designTokens.transitions.easing.easeOut,
        easeIn: designTokens.transitions.easing.easeIn,
        sharp: designTokens.transitions.easing.sharp,
      },
    },
    breakpoints: {
      values: designTokens.breakpoints,
    },
    zIndex: designTokens.zIndex,
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: designTokens.typography.fontWeights.medium,
            borderRadius: designTokens.borders.radius.md,
          },
        },
        defaultProps: {
          disableElevation: false,
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: designTokens.borders.radius.lg,
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: designTokens.borders.radius.md,
          },
        },
      },
      MuiTextField: {
        defaultProps: {
          variant: 'outlined',
        },
      },
      MuiPaper: {
        styleOverrides: {
          rounded: {
            borderRadius: designTokens.borders.radius.lg,
          },
        },
      },
    },
  });
};

export { designTokens };
