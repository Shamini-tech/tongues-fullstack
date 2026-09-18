// Import React core library
import React from 'react'
// Import Client DOM rendering engine introduced in React 18
import ReactDOM from 'react-dom/client'
// Import main parent component
import App from './App.jsx'
// Import global baseline stylesheet
import './index.css'

// Bind React component tree to the <div id="root"></div> inside index.html
ReactDOM.createRoot(document.getElementById('root')).render(
  // Wrap app in StrictMode to catch lifecycle warnings during development
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)