import { createContext, useContext, useState, useEffect } from 'react';
import { updateProfile } from '../services/auth.service';

const ThemeContext = createContext(null);

const defaultThemes = {
  light: {
    '--bg-primary': '#f8fafc',
    '--bg-card': '#ffffff',
    '--bg-input': '#f1f5f9',
    '--text-primary': '#1e293b',
    '--text-secondary': '#64748b',
    '--border': '#e2e8f0',
    '--accent': '#22c55e',
  },
  dark: {
    '--bg-primary': '#0f172a',
    '--bg-card': '#1e293b',
    '--bg-input': '#334155',
    '--text-primary': '#f1f5f9',
    '--text-secondary': '#94a3b8',
    '--border': '#334155',
    '--accent': '#22c55e',
  }
};

export const ThemeProvider = ({ children }) => {
  const [dark, setDark] = useState(() => localStorage.getItem('theme_mode') === 'dark');
  const [customColors, setCustomColors] = useState(() => {
    const saved = localStorage.getItem('custom_theme_colors');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    const root = document.documentElement;
    const base = dark ? defaultThemes.dark : defaultThemes.light;
    root.classList.toggle('dark', dark);
    
    // Apply Base
    Object.entries(base).forEach(([k, v]) => root.style.setProperty(k, v));
    // Apply User Customizations
    Object.entries(customColors).forEach(([k, v]) => {
      if (v) root.style.setProperty(k, v);
    });

    localStorage.setItem('theme_mode', dark ? 'dark' : 'light');
    localStorage.setItem('custom_theme_colors', JSON.stringify(customColors));
  }, [dark, customColors]);

  const saveThemeToDB = async () => {
    const themeConfig = JSON.stringify({ dark, colors: customColors });
    try {
      await updateProfile({ theme_config: themeConfig });
    } catch (err) {
      console.error("Sync failed", err);
    }
  };

  return (
    <ThemeContext.Provider value={{ 
      dark, setDark, customColors, 
      updateCustomColor: (k, v) => setCustomColors(p => ({ ...p, [k]: v })),
      resetTheme: () => setCustomColors({}),
      saveThemeToDB
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);