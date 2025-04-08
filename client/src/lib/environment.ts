/**
 * Utility functions to detect the runtime environment
 */

// Check if the app is running in Electron
export const isElectron = (): boolean => {
  // Renderer process
  if (typeof window !== 'undefined' && typeof window.process === 'object' &&
    (window as any).process.type === 'renderer') {
    return true;
  }

  // Main process
  if (typeof process !== 'undefined' && typeof process.versions === 'object' &&
    !!process.versions.electron) {
    return true;
  }

  // Detect the user agent when the `nodeIntegration` option is set to false
  if (typeof navigator === 'object' && 
      typeof (navigator as any).userAgent === 'string' && 
      (navigator as any).userAgent.indexOf('Electron') >= 0) {
    return true;
  }

  return false;
};

// Check if the app is running in development mode
export const isDevelopment = (): boolean => {
  return process.env.NODE_ENV === 'development';
};

// Get the platform: 'win32', 'darwin', 'linux' in Electron, or 'web' in browser
export const getPlatform = (): string => {
  if (isElectron() && (window as any).electron) {
    return (window as any).electron.platform;
  }
  return 'web';
};

// Is the app running on macOS?
export const isMac = (): boolean => {
  return getPlatform() === 'darwin';
};

// Is the app running on Windows?
export const isWindows = (): boolean => {
  return getPlatform() === 'win32';
};

// Is the app running on Linux?
export const isLinux = (): boolean => {
  return getPlatform() === 'linux';
};

// Is the app running on the web?
export const isWeb = (): boolean => {
  return !isElectron();
};