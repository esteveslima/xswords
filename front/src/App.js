import React from 'react';
//import './App.css';
import Home from './components/Home/home'
import "antd/dist/antd.css";

function App() {
  console.warn = console.error = () => {};    //evitando mensagens de erro e avisos no console
  return (
    <div>
      <Home />
    </div>
  );
}

export default App;
