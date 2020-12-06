import React, { Component } from 'react';
import { Spin, Row, Col } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import SpotifyWebApi from 'spotify-web-api-js';

import './css/App.css';
import './css/UI.css';

import { State } from './models/State';
import MostListened from './components/MostListened';
import { TimeRange } from './models/TimeRange';
import Genres from './components/Genres';

// initialize global spotifyAPI ref
const spotifyApi = new SpotifyWebApi();
let NUM_ARTISTS = 10;
const REFRESH_INTERVAL = 10;
const loadingIcon = <LoadingOutlined style={{ fontSize: 24 }} />;

class App extends Component<any, State> {
  // auth token
  token = '';

  componentDidMount() {
    // fetch user profile when logged in
    if(this.state.loggedIn === true) {
      this.init();
    }
  }

  componentDidUpdate(prevProps: any, prevState: State) {
    // watch updates on artistRange and trackRange; fetch respective lists
    if(this.state.artistRange !== prevState.artistRange) {
      this.getUserTopArtists();
    }
    if(this.state.trackRange !== prevState.trackRange) {
      this.getUserTopTracks();
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

  constructor(props: any) {
    super(props);
    // fetch Spotify hash params/access token
    const params: any = this.getHashParams();
    const token = params.access_token;
    this.token = token;
    if (this.token) {
      spotifyApi.setAccessToken(token);
    }
    // INITIALIZE STATE HERE:
    this.state = {
      loggedIn: token ? true : false,
      userData: {} as SpotifyApi.CurrentUsersProfileResponse,
      nowPlaying: { name: '', albumArt: '', artists: '' },
      topArtists: [] as SpotifyApi.ArtistObjectFull[],
      topTracks: [] as SpotifyApi.TrackObjectFull[],
      artistRange: TimeRange.mediumTerm,
      trackRange: TimeRange.mediumTerm,
      topArtistsPage: 0,
      topTracksPage: 0,
      genreList: [],
      currentTopView: 'artists'
    }
  }

  handler = (key: any, val: any) => {
    let update: any = {};
    update[key] = val;
    this.setState(update);
  }

  getHashParams = () => {
    var hashParams: any = {};
    var e, r = /([^&;=]+)=?([^&;]*)/g,
        q = window.location.hash.substring(1);
    e = r.exec(q)
    while (e) {
        hashParams[e[1]] = decodeURIComponent(e[2]);
        e = r.exec(q);
    }
    return hashParams;
  }

  getNowPlaying = () => {
    try {
      console.log('getting now playing')
      spotifyApi.getMyCurrentPlaybackState()
        .then((response) => {
          if(response && response.item) {
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

  getUserProfile = () => {
    try {
      console.log('[ ] attempting to fetch user profile')
      spotifyApi.getMe()
        .then((response) => {
          this.setState({
            userData: response
          })
        });
    } catch (e) {
      alert(e);
    } finally {
      console.log('[x] user profile successfully fetched');
    }
  }

  getUserTopArtists = () => {
    console.log('[ ] attempting to fetch top listened artists')
    try {
      let page = this.state.topArtistsPage;
      let range = this.state.artistRange;
      spotifyApi.getMyTopArtists({ limit: NUM_ARTISTS * 5, offset: page, time_range: range})
      .then((response) => {
        // store user's top artists
        this.setState({
          topArtists: response.items
        });

        console.log(response.items);

        this.getGenresFromArtists(response.items);
      });
    }
    catch (e) {
      alert(e)
    } finally {
      console.log('[x] recently listened artists fetched');
    }
  }

  getUserTopTracks = () => {
    console.log('[ ] attempting to fetch top listened tracks')
    try {
      let page = this.state.topTracksPage;
      let range = this.state.trackRange;
      spotifyApi.getMyTopTracks({ limit: NUM_ARTISTS, offset: page, time_range: range})
      .then((response) => {
        // store user's top artists
        this.setState({
          topTracks: response.items
        });

        console.log(response.items);
      });
    }
    catch (e) {
      alert(e)
    } finally {
      console.log('[x] recently listened tracks fetched');
    }
  }

  getArtistRelatedArtists = (artistId: string) => {
    return spotifyApi.getArtistRelatedArtists(artistId);
  }

  getGenresFromArtists = (artists: SpotifyApi.ArtistObjectFull[]) => {
    const artistGenres = new Map;
    artists.forEach(artist => {
      artist.genres.forEach(genre => {
        let genreFormatted = genre.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.substring(1)).join(' ');
        if (artistGenres.get(genreFormatted) === undefined) {
          artistGenres.set(genreFormatted, 1);
        } else {
          artistGenres.set(genreFormatted, artistGenres.get(genreFormatted) + 1);
        }
      })
    });
    console.log(artistGenres);
    console.log(artistGenres.entries());
    this.setState({...this.state, 
      genreList: artistGenres
    });
  }

  landingContent = () => {
    return (
      <div className="notLoggedIn"> 
        <h1>Youtify</h1>
        <p>This app requires authorization from your Spotify account. Log in below:</p>
        <a href='http://localhost:8888/login' > Login to Spotify </a> 
      </div> 
    );
  }

  loggedInContent = () => {
    return (
      <div className="loggedIn"> 
          <div className="header">
          <div className="title">
            <h1>Youtify</h1>
            <Spin indicator={loadingIcon} spinning={false} />
          </div>
            <div className="userProf">
              <h3 className="text">Hello, { this.state.userData.display_name }</h3>
              <img className="profPic" src={this.state.userData.images ? this.state.userData.images[0].url : ''} />
            </div>
            <div className="nowPlaying">
              <h3 className="text">
                <strong>Now Playing: </strong>
                { this.state.nowPlaying.name !== '' ? 
                  this.state.nowPlaying.name + ' - ' + this.state.nowPlaying.artists
                  : 'N/A'
                }
              </h3>
              { this.state.nowPlaying.name !== '' ? 
                <img src={this.state.nowPlaying.albumArt} className="profPic" />
                : null
              }
            </div>
          </div>

        {/* DASHBORD */}
        <div style={{'width': '100%', 'overflowY' : 'scroll'}}>
          <Row gutter={[{xs: 8, sm: 16, md: 24, lg: 32 }, {xs: 8, sm: 16, md: 24, lg: 32 }]}>
              <Col span={12} className="gutter-row">
                <MostListened 
                  topArtists={this.state.topArtists}
                  topTracks={this.state.topTracks}
                  handler={this.handler}
                  getUserTopArtists={this.getUserTopArtists}
                  getUserTopTracks={this.getUserTopTracks}
                />
              </Col>
              <Col span={12} className="gutter-row">
                <div>
                  <Genres 
                    topArtists={this.state.topArtists}
                    topTracks={this.state.topTracks}
                    handler={this.handler}
                    getUserTopArtists={this.getUserTopArtists}
                    getUserTopTracks={this.getUserTopTracks}
                    genreList={this.state.genreList}
                  />
                </div>
              </Col>
          </Row>
        </div>
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
