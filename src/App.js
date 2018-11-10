import React, { Component } from 'react';
import './App.css';
import SoundPlayer from './components/SoundPlayer/SoundPlayer.jsx';

class App extends Component {
  render() {
    return (
      <div className="App">
        
        <SoundPlayer></SoundPlayer>

      </div>
    );
  }
}

export default App;
