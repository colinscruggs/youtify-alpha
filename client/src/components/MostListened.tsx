import React, { Component } from 'react';
import { Slider, Tabs, Card } from 'antd';
import { TimeRange } from '../models/TimeRange';

class MostListened extends Component<any, any> {
  render() {
    const {
      topArtists,
      topTracks,
      handler,
      getUserTopArtists,
      getUserTopTracks
    } = this.props;

    const rangeSliderMarks = {
      0: '~4 Weeks',
      1: '~6 Months',
      2: {
        label: 'All Time',
        style: {
          width: 'fit-content'
        }
      }
    };

    const { TabPane } = Tabs;

    const rangeSliderFormatter = (value: any) => {
      switch(value) {
        case 0: return `~4 Weeks`;
        case 1: return `~6 Months`;
        case 2: return `All Time`
      }
    }

    const onSliderChange = (e: number, type: string) => {
      let range = TimeRange.mediumTerm; // default value

      switch(e) {
        case 0: range = TimeRange.shortTerm; break;
        case 1: range = TimeRange.mediumTerm; break;
        case 2: range = TimeRange.longTerm; break;
      }

      switch(type) {
        case 'artist':
          handler('artistRange', range);
          break;
        case 'track':
          handler('trackRange', range);
          break;
      }
    }

    const onTabChange = (e: string) => {
      switch(e) {
        case 'artists':
          getUserTopArtists();
          break;
        case 'tracks':
          getUserTopTracks();
          break;
      }
    }

    return (
      <div className={'dashboardContainer'}>
        <div className={'dashboardHeader'}>
          <h1>Most Listened</h1>
        </div>
        <Tabs centered
          defaultActiveKey="artists"
          animated={true}
          size={'large'}
          onChange={(e) => { onTabChange(e) }}
        >
          <TabPane tab="Top Artists" key={"artists"}>
            <div>
              <div className={'rangeSlider'}>
                <h4>Time Range</h4>
                <Slider defaultValue={1}
                  min={0} max={2} 
                  marks={rangeSliderMarks}
                  tipFormatter={rangeSliderFormatter}
                  onChange={(e: number) => {
                    onSliderChange(e, 'artist');
                  }} />
              </div>
              <div className={'artistTrackContainer'}>
              {
                  topArtists.map((artist: SpotifyApi.ArtistObjectFull) => {
                  return (
                    <div className={'artistCard'}>
                      <img alt={artist.name} src={artist.images[0].url} />
                      <p key={artist.name}>{artist.name}</p>
                    </div>
                  )
                })
              }
              </div>
            </div>
          </TabPane>
          <TabPane tab="Top Tracks" key="tracks">
            <div>
              <div className={'rangeSlider'}>
                <h4>Time Range</h4>
                <Slider defaultValue={1}
                  min={0} max={2} 
                  marks={rangeSliderMarks}
                  tipFormatter={rangeSliderFormatter}
                  onChange={(e: number) => {
                    onSliderChange(e, 'track');
                  }} />
              </div>
              <div>
              {
                  topTracks.map((track: SpotifyApi.TrackObjectFull) => {
                  return (
                    <p key={track.name}>{track.name} - {track.artists.reduce(function(acc, artist, i, artists) {
                      return acc + (i < artists.length - 1 ? artist.name + ', ' : artist.name);
                    }, '')}</p>
                  )
                })
              }
              </div>
            </div>
          </TabPane>
        </Tabs>
      </div>
    )
  }
}

export default MostListened;