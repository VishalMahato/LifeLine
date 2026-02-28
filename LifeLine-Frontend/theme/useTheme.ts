import { useContext } from 'react';
import { ThemeContext } from './ThemeContext';
import { ThemeContextType } from './types';

export const useTheme = (): ThemeContextType['theme'] & { toggleTheme: () => void; mode: ThemeContextType['mode'] } => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return { ...context.theme, toggleTheme: context.toggleTheme, mode: context.mode };
};
