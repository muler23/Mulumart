import React, { useEffect, useState } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { useAuth } from '../contexts/AuthContext';

const ChatDebugger = () => {
  const { socket } = useSocket();
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);

  const addLog = (message) => {
    setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), message }]);
  };

  useEffect(() => {
    if (socket) {
      addLog('Socket connected');
      
      socket.on('connect', () => addLog('Socket connected event'));
      socket.on('disconnect', () => addLog('Socket disconnected'));
      socket.on('newMessage', (message) => addLog(`Received message: ${JSON.stringify(message)}`));
      socket.on('messageSent', (message) => addLog(`Message sent: ${JSON.stringify(message)}`));
      
      return () => {
        addLog('Socket cleanup');
      };
    }
  }, [socket]);

  useEffect(() => {
    if (user) {
      addLog(`User logged in: ${user.name} (${user._id})`);
    }
  }, [user]);

  return (
    <div className="fixed bottom-4 left-4 w-80 h-64 bg-black text-green-400 p-2 rounded-lg shadow-lg z-50 overflow-hidden">
      <div className="text-xs font-bold mb-2">Chat Debugger</div>
      <div className="h-48 overflow-y-auto space-y-1">
        {logs.map((log, index) => (
          <div key={index} className="text-xs">
            <span className="text-gray-400">[{log.time}]</span> {log.message}
          </div>
        ))}
      </div>
      <button 
        onClick={() => setLogs([])}
        className="absolute top-2 right-2 text-xs bg-red-600 text-white px-2 py-1 rounded"
      >
        Clear
      </button>
    </div>
  );
};

export default ChatDebugger;
