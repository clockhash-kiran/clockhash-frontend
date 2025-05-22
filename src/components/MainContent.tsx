// components/MainContent.js
import React from 'react';

const MainContent = ({ children }) => (
  <div className="flex-1 p-6 overflow-auto">{children}</div>
);

export default MainContent;
