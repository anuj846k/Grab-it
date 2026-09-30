/**
 * Give. Grab. Repeat. — semantic color tokens (DESIGN.md).
 */
export const colors = {
  background: '#f9f9ff',
  surface: '#f9f9ff',
  surfaceDim: '#d3daef',
  surfaceBright: '#f9f9ff',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#f1f3ff',
  surfaceContainer: '#e9edff',
  surfaceContainerHigh: '#e1e8fd',
  surfaceContainerHighest: '#dce2f7',
  
  onSurface: '#141b2b',
  onSurfaceVariant: '#3c4a42',
  inverseSurface: '#293040',
  inverseOnSurface: '#edf0ff',
  
  outline: '#6c7a71',
  outlineVariant: '#bbcabf',
  
  surfaceTint: '#006c49',
  primary: '#006c49',
  onPrimary: '#ffffff',
  primaryContainer: '#10b981',
  onPrimaryContainer: '#00422b',
  inversePrimary: '#4edea3',
  
  secondary: '#5d5f5f',
  onSecondary: '#ffffff',
  secondaryContainer: '#dfe0e0',
  onSecondaryContainer: '#616363',
  
  tertiary: '#5c5f60',
  onTertiary: '#ffffff',
  tertiaryContainer: '#a1a3a4',
  onTertiaryContainer: '#37393b',
  
  error: '#ba1a1a',
  onError: '#ffffff',
  errorContainer: '#ffdad6',
  onErrorContainer: '#93000a',
  
  primaryFixed: '#6ffbbe',
  primaryFixedDim: '#4edea3',
  onPrimaryFixed: '#002113',
  onPrimaryFixedVariant: '#005236',
  
  secondaryFixed: '#e2e2e2',
  secondaryFixedDim: '#c6c6c7',
  onSecondaryFixed: '#1a1c1c',
  onSecondaryFixedVariant: '#454747',
  
  tertiaryFixed: '#e1e3e4',
  tertiaryFixedDim: '#c5c7c8',
  onTertiaryFixed: '#191c1d',
  onTertiaryFixedVariant: '#454748',
  
  onBackground: '#141b2b',
  surfaceVariant: '#dce2f7',
  
  /** Legacy / convenience — prefer onSurface */
  textPrimary: '#141b2b',
  textMuted: '#3c4a42',
  /** Links */
  link: '#006c49',
} as const;
