import { createContext, useContext, useState, useEffect } from 'react';

/**
 * Theme Context
 * Uygulama genelinde tema yönetimi için context
 * localStorage'a kaydedilir ve sayfa yenilendiğinde korunur
 */
const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

/**
 * Theme Provider Component
 * Tema durumunu yönetir ve localStorage'a kaydeder
 */
export const ThemeProvider = ({ children }) => {
  // localStorage'dan tema tercihini yükle, yoksa 'light' varsayılan
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'light';
  });

  // Tema değiştiğinde document.body'ye class ekle/çıkar
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    
    // Önceki tema class'ını kaldır
    root.classList.remove('theme-light', 'theme-dark');
    body.classList.remove('theme-light', 'theme-dark');
    
    // Yeni tema class'ını ekle
    root.classList.add(`theme-${theme}`);
    body.classList.add(`theme-${theme}`);
    
    // Bootstrap dark mode için data-bs-theme attribute'unu ayarla
    root.setAttribute('data-bs-theme', theme);
    
    // localStorage'a kaydet
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const changeTheme = (newTheme) => {
    if (newTheme === 'light' || newTheme === 'dark') {
      setTheme(newTheme);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, changeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

