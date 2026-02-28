import { Theme, ThemeSpacing, ThemeTypography } from './types';
import { lightTheme } from './lightTheme'; // Import to reuse spacing/typography

// Re-using spacing and typography for consistency
const spacing: ThemeSpacing = lightTheme.spacing;
const typography: ThemeTypography = lightTheme.typography;

export const darkTheme: Theme = {
    mode: 'dark',
    isDark: true,
    colors: {
        brand: {
            primary: '#4C9AFF', // Lighter blue for better visibility on dark
            secondary: '#DAE7F5', // Soft blue-grey
            tertiary: '#79E2F2', // Bright cyan for accents
        },
        background: {
            default: '#121212', // Material Design standard dark (not pure black)
            paper: '#1E1E1E',   // Slightly lighter for cards
            subtle: '#2C2C2C',  // Grouping backgrounds
            modal: '#242424',
        },
        text: {
            primary: '#FFFFFF',   // Pure white for max contrast
            secondary: '#B0B8C4', // Muted grey for supporting text
            muted: '#8590A2',     // Low priority text
            inverse: '#172B4D',   // Dark text on light backgrounds
        },
        status: {
            info: '#4C9AFF',
            success: '#36B37E', // Brighter green for dark mode
            warning: '#FFC400', // Bright gold
            error: '#FF5630',   // Visible orange-red
            emergency: '#FF0000', // LIFE THREATENING - Pure Red (Kept consistent)
        },
        border: {
            default: '#3A3B3C',
            subtle: '#222222',
            focus: '#4C9AFF',
        },
        action: {
            active: '#4C9AFF',
            hover: '#2684FF',
            disabled: '#2C333A',
            disabledBackground: '#1C2127',
        },
        overlay: 'rgba(0, 0, 0, 0.7)',
    },
    spacing,
    typography,
};
