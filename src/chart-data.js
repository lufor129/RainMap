export const planetChartData = {
  type: 'bar',
  data: {
    labels: [],
    datasets: [
      { // one line graph
        label: '',
        data: [],
        backgroundColor: [],
        borderWidth: 3
      }
    ]
  },
  options: {
    responsive: true,
    lineTension: 1,
    scales: {
      yAxes: [{
        ticks: {
          beginAtZero: true,
          padding: 0,
        }
      }]
    }
  }
}

export default planetChartData;