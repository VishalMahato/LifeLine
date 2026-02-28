import { Theme, ThemeSpacing, ThemeTypography } from './types';

const spacing: ThemeSpacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

const typography: ThemeTypography = {
    h1: { fontSize: 32, fontWeight: '700', lineHeight: 40, letterSpacing: -0.5 },
    h2: { fontSize: 24, fontWeight: '700', lineHeight: 32, letterSpacing: -0.25 },
    h3: { fontSize: 20, fontWeight: '600', lineHeight: 28, letterSpacing: 0 },
    body: { fontSize: 16, fontWeight: '400', lineHeight: 24 },
    bodyLarge: { fontSize: 18, fontWeight: '400', lineHeight: 28 },
    caption: { fontSize: 14, fontWeight: '400', lineHeight: 20 },
    button: { fontSize: 16, fontWeight: '600', lineHeight: 24, letterSpacing: 0.5 },
};

export const lightTheme: Theme = {
    mode: 'light',
    isDark: false,
    colors: {
        brand: {
            primary: '#0052CC', // Trustworthy medical blue, high visibility
            secondary: '#42526E', // Neutral slate for secondary actions
            tertiary: '#00B8D9', // Calm supportive cyan
        },
        background: {
            default: '#F4F5F7', // Not pure white, reduces eye strain in sunlight
            paper: '#FFFFFF',   // Surface color for cards
            subtle: '#EBECF0',  // Grouping backgrounds
            modal: '#FFFFFF',
        },
        text: {
            primary: '#172B4D',   // Very high contrast dark blue/black (accessible on white)
            secondary: '#42526E', // Readable grey for supportive text
            muted: '#6B778C',     // Least important info
            inverse: '#FFFFFF',   // Text on dark backgrounds
        },
        status: {
            info: '#0065FF',
            success: '#00875A', // Distinct from primary green
            warning: '#FFAB00', // High visibility warning
            error: '#DE350B',   // Standard error red
            emergency: '#FF0000', // LIFE THREATENING - Pure Red
        },
        border: {
            default: '#DFE1E6',
            subtle: '#EBECF0',
            focus: '#4C9AFF',
        },
        action: {
            active: '#0052CC',
            hover: '#0065FF',
            disabled: '#A5ADBA',
            disabledBackground: '#F4F5F7',
        },
        overlay: 'rgba(9, 30, 66, 0.54)',
    },
    spacing,
    typography,
};
