import React, { createContext, useContext, useState } from 'react';
import { useColorScheme } from 'react-native';
import { COLORS } from '../theme';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const scheme = useColorScheme();
  const [dark, setDark] = useState(scheme === 'dark');
  const toggle = () => setDark(d => !d);
  const colors = dark ? COLORS.dark : COLORS.light;

  return (
    <ThemeContext.Provider value={{ dark, toggle, colors, accent: COLORS.accent }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
