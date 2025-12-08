const { useEffect, useRef } = React;

window.ChartsPanel = ({ data, timeUnit, language }) => {
  const t = window.TRANSLATIONS[language];
  const chartRef = useRef(null);
  const canvasRef = useRef(null);

  // Helper to format time for the X-axis
  const formatTime = (value) => {
      if (timeUnit === 'Seconds') {
        const mins = Math.floor(value / 60);
        const secs = Math.floor(value % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
      } else if (timeUnit === 'Minutes') {
        const hours = Math.floor(value / 60);
        const mins = Math.floor(value % 60);
        return `${hours}:${mins < 10 ? '0' : ''}${mins}`;
      } else {
        const days = Math.floor(value / 24);
        const hours = Math.floor(value % 24);
        return `d${days} ${hours}h`;
      }
  };

  const getRightAxisLabel = () => {
      switch (timeUnit) {
          case 'Seconds': return `TH (${t.units.itemsMin}) / LT (${t.units.min})`;
          case 'Minutes': return `TH (${t.units.itemsHr}) / LT (${t.units.hr})`;
          case 'Hours': return `TH (${t.units.itemsDay}) / LT (${t.units.days})`;
      }
  };

  useEffect(() => {
    if (!canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d');

    // Prepare data
    const labels = data.map(d => formatTime(d.time));
    const wipData = data.map(d => d.wip);
    const thData = data.map(d => d.throughput);
    const ltData = data.map(d => d.leadTime);

    // Destroy previous chart if exists
    if (chartRef.current) {
        chartRef.current.destroy();
    }

    // Create gradient for WIP
    const gradientWip = ctx.createLinearGradient(0, 0, 0, 400);
    gradientWip.addColorStop(0, 'rgba(254, 80, 0, 0.2)'); // #FE5000
    gradientWip.addColorStop(1, 'rgba(254, 80, 0, 0.0)');

    chartRef.current = new window.Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: t.metrics.wip,
                    data: wipData,
                    borderColor: '#FE5000',
                    backgroundColor: gradientWip,
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    yAxisID: 'y',
                    pointRadius: 0,
                    pointHoverRadius: 4
                },
                {
                    label: t.metrics.throughput,
                    data: thData,
                    borderColor: '#0093D0',
                    backgroundColor: '#0093D0',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.4,
                    yAxisID: 'y1',
                    pointRadius: 0,
                    pointHoverRadius: 4
                },
                {
                    label: t.metrics.leadTime,
                    data: ltData,
                    borderColor: '#D7C4E2',
                    backgroundColor: '#D7C4E2',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.4,
                    yAxisID: 'y1',
                    pointRadius: 0,
                    pointHoverRadius: 4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    titleColor: '#000',
                    bodyColor: '#000',
                    borderColor: '#e5e7eb',
                    borderWidth: 1,
                    padding: 10,
                    displayColors: true,
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += context.parsed.y.toFixed(1);
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: '#f3f4f6'
                    },
                    ticks: {
                        maxTicksLimit: 8,
                        color: '#9ca3af'
                    },
                    title: {
                        display: true,
                        text: `${t.charts.time} (${timeUnit})`,
                        align: 'end',
                        color: '#9ca3af'
                    }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: t.charts.wip,
                        color: '#FE5000'
                    },
                    grid: {
                         color: '#f3f4f6'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    beginAtZero: true,
                    grid: {
                        drawOnChartArea: false,
                    },
                    title: {
                        display: true,
                        text: getRightAxisLabel(),
                        color: '#0093D0'
                    }
                },
            }
        }
    });

    return () => {
        if (chartRef.current) {
            chartRef.current.destroy();
        }
    };
  }, [data, timeUnit, language, t]); // Re-render when data or settings change

  return (
    <div className="w-full h-[400px] bg-white rounded-xl p-4 relative">
      <canvas ref={canvasRef}></canvas>
      {data.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-400 bg-white/50">
          {t.charts.waiting}
        </div>
      )}
    </div>
  );
};
