const teamNameInput = document.getElementById('teamNameInput');
    const initialWeightInput = document.getElementById('initialWeightInput');
    const addTeamButton = document.getElementById('addTeamButton');
    const teamTableBody = document.getElementById('teamTableBody');
    const teamChart = document.getElementById('teamChart').getContext('2d'); // Get the chart context
  
    // Array to store teams
    const teams = [];
  
    // Create an initial empty chart
    let chart;
  
    // Function to add a team
    function addTeam() {
      const name = teamNameInput.value;
      const initialWeight = parseFloat(initialWeightInput.value);
  
      if (name && !isNaN(initialWeight)) {
        const team = {
          name,
          initialWeight,
          currentScore: 0,
          breakPoint: false
        };
  
        teams.push(team);
        updateTeamTable();
        updateChart();
        teamNameInput.value = '';
        initialWeightInput.value = '';
      }
    }
  
    // Function to update the team table
    function updateTeamTable() {
      teamTableBody.innerHTML = '';
      teams.forEach((team, index) => {
        const row = teamTableBody.insertRow();
        row.innerHTML = `
          <td>${team.name}</td>
          <td>${team.initialWeight}</td>
          <td>${team.currentScore}</td>
          <td>${team.breakPoint ? 'Broken' : 'Not Broken'}</td>
          <td>
            <button onclick="updateScore(${index})">Update Score</button>
            <button onclick="markAsBroken(${index})">Mark as Broken</button>
          </td>
        `;
      });
    }
  
    // Function to update the Chart.js chart
    function updateChart() {
      if (chart) {
        chart.destroy(); // Destroy the previous chart instance to prevent memory leaks
      }
  
      // Extract the team names and scores for the chart
      const labels = teams.map((team) => team.name);
      const scores = teams.map((team) => team.currentScore);
  
      // Create a new Chart.js chart
      chart = new Chart(teamChart, {
        type: 'bar', // You can choose the chart type (e.g., bar, line, pie, etc.)
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Scores',
              data: scores,
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1,
            },
          ],
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      });
    }
  
    // Function to update the score of a team
    function updateScore(index) {
      const addedWeight = parseFloat(prompt(`Enter weight added for ${teams[index].name}:`));
      if (!isNaN(addedWeight)) {
        teams[index].currentScore += addedWeight;
        updateTeamTable();
        updateChart();
      }
    }
  
    // Function to mark a team as broken
    function markAsBroken(index) {
      teams[index].breakPoint = true;
      updateTeamTable();
      updateChart();
    }
  
    // Event listener for the "Add Team" button
    addTeamButton.addEventListener('click', addTeam);