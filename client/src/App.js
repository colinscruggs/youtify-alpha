import React, { Component } from 'react';
import './css/App.css';
import SpotifyWebApi from 'spotify-web-api-js';
import {Sigma, RandomizeNodePositions, RelativeSize} from 'react-sigma';
import './css/UI.css';

// initialize global spotifyAPI ref
const spotifyApi = new SpotifyWebApi();
let NUM_ARTISTS = 10;
const REFRESH_INTERVAL = 10;

class App extends Component {
  token = '';

  componentDidMount() {
    // fetch user profile when logged in
    if(this.state.loggedIn === true) {
      this.init();
    }
  }

  init() {
      // fetch all requisite data from spotifyApi here on mount
    this.getUserProfile();
    this.getUserTopArtists();
    // set interval to fetch now playing every ~10 seconds
    this.getNowPlaying();
    setInterval(() => this.getNowPlaying(), REFRESH_INTERVAL * 1000)
  }

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
      topArtists: [],
      artistGraph: {
        nodes:[], 
        edges:[]
      },
      renderGraph: false
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

  getNowPlaying() {
    try {
      console.log('getting now playing')
      spotifyApi.getMyCurrentPlaybackState()
        .then((response) => {
          if(response) {
            this.setState({
              nowPlaying: { 
                  name: response.item.name, 
                  artists: response.item.artists.reduce(function(acc, artist, i, artists) {
                    return acc + (i < artists.length - 1 ? artist.name + ', ' : artist.name);
                  }, ''),
                  albumArt: response.item.album.images[0].url
                }
            });
          }
        })
    } catch (e) {
      console.warn(e);
    }
  }

  getUserProfile() {
    try {
      console.log('[ ] attempting to fetch user profile')
      spotifyApi.getMe()
        .then((response) => {
          this.setState({
            userData: response,
            // add central USER node (n1) to connect top artists to
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
    } finally {
      console.log('[x] user profile successfully fetched')
    }
  }

  getUserTopArtists() {
    console.log('[ ] attempting to fetch top listened artists')
    try {
      spotifyApi.getMyTopArtists({limit: NUM_ARTISTS})
      .then((response) => {
        const topArtists = response.items.map(artist => {
          return {
            artistInfo: artist,
            relatedArtists: []
          }
        });

        // store user's top artists
        this.setState({
          topArtists: topArtists
        });

        console.log(topArtists);

        // grab shallow copy of artistGraph to manipulate
        const artistGraphRef = {...this.state.artistGraph};

        if(artistGraphRef) {
          // loop over top artists, creating a node and set of edges for each connecting to the user's node
          let nodeNum = 2;
          this.state.topArtists.forEach(artist => {
            artistGraphRef.nodes.push(
              this.generateArtistNode(
                'n' + nodeNum,
                artist.artistInfo.name
              )
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
    } finally {
      console.log('[x] recently listened artists fetched');
      this.setState({
        ...this.state,
        renderGraph: true
      })
    }
  }

  generateArtistNode(id, label, config) {
    return {
      id: id,
      label: label,
      ...config
    }
  }

  findArtistNode(artistName) {
    return this.state.artistGraph.nodes.find(node => {
      return node.label === artistName;
    });
  }

  getArtistRelatedArtists(artistId) {
    return spotifyApi.getArtistRelatedArtists(artistId);
  }

  async handleArtistNodeClick(artistName) {
    const artist = this.state.topArtists.find(
      artist => artist.artistInfo.name === artistName
    );

    console.log("Selected " + artist);

    const artistIndex = this.state.topArtists.findIndex(
      artist => artist.artistInfo.name === artistName
    )

    try {
      let relatedArtistsResponse = (await spotifyApi.getArtistRelatedArtists(artist.artistInfo.id)).artists;
      console.log(relatedArtistsResponse);

      this.setState({
        ...this.state,
        renderGraph: false
      })

      let newArtistObject = {
        ...artist,
        relatedArtists:
          relatedArtistsResponse.map(a => {
            return {
              artistInfo: a,
              relatedArtists: [],
              isRelated: 1 // LEVEL OF RELATED-NESS
            }
          })
      };

      // replace topArtists array with copied/spliced version containing clicked artist & related
      let topArtistsCopy = [...this.state.topArtists];
      topArtistsCopy.splice(artistIndex, 1, newArtistObject)
      this.setState({
        ...this.state,
        topArtistsCopy
      });

      // grab shallow copy of artistGraph to manipulate
      const artistGraphRef = {...this.state.artistGraph};

      if (artistGraphRef) {
        // loop over top artists, creating a node and set of edges for each connecting to the user's node
        let artistId = newArtistObject.artistInfo.id;
        let nodeNum = 1;

        let relatedArtistNodes = []; // TODO: push to artistGraphRef
        // iterate over selected artist, adding nodes for each related artist to artist graph reference
        relatedArtistsResponse.forEach(artist => {
          relatedArtistNodes.push(
            this.generateArtistNode(
              'n' + artistId + nodeNum,
              artist.name
            )
          );
          nodeNum++;
        });

        console.log(relatedArtistNodes);

        let edgeNum = 1;
        let relatedArtistEdges = [];
        let selectedArtistNodeId = this.findArtistNode(this.state.topArtists[artistIndex].artistInfo.name).id;
        console.log(selectedArtistNodeId);
        // iterate across generated nodes, creating edges from selected artist to each related artist node
        relatedArtistNodes.forEach(node => {
          relatedArtistEdges.push({
            id: 'e' + artistId + edgeNum,
            source: selectedArtistNodeId,
            target: node.id,
            label: node.label
          })
          edgeNum++;
        });

        console.log(relatedArtistEdges);

        // concat relatedArtistNodes and relatedArtistEdges to artistGraphRef
        artistGraphRef.nodes = artistGraphRef.nodes.concat(relatedArtistNodes);
        artistGraphRef.edges = artistGraphRef.edges.concat(relatedArtistEdges);

        console.log(artistGraphRef);

        this.setState({
          artistGraph: artistGraphRef
        });
      }
    } catch (e) {
      alert(e);
    } finally {
      this.setState({
        ...this.state,
        renderGraph: true
      })
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
      <div className="loggedIn"> 
          <div className="header">
          <h1 className="title">Youtify</h1>
            <div className="userProf">
              <h3 className="text">Hello, { this.state.userData.display_name }</h3>
              <img className="profPic" src={this.state.userData.images ? this.state.userData.images[0].url : ''} />
            </div>
            <div className="nowPlaying">
    <p className="text"><strong>Now Playing: </strong> { this.state.nowPlaying.name } - { this.state.nowPlaying.artists }</p>
              <img src={this.state.nowPlaying.albumArt} className="profPic" />
            </div>
          </div>
          <div>
            
          </div>
          { 
            this.state.artistGraph.edges.length >= NUM_ARTISTS ?
            this.sigmaGraph()
          : null
          }
        </div>
    );
  }

  // sigmaGraph() {
  //   return (
  //     <Sigma 
  //           classname="graph"
  //           style={{width:"100%", height:"100%", background:"azure", display:"flex"}}
  //           graph={this.state.artistGraph} 
  //           settings={{drawEdges: true, clone: false}} 
  //           onClickNode={e => this.handleArtistNodeClick(e.data.node.label)}
  //         >
  //             <RelativeSize initialSize={10}/>
  //             <RandomizeNodePositions/>
  //         </Sigma>
  //   )
  // }


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
