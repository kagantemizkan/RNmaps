import { atom } from 'jotai';
import { Appearance } from 'react-native';

export const themeAtom = atom(Appearance.getColorScheme())

export const userLocationAtom = atom(null)

export const searchTextAtom = atom(null)

export const startPointAtom = atom(null)