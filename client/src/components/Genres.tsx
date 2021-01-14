import React, { Component } from 'react';
import Chart from 'chart.js';
// import { Slider, Tabs } from 'antd';

class Genres extends Component<any, any> {
  constructor(props: any) {
    super(props);
  }

  render() {
    const {
      topArtists,
      topTracks,
      handler,
      getUserTopArtists,
      getUserTopTracks,
      genreList
    } = this.props;

    const data = {
      datasets: [{
        data: Array.from(genreList.values())
      }] as any[],
      // These labels appear in the legend and in the tooltips when hovering different arcs
      labels: Array.from(genreList.keys()) as any[]
    };

    // context for chart <canvas />
    const ctx = document.getElementById('genreChart') as any;

    let genrePieChart = ctx !== null ? new Chart(ctx, {
      type: 'pie',
      data: data,
      options: {
        responsive : true,
        legend: {
          display: false
        }
      }
    }) : null;

    return (
      <div className={'dashboardContainer'}>
        <div className={'dashboardHeader'}>
          <h1>Genre Analysis</h1>
        </div>
        <canvas id="genreChart"></canvas>
      </div>
    )
  }
}

export default Genres;