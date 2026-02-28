export type ThemeMode = 'light' | 'dark';

export interface ColorPalette {
    // Brand & Identity
    brand: {
        primary: string;
        secondary: string;
        tertiary: string;
    };

    // Semantic / Functional
    background: {
        default: string;
        paper: string;
        subtle: string;
        modal: string;
    };

    text: {
        primary: string;
        secondary: string;
        muted: string;
        inverse: string;
    };

    status: {
        info: string;
        success: string;
        warning: string;
        error: string; // Reserved for LIFE THREAT / EMERGENCY
        emergency: string; // Special pulsating red
    };

    border: {
        default: string;
        subtle: string;
        focus: string;
    };

    action: {
        active: string;
        hover: string;
        disabled: string;
        disabledBackground: string;
    };

    overlay: string;
}

export interface ThemeSpacing {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
}

export interface ThemeTypography {
    h1: { fontSize: number; fontWeight: '700'; lineHeight: number; letterSpacing: number };
    h2: { fontSize: number; fontWeight: '700'; lineHeight: number; letterSpacing: number };
    h3: { fontSize: number; fontWeight: '600'; lineHeight: number; letterSpacing: number };
    body: { fontSize: number; fontWeight: '400'; lineHeight: number };
    bodyLarge: { fontSize: number; fontWeight: '400'; lineHeight: number };
    caption: { fontSize: number; fontWeight: '400'; lineHeight: number };
    button: { fontSize: number; fontWeight: '600'; lineHeight: number; letterSpacing: number };
}

export interface Theme {
    mode: ThemeMode;
    colors: ColorPalette;
    spacing: ThemeSpacing;
    typography: ThemeTypography;
    isDark: boolean;
}

export interface ThemeContextType {
    theme: Theme;
    mode: ThemeMode;
    toggleTheme: () => void;
    setMode: (mode: ThemeMode) => void;
}
