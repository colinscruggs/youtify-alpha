import React, { Component } from 'react';
import './css/App.css';
import SpotifyWebApi from 'spotify-web-api-js';
import {Sigma, RandomizeNodePositions, RelativeSize} from 'react-sigma';

// initialize global spotifyAPI ref
const spotifyApi = new SpotifyWebApi();

const NUM_ARTISTS = 10;

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
      topArtists: {},
      artistGraph: {
        nodes:[], 
        edges:[]
      }
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
    this.getUserTopArtists();
  }

  getNowPlaying() {
    try {
      spotifyApi.getMyCurrentPlaybackState()
        .then((response) => {
          if(response)
            this.setState({
              nowPlaying: { 
                  name: response.item.name, 
                  albumArt: response.item.album.images[0].url
                }
            });
        })
    } catch (e) {
      alert(e);
    }
  }

  getUserProfile() {
    try {
      console.log('[ ] attempting to fetch user profile')
      spotifyApi.getMe()
        .then((response) => {
          this.setState({
            userData: response,
            artistGraph: {
              ...this.state.artistGraph,
              nodes: [{
                id: "n1",
                label: response['display_name']
              }]
            }
          })
        });
    } catch (e) {
      alert(e);
    }
    console.log('[x] user profile successfully fetched')
  }

  getUserTopArtists() {
    console.log('[ ] attempting to fetch recently listened artists')
    try {
    spotifyApi.getMyTopArtists({limit: NUM_ARTISTS})
      .then((response) => {
        const topArtists = response.items.map(artist => {
          return {
            artistInfo: artist,
            relatedArtists: {}
          }
        });

        // store user's top artists
        this.setState({
          topArtists: topArtists
        });

        // grab shallow copy of artistGraph to manipulate
        const artistGraphRef = {...this.state.artistGraph};

        // TODO: move to function
        if(artistGraphRef) {
          // loop over top artists, creating a node and set of edges for each connecting to the user's node
          let nodeNum = 2;
          this.state.topArtists.forEach(artist => {
            artistGraphRef.nodes.push(
              {
                id: 'n' + nodeNum,
                label: artist.artistInfo.name
              }
            );
            nodeNum++;
          })

          let edgeNum = 1;
          artistGraphRef.nodes.forEach(node => {
            if(node.id !== 'n1') {
              artistGraphRef.edges.push( {
                id: 'e' + edgeNum,
                source: 'n1',
                target: node.id,
                label: node.label
              })
              edgeNum++;
            }
          })

          this.setState({
            artistGraph: artistGraphRef
          });
        }
      });
    } catch (e) {
      alert(e)
    }
    console.log('[x] recently listened artists fetched')
  }

  generateArtistNode(artistInfo, config) {
    return {
      id: artistInfo.id,
      label: artistInfo.name
    }
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
    return (
      <div className="loggedIn" style={{width:"100%", height:"100%", display:"flex", flexDirection:"column", alignItems:"center", margin: 0, padding: 0}}> 
  
          <div className="header" style={{display:"flex", width: "100%", alignItems: "center", justifyContent: "space-around", background:"lightgreen", margin: 0, padding: "0.5rem", boxShadow: "lightgrey 0px 4px 30px -10px", zIndex: 99}}>
          <h1>Youtify</h1>
            <div className="userProf" style={{display: "flex", alignItems: "center"}}>
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
          { 
          this.state.artistGraph.edges.length >= NUM_ARTISTS ?
          <Sigma graph={this.state.artistGraph} settings={{drawEdges: true, clone: false}} style={{width:"100%", height:"100%", background:"azure", display:"flex"}}>
            <RelativeSize initialSize={5}/>
            <RandomizeNodePositions/>
          </Sigma>
          : null
          }
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
      </div>
    );
  }
}

export default App;
