import React from 'react';

export default function CodeComment({ children, multiline = false }) {
  if (multiline) {
    return (
      <div className="text-[#6a9955] font-mono text-sm mb-2">
        <div>/*</div>
        {children.split('\n').map((line, i) => (
          <div key={i} className="pl-1"> * {line}</div>
        ))}
        <div> */</div>
      </div>
    );
  }
  
  return (
    <div className="text-[#6a9955] font-mono text-sm">
      // {children}
    </div>
  );
}