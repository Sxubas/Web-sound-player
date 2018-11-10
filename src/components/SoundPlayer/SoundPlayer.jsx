import React, { Component } from 'react';
import './SoundPlayer.css';

class SoundPlayer extends Component {

  constructor(props) {
    super(props);
    this.state = {
      playing: false,
      track: {},
      currentTime: 0,
      timeUpdate: null,
      history: [],
      currentIndex: 0
    }

    //Hardcode hosted tracks URL (ideally replaced with an API call)
    this.tracks = [
      'https://d2tml28x3t0b85.cloudfront.net/tracks/stream_files/000/696/722/original/Bomba%20Est%C3%A9reo%20-%20To%20My%20Love%20%28Moombahton%20Bootleg%29.mp3?1514668785',
      'https://k003.kiwi6.com/hotlink/2rc3rz4rnp/1.mp3',
      'http://k003.kiwi6.com/hotlink/gt2rduy0mo/3.mp3',
      'http://k003.kiwi6.com/hotlink/421ezo6l38/4.mp3',
      'http://k003.kiwi6.com/hotlink/3j1d3r8a4t/5.mp3'
    ];

    this.token = "YOUR_FAKE_JSON_TOKEN";
  }

  componentDidMount() {
    //Skip song after finishing playing it
    this.audio.onended = () => {
      this.nextSong();
    }

    this.initializeTrack();
  }

  initializeTrack() {
    fetch('https://app.fakejson.com/q', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "token": this.token,
        "data": {
          "artist": { "name": "name" },
          "album": "stringWords|1,4",
          "track": "stringWords|1,3"
        }
      })
    })
      .then(response => response.json())
      .then(json => {
        this.updateTrack(json);
      })
      .catch(err => alert(err)) //Improve error handling
  }

  updateTrack(json_track) {

    const i = Math.floor(Math.random() * this.tracks.length);
    const track_url = this.tracks[i];

    //Build new track object
    const track = {
      ...json_track,
      track_url,
      image_url: `https://picsum.photos/300/300/?random&seed=${Math.random()}`
    }

    this.audio.src = track_url;
    this.audio.currentTime = 0;
    this.state.history.push(track)
    this.setState({ track, currentIndex: this.state.history.length - 1 });
  }

  nextSong() {
    const { currentIndex } = this.state;
    //Check history before fetching new song
    if (this.state.history[currentIndex + 1]) {

      const track = this.state.history[currentIndex + 1];

      this.audio.src = track.track_url;
      this.audio.currentTime = 0;

      this.setState({
        track,
        currentIndex: currentIndex + 1
      })
      this.play();
    }
    //If history is 'empty', fetch a new song
    else {
      const randomWords = 1 + Math.floor(Math.random() * 5);
      fetch('https://app.fakejson.com/q', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "token": this.token,
          "data": {
            "artist": { "name": "name" },
            "album": `stringWords|${randomWords},${randomWords + 1}`,
            "track": "stringWords|1,3"
          }
        })
      })
        .then(response => response.json())
        .then(json => {
          //Only change state when API request is successfull
          this.updateTrack(json);
          this.play();
        })
        .catch(err => alert(err)); //Improve error handling
    }
  }

  previousSong() {
    const { currentIndex } = this.state;
    if (this.state.history[currentIndex - 1]) {

      const track = this.state.history[currentIndex - 1];

      this.audio.src = track.track_url;
      this.audio.currentTime = 0;

      this.setState({
        track,
        currentIndex: currentIndex - 1
      });
      this.play();
    }
  }

  //Play current song and update UI
  play() {
    //If there's an error playing the current song, update UI to 'paused' state
    this.audio.play().catch(() => this.setState({ playing: false }));

    //Start timer 'UI updater'
    const timeUpdate = setInterval(() => this.setState({ currentTime: this.audio.currentTime }), 1000)

    this.setState({ playing: true, timeUpdate });
  }

  //Pauses current song and update UI
  pause() {
    this.audio.pause();
    //Stop timer 'UI updater'
    clearInterval(this.state.timeUpdate);
    this.setState({ playing: false, timeUpdate: null });
  }

  formatDuration(time) {
    let secs = Math.floor(time) % 60;
    const mins = Math.floor(time / 60);
    if (secs < 10) secs = '0' + secs;
    return `${mins}:${secs}`
  }

  playPause() {
    if (!this.state.playing) {
      this.play();
    }
    else {
      this.pause();
    }
  }

  render() {
    let progress = 0
    if (this.audio)
      progress = this.audio.currentTime / this.audio.duration * 100;
    return (
      <div className='player-container'>
        <div className={this.state.playing ? 'info-container visible' : 'info-container hidden'}>
          <div className='info-text'>
            <b>{this.state.track.track}</b>
            <p className='album'>{this.state.track.album}</p>
            <p>{this.state.track.artist && this.state.track.artist.name}</p>
          </div>
          <div className='progress-timers'>
            <div className='progress-time'>
              {this.formatDuration(this.state.currentTime)}
            </div>
            <div className='progress-time'>
              {this.audio && this.formatDuration(this.audio.duration)}
            </div>
          </div>
          <div className='progress-bar-container'>
            <div
              className='progress-bar'
              style={{ width: `${progress}%` }}
            >
            </div>
          </div>
        </div>
        <div className="panel-container">
          <audio ref={ref => this.audio = ref}></audio>
          <div className='album-art'>
            <img src={this.state.track.image_url} alt="album" className={ this.state.playing ? 'playing' : ''}/>
          </div>
          <div className='controls-container'>
            <i className='material-icons' onClick={() => this.previousSong()}>skip_previous</i>
            <i className='material-icons' onClick={() => this.playPause()} >{this.state.playing ? 'pause' : 'play_arrow'}</i>
            <i className='material-icons' onClick={() => this.nextSong()}>skip_next</i>
          </div>
        </div>
      </div>
    );
  }
}

export default SoundPlayer;
