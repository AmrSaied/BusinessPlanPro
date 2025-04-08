import { useEffect, useState } from 'react';
import { isElectron, isWindows, isMac } from '@/lib/environment';
import { Minimize, Maximize, X, Minus, Square } from 'lucide-react';

const ElectronWindowControls = () => {
  const [isMaximized, setIsMaximized] = useState(false);
  
  // If not running in Electron, don't render anything
  if (!isElectron() || !(window as any).electron) {
    return null;
  }
  
  const minimize = () => {
    if ((window as any).electron) {
      (window as any).electron.send('toMain', { action: 'minimize' });
    }
  };
  
  const maximize = () => {
    if ((window as any).electron) {
      (window as any).electron.send('toMain', { action: 'maximize' });
      setIsMaximized(!isMaximized);
    }
  };
  
  const close = () => {
    if ((window as any).electron) {
      (window as any).electron.send('toMain', { action: 'close' });
    }
  };
  
  // Windows-style controls (right-aligned)
  if (isWindows()) {
    return (
      <div className="electron-window-controls flex items-center">
        <button
          onClick={minimize}
          className="p-2 hover:bg-gray-200 text-gray-600"
          aria-label="Minimize"
        >
          <Minus size={16} />
        </button>
        <button
          onClick={maximize}
          className="p-2 hover:bg-gray-200 text-gray-600"
          aria-label={isMaximized ? "Restore" : "Maximize"}
        >
          {isMaximized ? <Square size={14} /> : <Maximize size={14} />}
        </button>
        <button
          onClick={close}
          className="p-2 hover:bg-red-500 hover:text-white text-gray-600"
          aria-label="Close"
        >
          <X size={16} />
        </button>
      </div>
    );
  }
  
  // macOS-style controls (left-aligned)
  if (isMac()) {
    return (
      <div className="electron-window-controls flex items-center space-x-1">
        <button
          onClick={close}
          className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600"
          aria-label="Close"
        />
        <button
          onClick={minimize}
          className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600"
          aria-label="Minimize"
        />
        <button
          onClick={maximize}
          className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600"
          aria-label={isMaximized ? "Restore" : "Maximize"}
        />
      </div>
    );
  }
  
  // Linux or other platforms (similar to Windows but with different styling)
  return (
    <div className="electron-window-controls flex items-center">
      <button
        onClick={minimize}
        className="p-2 hover:bg-gray-700 text-gray-300"
        aria-label="Minimize"
      >
        <Minus size={16} />
      </button>
      <button
        onClick={maximize}
        className="p-2 hover:bg-gray-700 text-gray-300"
        aria-label={isMaximized ? "Restore" : "Maximize"}
      >
        {isMaximized ? <Square size={14} /> : <Maximize size={14} />}
      </button>
      <button
        onClick={close}
        className="p-2 hover:bg-red-500 hover:text-white text-gray-300"
        aria-label="Close"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default ElectronWindowControls;