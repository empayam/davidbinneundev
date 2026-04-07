
import React from 'react';

export default function Layout({ children }) {
  return (
    <div>
      <style>{`
        /* VSCode-style scrollbar */
        ::-webkit-scrollbar {
          width: 14px;
          height: 14px;
        }
        
        ::-webkit-scrollbar-track {
          background: #1e1e1e;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #424242;
          border: 3px solid #1e1e1e;
          border-radius: 0;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #4f4f4f;
        }
        
        ::-webkit-scrollbar-corner {
          background: #1e1e1e;
        }
        
        /* Firefox scrollbar */
        * {
          scrollbar-width: thin;
          scrollbar-color: #424242 #1e1e1e;
        }
      `}</style>
      {children}
    </div>
  );
}
