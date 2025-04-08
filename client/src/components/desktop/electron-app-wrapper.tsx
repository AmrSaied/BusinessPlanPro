import { useEffect, ReactNode } from 'react';
import { isElectron } from '@/lib/environment';
import ElectronWindowControls from './electron-window-controls';

interface ElectronAppWrapperProps {
  children: ReactNode;
}

const ElectronAppWrapper = ({ children }: ElectronAppWrapperProps) => {
  useEffect(() => {
    // Set up communication with Electron main process
    if (isElectron() && (window as any).electron) {
      // Listen for messages from the main process
      (window as any).electron.receive('fromMain', (data: any) => {
        console.log('Received from main process:', data);
        
        // Handle different types of messages here
        if (data.type === 'app-ready') {
          console.log('Electron app is ready');
        }
      });
      
      // Let the main process know the renderer is ready
      (window as any).electron.send('toMain', { action: 'renderer-ready' });
    }
    
    return () => {
      // Clean up listeners if needed
    };
  }, []);
  
  if (!isElectron()) {
    // If not running in Electron, just render the children without modifications
    return <>{children}</>;
  }
  
  // Add any Electron-specific UI elements or modifications here
  return (
    <div className="electron-app">
      <div className="electron-title-bar flex items-center justify-between p-2 bg-primary text-white">
        <div className="flex items-center">
          <ElectronWindowControls />
          <div className="ml-4 font-medium drag-region">FastDummyTicket</div>
        </div>
        <div>
          {/* Any additional title bar controls */}
        </div>
      </div>
      <div className="electron-app-content">
        {children}
      </div>
    </div>
  );
};

export default ElectronAppWrapper;