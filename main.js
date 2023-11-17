const teamNameInput = document.getElementById('teamNameInput');
const bridgeWeightInput = document.getElementById('bridgeWeightInput');
const tableNumberInput = document.getElementById('tableNumberInput');
const addTeamButton = document.getElementById('addTeamButton');
const teamTableBody = document.getElementById('teamTableBody');
// const teamChart = document.getElementById('teamChart').getContext('2d'); // Get the chart context
const loadAllButton = document.getElementById('loadAllButton');
const loadAllInput = document.getElementById('loadAllInput');
let teamSelectBox = document.getElementById('teamSelect');
  
// Array to store teams
const teams = [];
  
// Create an initial empty chart
// let chart;
    
// Class for teams. Each team will be an instance of this. This will allow us to keep track of each team's values more easily.
class Team {
    constructor(name, bridgeWeight, tableNumber){
        this.name = name;
        this.bridgeWeight = bridgeWeight;
        this.tableNumber = tableNumber;
    }
    score = 0;
    breakPoint = false;
    load = 0;
    mdr = 0;
    bDEF = 10;

}
function compareTeams(a, b) {
    if (a.score < b.score){
        return 1;
    }
    if (b.score < a.score){
        return -1;
    }
    return 0;
}


function sortTeams(teams){
    teams.sort(compareTeams);
}


// Function to add a team
function addTeam() {
    const name = teamNameInput.value;
    const bridgeWeight = parseFloat(bridgeWeightInput.value);
    const tableNumber = parseFloat(tableNumberInput.value);
  
    if (name && !isNaN(bridgeWeight) && !isNaN(tableNumber)) {
    const team = new Team(name, bridgeWeight, tableNumber);
  
    teams.push(team);
    updateTeamTable();
    // updateChart();
    teamNameInput.value = '';
    tableNumberInput.value = '';
    bridgeWeightInput.value = '';
    
    

    }
}

// Function to calculate all teams' scores
function calculateScores() {
    // set up variables for maxmimum/minimum values
    let [bwMax, lpMax, mdrMax, bwMin, lpMin, mdrMin] = [teams[0].bridgeWeight, teams[0].load, teams[0].bridgeWeight/teams[0].load, teams[0].bridgeWeight, teams[0].load, teams[0].bridgeWeight/teams[0].load];

    // loop through teams once to determine maxes/mins
    for (let i = 0; i < teams.length; i++){
        currentTeam = teams[i];
        if (currentTeam.bridgeWeight > bwMax){
            bwMax = currentTeam.bridgeWeight;
        }
        if (currentTeam.bridgeWeight < bwMin){
            bwMin = currentTeam.bridgeWeight;
        }


        if (currentTeam.load > lpMax){
            lpMax = currentTeam.load;
        }
        if (currentTeam.load < lpMin){
            lpMin = currentTeam.load;
        }


        currentTeam.mdr = currentTeam.bridgeWeight/currentTeam.load;
        if (currentTeam.mdr > mdrMax) {
            mdrMax = currentTeam.mdr;
        }
        if (currentTeam.mdr < mdrMin) {
            mdrMin = currentTeam.mdr;
        }
    }
        
    // loop through teams again to calculate their scores
    for (let i = 0; i < teams.length; i++) {
        let currentTeam = teams[i];
        let bwr = 1 + (49/(bwMax - bwMin) * (bwMax - currentTeam.bridgeWeight));
        let lpr = 1 + (49/(lpMax - lpMin) * (currentTeam.load - lpMin));
        let mdrr = 1 + (49/(mdrMax - mdrMin) * (mdrMax - currentTeam.mdr));

        let score = currentTeam.bDEF + bwr + lpr + mdrr;

        console.log(currentTeam.name + "'s BDEF: " + currentTeam.bDEF + " BWR: " + bwr + " LPR: " + " MDRR: " + mdrr);

        currentTeam.score = currentTeam.bDEF + bwr + lpr + mdrr;
    }


}
  
// Function to update the team table
function updateTeamTable() {
    teamTableBody.innerHTML = '';
    teams.forEach((team, index) => {
    const row = teamTableBody.insertRow();
    row.className = 'actualTable';
    row.innerHTML = `
        
        
        <div>
            <tr>
                <td style="color:red;">${index+1}</td>
                <td>${team.name}</td>
                <td>${team.tableNumber}</td>
                <td>${team.bridgeWeight}</td>
                <td>${team.load}</td>
                <td>${team.bDEF}</td>
                <td>${team.breakPoint ? 'Broken' : 'Not Broken'}</td>
                <td>${Math.round(team.score*100)/100}</td>
                <td>
                    <button onclick="markAsBroken(${index})">Broken?</button>
                </td>
            </tr>

            <div class="dropdown">
                <button class="dropbtn">...</button>
                <div class="dropdown-content">
                    <button onclick="updateLoad(${index})">Update Load</button>
                    <button onclick="updateBDEF(${index})">Update BDEF</button>
                </div>
            </div>
        </div>
    `;
    });
    updateBoldRows();
    teamElementArray = []
    console.log(teamSelectBox);
    for (let i = teamSelectBox.options.length-1; i >= 0; i--) {
        teamSelectBox.remove(i)
    }
    for (let i = 0; i < teams.length; i++){
        let teamElement = document.createElement("option");
        teamElement.textContent = "Table " + teams[i].tableNumber + ": " + teams[i].name;
        teamElement.value = i;
        teamElementArray.push(teamElement);
    }
    teamElementArray.sort(compareElementArray);
    for (let i = 0; i < teamElementArray.length; i++){
        console.log("teamElementArray[" + i + "]'s textContent is " + teamElementArray[i].textContent +", and its rank is " + (teamElementArray[i].value+1));
        teamSelect.append(teamElementArray[i]);
    }

}

//really hacky solution to sort the element array by the team's table number
function compareElementArray(a, b) {
    //if the team's table number at the index of the element's value in "teams" array is lower, bring it up. Otherwise, bring it down
    if (teams[a.value].tableNumber > teams[b.value].tableNumber){
            return 1;
        }
        if (teams[b.value].tableNumber > teams[a.value].tableNumber){
            return -1;
        }
        return 0;
}


function updateBoldRows() {
    let table = document.getElementById("teamTableBody");
    let rows = table.rows;

    // Remove bold from all rows
    for (let i = 0; i < rows.length; i++) {
        rows[i].classList.remove("boldRow");
    }

    // Apply bold to the top three rows
    for (let i = 0; i < Math.min(3, rows.length); i++) {
        rows[i].classList.add("boldRow");
    }
}

window.onload = function() {
    updateBoldRows();
};


// Function to update the Chart.js chart
// function updateChart() {
//     if (chart) {
//     chart.destroy(); // Destroy the previous chart instance to prevent memory leaks
//     }
  
//     // Extract the team names and scores for the chart
//     const labels = teams.map((team) => team.name);
//     const scores = teams.map((team) => team.score);
  
//     // Create a new Chart.js chart
//     chart = new Chart(teamChart, {
//     type: 'bar', // You can choose the chart type (e.g., bar, line, pie, etc.)
//     data: {
//         labels: labels,
//         datasets: [
//         {
//             label: 'Scores',
//             data: scores,
//             backgroundColor: 'rgba(75, 192, 192, 0.2)',
//             borderColor: 'rgba(75, 192, 192, 1)',
//             borderWidth: 1,
//         },
//         ],
//     },
//     options: {
//         scales: {
//         y: {
//             beginAtZero: true,
//         },
//         },
//     },
//     });
// }
  
// Function to update the score of a team
function updateLoad(index) {
    const addedWeight = parseFloat(prompt(`Enter load change for ${teams[index].name}:`));
    if (!isNaN(addedWeight)) {
    teams[index].load += addedWeight;
    calculateScores();
    sortTeams(teams);
    updateTeamTable();
    // updateChart();
    }
}

function updateBDEF(index) {
const bDEF = parseFloat(prompt(`Enter BDEF for ${teams[index].name}:`));
if (!isNaN(bDEF)) {
    teams[index].bDEF = bDEF;
    calculateScores();
    sortTeams(teams);
    updateTeamTable();
    // updateChart();
}
}
// function to update load of all teams
function loadAll() {
        
    if ((teams.length != 0) && (!isNaN(loadAllInput.valueAsNumber))){

        load = loadAllInput.valueAsNumber;
        for (i = 0; i < teams.length; i++){
            if (!teams[i].breakPoint) {
                teams[i].load += load;
            }
        }
        calculateScores();
        sortTeams(teams);
        updateTeamTable();
        // updateChart();
    }
    else {
        console.log("Cannot add value to teams.");
    }
}
// Function to mark a team as broken
function markAsBroken(index) {
    teams[index].breakPoint = !teams[index].breakPoint;
    updateTeamTable();
    // updateChart();
}
  
// Event listener for the "Add Team" button
addTeamButton.addEventListener('click', addTeam);
addTeamButton.addEventListener('click', updateBoldRows);
    


loadAllButton.addEventListener('click', loadAll);