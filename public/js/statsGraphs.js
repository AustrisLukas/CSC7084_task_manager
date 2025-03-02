
function createCategoryGraph(chartData) {
    const ctx = document.getElementById('categoryChart').getContext('2d'); 

    const categoryChart = new Chart(ctx, {
        type: 'bar', 
        data: {
            labels: chartData.labels, 
            datasets: [{
                data: chartData.values, 
                backgroundColor: 'rgba(56, 134, 197, 0.2)',
                borderColor: 'rgba(18, 33, 92, 0.2)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRation: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins:{
                title:{
                    display: true,
                    text: "Active Tasks per Category"
                },
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    min: 0,
                    max: Math.max(...chartData.values.map(element=>parseInt(element))),
                    ticks: {
                        stepSize: 1
                    }
                }
            },
        }
    });
}



function createDueSummaryGraph(chartData) {
    console.log('in summary graph')
    const ctx = document.getElementById('dueSummaryChart').getContext('2d');
    
    const categoryChart = new Chart(ctx, {
        type: 'doughnut', 
        data: {
            labels: chartData.labels, 
            datasets: [{
                data: chartData.values, 
                backgroundColor:["rgba(75, 192, 192, 0.5)","rgba(255, 159, 64, 0.5)","rgba(255, 99, 132, 0.5)"]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRation: false,
            plugins:{
                title:{
                    display: true,
                    text: "Task Status Overview"
                },
                legend: {
                    display: true,
                    position: "bottom"
                },
            },
        },


    });
}


