import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native/Libraries/Utilities/Appearance';
import { Theme, ThemeMode, ThemeContextType } from './types';
import { lightTheme } from './lightTheme';
import { darkTheme } from './darkTheme';

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
    children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
    const colorScheme = useColorScheme();
    const [mode, setMode] = useState<ThemeMode>(colorScheme === 'dark' ? 'dark' : 'light');

    // Update theme if system preference changes (optional, can be disabled if user explicitly sets theme)
    useEffect(() => {
        if (colorScheme) {
            setMode(colorScheme);
        }
    }, [colorScheme]);

    const toggleTheme = () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
    };

    const theme: Theme = mode === 'dark' ? darkTheme : lightTheme;

    return (
        <ThemeContext.Provider value={{ theme, mode, toggleTheme, setMode }}>
            {children}
        </ThemeContext.Provider>
    );
};
