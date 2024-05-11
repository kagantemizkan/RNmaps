import { atom } from 'jotai';

export const themeAtom = atom('light'); // Start with 'light' theme

export const toggleThemeAtom = atom(
  null,
  (get, set, newValue: string) => {
    const currentTheme = get(themeAtom);
    const newTheme = newValue === 'toggle' ? (currentTheme === 'light' ? 'dark' : 'light') : newValue;
    set(themeAtom, newTheme);
  }
);

export const userLocationAtom = atom(null)
export const searchTextAtom = atom(null)
export const startPointAtom = atom(null)