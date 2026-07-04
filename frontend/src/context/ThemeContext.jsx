import { createContext, useState, useContext, useEffect } from 'react';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [themeColor, setThemeColor] = useState(localStorage.getItem('themeColor') || 'indigo');
  const [themeMode, setThemeMode] = useState(localStorage.getItem('themeMode') || 'dark');

  useEffect(() => {
    // Xóa toàn bộ các class cũ liên quan đến theme
    const htmlElement = document.documentElement;
    htmlElement.classList.forEach((className) => {
      if (className.startsWith('theme-') || className.startsWith('mode-')) {
        htmlElement.classList.remove(className);
      }
    });

    // Thêm các class mới
    htmlElement.classList.add(`theme-${themeColor}`);
    htmlElement.classList.add(`mode-${themeMode}`);

    // Lưu vào LocalStorage
    localStorage.setItem('themeColor', themeColor);
    localStorage.setItem('themeMode', themeMode);
  }, [themeColor, themeMode]);

  return (
    <ThemeContext.Provider value={{ themeColor, setThemeColor, themeMode, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
