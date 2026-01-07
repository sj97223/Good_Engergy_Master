import React from 'react';
import Chat from './components/Chat';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 font-sans">
      <Chat />
    </div>
  );
};

export default App;