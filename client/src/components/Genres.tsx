import React, { Component } from 'react';
import Chart from 'chart.js';
// import { Slider, Tabs } from 'antd';

class Genres extends Component<any, any> {

  render() {
    const {
      topArtists,
      topTracks,
      handler,
      getUserTopArtists,
      getUserTopTracks
    } = this.props;

    const data = {
      datasets: [{
          data: [10, 20, 30]
      }],
      // These labels appear in the legend and in the tooltips when hovering different arcs
      labels: [
          'Red',
          'Yellow',
          'Blue'
      ]
    };

    // context for chart <canvas />
    const ctx = document.getElementById('genreChart') as any;

    let genrePieChart = ctx !== null ? new Chart(ctx, {
      type: 'pie',
      data: data
      //options: options
    }) : null;

    return (
      <div className={'dashboardContainer'}>
        <div className={'dashboardHeader'}>
          <h1>Genre Analysis</h1>
          <canvas id="genreChart" width="400" height="400"></canvas>
        </div>
      </div>
    )
  }
}

export default Genres;