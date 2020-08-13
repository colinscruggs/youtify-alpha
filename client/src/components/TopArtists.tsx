import React, { Component } from 'react';

class TopArtists extends Component<any, any> {
  render() {
    const {
      topArtists
    } = this.props;

    return (
      <div className={'topArtistsContainer'}>
        <h2>
          Top Artists
        </h2>
        {
          topArtists.map((artist: SpotifyApi.ArtistObjectFull) => {
            return (
              <div>
                { artist.name }
              </div>
            )
          })
        }
      </div>
    )
  }
}

export default TopArtists;