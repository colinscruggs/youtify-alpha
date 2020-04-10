import React, { Component } from 'react';
import './css/App.css';

import SpotifyWebApi from 'spotify-web-api-js';
const spotifyApi = new SpotifyWebApi();

class App extends Component {
  constructor(){
    super();
    // fetch Spotify hash params/access token
    const params = this.getHashParams();
    const token = params.access_token;
    if (token) {
      spotifyApi.setAccessToken(token);
    }
    // INITIALIZE STATE HERE:
    this.state = {
      loggedIn: token ? true : false,
      userData: {},
      nowPlaying: { name: 'Not Checked', albumArt: '' }
    }
  }

  getHashParams() {
    var hashParams = {};
    var e, r = /([^&;=]+)=?([^&;]*)/g,
        q = window.location.hash.substring(1);
    e = r.exec(q)
    while (e) {
        hashParams[e[1]] = decodeURIComponent(e[2]);
        e = r.exec(q);
    }
    return hashParams;
  }

  componentDidMount() {
    // fetch user profile when logged in
    if(this.state.loggedIn === true) {
      this.init();
    }
  }

  // fetch all requisite data from spotifyApi here on mount
  init() {
    this.getUserProfile();
    this.getNowPlaying();
  }

  getNowPlaying(){
    spotifyApi.getMyCurrentPlaybackState()
      .then((response) => {
        this.setState({
          nowPlaying: { 
              name: response.item.name, 
              albumArt: response.item.album.images[0].url
            }
        });
      })
  }

  getUserProfile(){
    console.log('[ ] attempting to fetch user profile')
    spotifyApi.getMe()
      .then((response) => {
        this.setState({
          userData: response
        })
      });
    console.log('[x] user profile successfully fetched')
  }

  landingContent() {
    return (
      <div className="notLoggedIn">
        <p>This app requires authorization from your Spotify account. Log in below:</p>
        <a href='http://localhost:8888' > Login to Spotify </a> 
      </div> 
    );
  }

  loggedInContent() {
    return (
      <div className="loggedIn">
        <h3>Hello { this.state.userData.display_name }</h3>
        <img src={this.state.userData.images ? this.state.userData.images[0].url : ''} style={{ height: 150 }}/>
        <div>
          Now Playing: { this.state.nowPlaying.name }
        </div>
        <div>
          <img src={this.state.nowPlaying.albumArt} style={{ height: 150 }}/>
        </div>
      </div>
    );
  }


  render() {
    return (
      <div className="App">
        <h1>Youtify</h1>
        { !this.state.loggedIn ?
            this.landingContent()
          : this.loggedInContent()
        }
        {/* 
        { this.state.loggedIn &&
          <button onClick={() => this.getNowPlaying()}>
            Check Now Playing
          </button>
        } */}
      </div>
    );
  }
}

export default App;
