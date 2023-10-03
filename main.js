const { ipcRenderer } = require('electron');
const Chart = require('chart.js'); // Import Chart.js

const teamNameInput = document.getElementById('teamNameInput');
const initialWeightInput = document.getElementById('initialWeightInput');
const addTeamButton = document.getElementById('addTeamButton');
const teamTable = document.getElementById('teamTable');
const chartCanvas = document.getElementById('teamChart'); // Reference the canvas element

// Array to store the list of teams
const teams = [];

// Function to add a team to the list
function addTeam(name, initialWeight) {
  teams.push({ name, initialWeight, currentScore: 0, breakPoint: false });
  updateTeamTable();
  updateChart(); // Call the function to update the chart
}

// Function to update the team table on the screen
function updateTeamTable() {
  // ... (existing code for updating the team table) ...
}

// Function to update the Chart.js chart
function updateChart() {
  // Extract the team names and scores for the chart
  const labels = teams.map((team) => team.name);
  const scores = teams.map((team) => team.currentScore);

  // Create a new Chart.js chart
  const ctx = chartCanvas.getContext('2d');
  const chart = new Chart(ctx, {
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

// Event listener for the "Add Team" button
addTeamButton.addEventListener('click', () => {
  const name = teamNameInput.value.trim();
  const initialWeight = parseFloat(initialWeightInput.value.trim());

  if (name && !isNaN(initialWeight)) {
    addTeam(name, initialWeight);
    teamNameInput.value = '';
    initialWeightInput.value = '';
  }
});

// Listen for IPC messages from the main process (if needed)
ipcRenderer.on('some-message-from-main', (event, data) => {
  // Handle messages from the main process if necessary
});
