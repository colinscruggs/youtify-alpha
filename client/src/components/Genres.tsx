import React, { Component } from 'react';
import { Slider, Tabs } from 'antd';

class Genres extends Component<any, any> {
  render() {
    const {
      topArtists,
      topTracks,
      handler,
      getUserTopArtists,
      getUserTopTracks
    } = this.props;

    return (
      <div className={'dashboardContainer'}>
        <div className={'dashboardHeader'}>
          <h1>Genre Analysis</h1>
        </div>
      </div>
    )
  }
}

export default Genres;