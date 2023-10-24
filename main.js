const teamNameInput = document.getElementById('teamNameInput');
    const bridgeWeightInput = document.getElementById('bridgeWeightInput');
    const addTeamButton = document.getElementById('addTeamButton');
    const teamTableBody = document.getElementById('teamTableBody');
    const teamChart = document.getElementById('teamChart').getContext('2d'); // Get the chart context
    const loadAllButton = document.getElementById('loadAllButton');
    const loadAllInput = document.getElementById('loadAllInput');
  
    // Array to store teams
    const teams = [];
  
    // Create an initial empty chart
    let chart;
    
    // Class for teams. Each team will be an instance of this. This will allow us to keep track of each team's values more easily.
    class Team {
        constructor(name, bridgeWeight){
            this.name = name;
            this.bridgeWeight = bridgeWeight;
        }
        currentScore = 0;
        breakPoint = false;
        load = 0;
        bDEF = 10;

    }


    // Function to add a team
    function addTeam() {
      const name = teamNameInput.value;
      const bridgeWeight = parseFloat(bridgeWeightInput.value);
  
      if (name && !isNaN(bridgeWeight)) {
        const team = new Team(name, bridgeWeight);
  
        teams.push(team);
        updateTeamTable();
        updateChart();
        teamNameInput.value = '';
        bridgeWeightInput.value = '';

      }
    }
  
    // Function to update the team table
    function updateTeamTable() {
      teamTableBody.innerHTML = '';
      teams.forEach((team, index) => {
        const row = teamTableBody.insertRow();
        row.innerHTML = `
          <td>${team.name}</td>
          <td>${team.bridgeWeight}</td>
          <td>${team.currentScore}</td>
          <td>${team.load}</td>
          <td>${team.breakPoint ? 'Broken' : 'Not Broken'}</td>
          <td>${team.bDEF}</td>
          <td>
            <button onclick="updateLoad(${index})">Update Load</button>
            <button onclick="updateBDEF(${index})">Update BDEF</button>
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
    function updateLoad(index) {
      const addedWeight = parseFloat(prompt(`Enter load change for ${teams[index].name}:`));
      if (!isNaN(addedWeight)) {
        teams[index].load += addedWeight;
        updateTeamTable();
        updateChart();
      }
    }

function updateBDEF(index) {
    const bDEF = parseFloat(prompt(`Enter BDEF for ${teams[index].name}:`));
    if (!isNaN(bDEF)) {
        teams[index].bDEF = bDEF;
        updateTeamTable();
        updateChart();
    }
}
    // function to update load of all teams
    function loadAll() {
        
        if ((teams.length != 0) && (!isNaN(loadAllInput.valueAsNumber))){

            load = loadAllInput.valueAsNumber;
            for (i = 0; i < teams.length; i++){
                teams[i].load += load;
            }
            updateTeamTable();
            updateChart();
        }
        else {
            console.log("Cannot add value to teams.");
        }
    }
    // Function to mark a team as broken
    function markAsBroken(index) {
      teams[index].breakPoint = !teams[index].breakPoint;
      updateTeamTable();
      updateChart();
    }
  
    // Event listener for the "Add Team" button
    addTeamButton.addEventListener('click', addTeam);

    loadAllButton.addEventListener('click', loadAll);