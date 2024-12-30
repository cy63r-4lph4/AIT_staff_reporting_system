
function fetchSummarry  (){
  
    fetch('fetch_summary_data.php')
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
      
  
        // Validate fetched data
        if (!data.activities || !data.monthly || !data.users || !data.totalReports) {
          throw new Error("Invalid data structure");
        }
  
        // Create charts
        const activityCtx = document.getElementById('activityChart').getContext('2d');
        const monthlyCtx = document.getElementById('monthlyChart').getContext('2d');
        const userCtx = document.getElementById('userChart').getContext('2d');
        const reportCtx = document.getElementById('reportChart').getContext('2d');
  
        // Activity Chart
        new Chart(activityCtx, {
          type: 'bar',
          data: {
            labels: data.activities.labels,
            datasets: [{
              label: 'Activities',
              data: data.activities.data,
              backgroundColor: ['#f87979', '#79f879', '#7979f8'],
            }]
          },
          options: {responsive: true,
            maintainAspectRatio: false,
            aspectRatio: 1,}
        });
  
        // Monthly Reports Chart
        new Chart(monthlyCtx, {
          type: 'line',
          data: {
            labels: data.monthly.labels,
            datasets: [{
              label: 'Monthly Reports',
              data: data.monthly.data,
              backgroundColor: '#79baf8',
              borderColor: '#79baf8',
              fill: false
            }]
          },
          options: {responsive: true,
            maintainAspectRatio: false,
            aspectRatio: 1,}
        });
  
        // Users Chart
        new Chart(userCtx, {
          type: 'pie',
          data: {
            labels: data.users.labels,
            datasets: [{
              label: 'User Contributions',
              data: data.users.data,
              backgroundColor: ['#f87979', '#79f879', '#7979f8', '#f8b879', '#79f8b8'],
            }]
          },
          options: {}
        });
    
  
        // Total Reports Chart
        new Chart(reportCtx, {
          type: 'doughnut',
          data: {
            labels: ['Submitted', 'Pending', 'Rejected'],
            datasets: [{
              label: 'Total Reports',
              data: data.totalReports,
              backgroundColor: ['#79f879', '#f8b879', '#f87979'],
            }]
          },
          options: {responsive: true,
            maintainAspectRatio: false,
            aspectRatio: 1,}
        });
      })
      .catch((error) => {
        console.error("Error fetching or processing data:", error);
      });
    }
