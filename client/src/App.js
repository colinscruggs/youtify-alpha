import React, { Component } from 'react';
import './css/App.css';
import SpotifyWebApi from 'spotify-web-api-js';
import {Sigma, RandomizeNodePositions, RelativeSize} from 'react-sigma';

// initialize global spotifyAPI ref
const spotifyApi = new SpotifyWebApi();

class App extends Component {
  token = '';

  constructor(){
    super();
    // fetch Spotify hash params/access token
    const params = this.getHashParams();
    const token = params.access_token;
    this.token = token;
    if (this.token) {
      spotifyApi.setAccessToken(token);
    }
    // INITIALIZE STATE HERE:
    this.state = {
      loggedIn: token ? true : false,
      userData: {},
      nowPlaying: { name: 'N/A', albumArt: '' },
      topArtists: {}
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
    this.getRecentlyListenedArtists();
  }

  getNowPlaying() {
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

  getUserProfile() {
    console.log('[ ] attempting to fetch user profile')
    spotifyApi.getMe()
      .then((response) => {
        this.setState({
          userData: response
        })
      });
    console.log('[x] user profile successfully fetched')
  }

  getRecentlyListenedArtists() {
    console.log('[ ] attempting to fetch recently listened artists')
    spotifyApi.getMyTopArtists()
      .then((response) => {
        this.setState({
          topArtists: response
        })
      });
    console.log('[x] recently listened artists fetched')
  }

  landingContent() {
    return (
      <div className="notLoggedIn">
        <h1>Youtify</h1>
        <p>This app requires authorization from your Spotify account. Log in below:</p>
        <a href='http://localhost:8888' > Login to Spotify </a> 
      </div> 
    );
  }

  loggedInContent() {
    let myGraph = {nodes:[{id:"n1", label:"Alice"}, {id:"n2", label:"Rabbit"}], edges:[{id:"e1",source:"n1",target:"n2",label:"SEES"}]};
    return (
      <div className="loggedIn" style={{width:"100%", height:"100%", display:"flex", flexDirection:"column", alignItems:"center", margin: 0, padding: 0}}> 
  
        <div className="header" style={{display:"flex", width: "100%", alignItems: "center", justifyContent: "space-around", background:"lightgreen", margin: 0, padding: "0.5rem", boxShadow: "lightgrey 0px 4px 30px -10px", zIndex: 99}}>
        <h1>Youtify</h1>
          <div classname="userProf" style={{display: "flex", alignItems: "center"}}>
            <h3 >Hello { this.state.userData.display_name }</h3>
            <img src={this.state.userData.images ? this.state.userData.images[0].url : ''} style={{ height: 40, width: 40, borderRadius: 100, marginLeft: "1rem" }}/>
          </div>
          <div className="nowPlaying" style={{display: "flex", alignItems: "center"}}>
            <p><strong>Now Playing: </strong> { this.state.nowPlaying.name }</p>
            <img src={this.state.nowPlaying.albumArt} style={{ height: 40, borderRadius: 0, marginLeft: "1rem" }}/>
          </div>
        </div>
        <div>
          
        </div>
        <Sigma graph={myGraph} settings={{drawEdges: true, clone: false}} style={{width:"100%", height:"100%", background:"azure", display:"flex"}}>
          <RelativeSize initialSize={1}/>
          <RandomizeNodePositions/>
        </Sigma>
      </div>
    );
  }


  render() {
    return (
      <div className="App">
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
