// DOM element references
const teamNameInput     = document.getElementById('teamNameInput');
const bridgeWeightInput = document.getElementById('bridgeWeightInput');
// tableNumberInput is removed; we no longer use table numbers as a column in the UI
// const tableNumberInput  = document.getElementById('tableNumberInput');
const addTeamButton     = document.getElementById('addTeamButton');

const loadAllButton     = document.getElementById('loadAllButton');
const loadAllInput      = document.getElementById('loadAllInput');

const teamSelectBox     = document.getElementById('teamSelect');

// Toggle button to collapse/expand the team creation panel
const toggleCreationButton = document.getElementById('toggleCreation');

// Hint element displayed when the Add Team panel is collapsed
const addTeamHint = document.getElementById('addTeamHint');

// Initially hide the add team hint.  It becomes visible when the panel is collapsed.
if (addTeamHint) {
  addTeamHint.style.display = 'none';
}

// Winner name elements for Truss and Drawbridge standings
const teamWinnerName1_truss = document.getElementById('teamWinnerName1_truss');
const teamWinnerName2_truss = document.getElementById('teamWinnerName2_truss');
const teamWinnerName3_truss = document.getElementById('teamWinnerName3_truss');

const teamWinnerName1_draw  = document.getElementById('teamWinnerName1_draw');
const teamWinnerName2_draw  = document.getElementById('teamWinnerName2_draw');
const teamWinnerName3_draw  = document.getElementById('teamWinnerName3_draw');

// Team data storage
const teams = [];
let nextId = 1;

// ======= Team Class =======
/**
 * Team model representing a single bridge entry.  The constructor accepts
 * a team name, bridge weight (grams), table number, school (optional) and design (truss/drawbridge).
 */
class Team {
  constructor(name, bridgeWeight, tableNumber, school = '', design = 'truss') {
    this.id = nextId++;
    this.name = name;
    this.school = school;
    this.design = design;
    // We no longer display table numbers in the UI; however the property is
    // retained internally for sorting or other potential uses.  Pass null
    // when creating teams since there is no input field for it anymore.
    this.tableNumber = Number(tableNumber) || null;
    this.bridgeWeight = Number(bridgeWeight) || 0; // grams
    this.load = 0; // pounds of load carried
    this.bDEF = 10; // default BDEF value
    this.breakPoint = false; // false when not broken
    this.mdr = 0; // mass to load ratio (bridge weight / load)
    this.score = 0; // combined score used for ranking
    // When the bridge breaks, we capture its score at that moment.  This
    // prevents the score from changing as other teams continue loading.
    this.frozenScore = undefined;
  }
}

/**
 * Comparison function to sort teams by score descending (higher is better).
 */
function compareTeams(a, b) {
  if (a.score < b.score) return 1;
  if (b.score < a.score) return -1;
  return 0;
}

// ======= Utility Functions =======
function calculateScores() {
  // Exit early if no teams
  if (teams.length === 0) return;

  // Gather values for extrema calculations
  const bwVals   = teams.map(t => t.bridgeWeight);
  const loadVals = teams.map(t => t.load);
  const mdrVals  = teams.map(t => (t.load ? t.bridgeWeight / t.load : 0));

  const bwMax   = Math.max(...bwVals);
  const bwMin   = Math.min(...bwVals);
  const loadMax = Math.max(...loadVals);
  const loadMin = Math.min(...loadVals);
  const mdrMax  = Math.max(...mdrVals);
  const mdrMin  = Math.min(...mdrVals);

  teams.forEach(t => {
    // Update MDR (mass-to-load ratio), using 0 if load is zero
    t.mdr = t.load ? (t.bridgeWeight / t.load) : 0;

    // Bridge Weight Ratio (BWR) – favors lighter bridges
    const bwr = bwMax !== bwMin
      ? 1 + (49 / (bwMax - bwMin)) * (bwMax - t.bridgeWeight)
      : 1;

    // Load Ratio (LPR) – favors greater loads
    const lpr = loadMax !== loadMin
      ? 1 + (49 / (loadMax - loadMin)) * (t.load - loadMin)
      : 1;

    // Mass-to-Load Ratio (MDRR) – favors lower mdr
    const mdrr = mdrMax !== mdrMin
      ? 1 + (49 / (mdrMax - mdrMin)) * (mdrMax - t.mdr)
      : 1;

    const newScore = (Number(t.bDEF) || 0) + bwr + lpr + mdrr;

    // Freeze the score once the bridge breaks
    if (t.breakPoint) {
      if (t.frozenScore === undefined) {
        t.frozenScore = newScore;
      }
      t.score = t.frozenScore;
    } else {
      t.frozenScore = undefined;
      t.score = newScore;
    }
  });
}

/**
 * Renders a leaderboard table for a specific design.  The table is rebuilt from scratch
 * each time using the supplied sorted array of teams.
 *
 * @param {string} tableId DOM id of the table element
 * @param {Team[]} designTeams sorted array of teams belonging to this design
 */
function renderTableForDesign(tableId, designTeams) {
  const table = document.getElementById(tableId);
  if (!table) return;
  // Build the header row again
  table.innerHTML = `
    <tr class="tableAttributes">
      <th>Rank</th>
      <th>Team</th>
      <th>Bridge<br>Weight</th>
      <th>Load</th>
      <th>BDEF</th>
      <th>Status</th>
      <th>Score</th>
    </tr>
  `;
  // Populate rows
  designTeams.forEach((team, idx) => {
    const row = table.insertRow();
    row.className = 'teamTableRow';
    // Determine status pill
    const statusHtml = team.breakPoint
      ? '<span class="status-broken">Broken</span>'
      : '<span class="status-ok">OK</span>';
    row.innerHTML = `
      <td>${idx + 1}</td>
      <td>${team.name}</td>
      <td>${team.bridgeWeight} g</td>
      <td>${team.load}</td>
      <td>${team.bDEF}</td>
      <td>${statusHtml}</td>
      <td>${Math.round(team.score * 100) / 100}</td>
    `;
  });
}

/**
 * Updates the winners panel for a specific design by filling the appropriate name fields.
 *
 * @param {string} design 'truss' or 'drawbridge'
 * @param {Team[]} sortedTeams sorted array of teams for this design
 */
function updateDesignWinners(design, sortedTeams) {
  const topNames = sortedTeams.slice(0, 3).map(t => truncateTeamName(t.name, 18));
  if (design === 'truss') {
    if (teamWinnerName1_truss) teamWinnerName1_truss.textContent = topNames[0] || '?';
    if (teamWinnerName2_truss) teamWinnerName2_truss.textContent = topNames[1] || '?';
    if (teamWinnerName3_truss) teamWinnerName3_truss.textContent = topNames[2] || '?';
  } else {
    if (teamWinnerName1_draw) teamWinnerName1_draw.textContent = topNames[0] || '?';
    if (teamWinnerName2_draw) teamWinnerName2_draw.textContent = topNames[1] || '?';
    if (teamWinnerName3_draw) teamWinnerName3_draw.textContent = topNames[2] || '?';
  }
}


/**
 * Rebuilds both tables and updates winners after data changes.
 */
function updateTables() {
  calculateScores();
  // Sort teams per design
  const trussTeams = teams.filter(t => t.design === 'truss').slice().sort(compareTeams);
  const drawTeams  = teams.filter(t => t.design === 'drawbridge').slice().sort(compareTeams);
  // Render tables
  renderTableForDesign('trussTable', trussTeams);
  renderTableForDesign('drawTable', drawTeams);
  // Highlight top three rows in each table
  updateBoldRows('trussTable');
  updateBoldRows('drawTable');
  // Update winners panels
  updateDesignWinners('truss', trussTeams);
  updateDesignWinners('drawbridge', drawTeams);
  // Rebuild the team selection dropdown
  rebuildSelectBox();
}

/**
 * Adds a new team using values from the input fields.
 */
function addTeam() {
  const name         = (teamNameInput.value || '').trim();
  const bridgeWeight = parseFloat(bridgeWeightInput.value);
  // No table number is captured from the UI any more; we pass null so the Team
  // object still has a tableNumber property internally.
  const tableNumber  = null;
  // Read design selection
  const designSelect = document.getElementById('designSelect');
  const design       = designSelect ? designSelect.value : 'truss';
  // Validate inputs
  if (!name || isNaN(bridgeWeight)) return;
  const team = new Team(name, bridgeWeight, tableNumber, '', design);
  teams.push(team);
  // Clear inputs
  teamNameInput.value     = '';
  bridgeWeightInput.value = '';
  if (designSelect) designSelect.value = 'truss';
  // Update UI
  updateTables();
}

/**
 * Removes a team from the list by index after confirmation.
 *
 * @param {number} index
 */
function removeTeam(index) {
  index = Number(index);
  if (isNaN(index) || !teams[index]) return;
  const ok = confirm(`Are you sure you want to remove ${teams[index].name}?`);
  if (ok) {
    teams.splice(index, 1);
    updateTables();
  }
}

/**
 * Applies a load delta to a specific team.
 *
 * @param {number} index
 */
function updateLoad(index) {
  index = Number(index);
  if (isNaN(index) || !teams[index]) return;
  const added = parseFloat(prompt(`Enter load change (lb) for ${teams[index].name}:`));
  if (!isNaN(added)) {
    if (!teams[index].breakPoint) {
      teams[index].load += added;
      updateTables();
    }
  }
}

/**
 * Updates the BDEF value for a team.
 *
 * @param {number} index
 */
function updateBDEF(index) {
  index = Number(index);
  if (isNaN(index) || !teams[index]) return;
  const val = parseFloat(prompt(`Enter BDEF for ${teams[index].name}:`));
  if (!isNaN(val)) {
    teams[index].bDEF = val;
    updateTables();
  }
}

/**
 * Updates the bridge weight for a team.
 *
 * @param {number} index
 */
function updateBridgeWeight(index) {
  index = Number(index);
  if (isNaN(index) || !teams[index]) return;
  const val = parseFloat(prompt(`Enter Bridge Weight (grams) for ${teams[index].name}:`));
  if (!isNaN(val)) {
    teams[index].bridgeWeight = val;
    updateTables();
  }
}

/**
 * Updates the table number for a team.
 *
 * @param {number} index
 */
function updateTableNumber(index) {
  index = Number(index);
  if (isNaN(index) || !teams[index]) return;
  const val = parseFloat(prompt(`Enter Table Number for ${teams[index].name}:`));
  if (!isNaN(val)) {
    teams[index].tableNumber = val;
    updateTables();
  }
}

/**
 * Toggles the broken status for a team.
 *
 * @param {number} index
 */
function markAsBroken(index) {
  index = Number(index);
  if (isNaN(index) || !teams[index]) return;
  teams[index].breakPoint = !teams[index].breakPoint;
  updateTables();
}

// ======= Load All =======
function loadAll() {
  if (!teams.length || isNaN(loadAllInput.valueAsNumber)) return;
  const add = loadAllInput.valueAsNumber;
  teams.forEach(t => {
    if (!t.breakPoint) {
      t.load += add;
    }
  });
  updateTables();
}

/**
 * Rebuilds the team selection dropdown.  Options display design, table number and team name.
 */
function rebuildSelectBox() {
  if (!teamSelectBox) return;
  // Remove all existing options
  while (teamSelectBox.options.length) teamSelectBox.remove(0);
  // Build new options sorted alphabetically by team name within design.  The table number
  // is no longer displayed since the column has been removed from the UI.
  const sorted = teams.slice().sort((a, b) => {
    // Sort by design first (truss before drawbridge) then by team name
    if (a.design !== b.design) return a.design.localeCompare(b.design);
    return a.name.localeCompare(b.name);
  });
  sorted.forEach((team) => {
    const option = document.createElement('option');
    option.value = String(teams.indexOf(team));
    option.textContent = `${team.design === 'truss' ? 'Truss' : 'Draw'}: ${team.name}`;
    teamSelectBox.append(option);
  });
}

/**
 * Truncates long team names for display.
 *
 * @param {string} teamName
 * @param {number} maxLength
 */
function truncateTeamName(teamName, maxLength) {
  if (!teamName) return '';
  return teamName.length > maxLength
    ? teamName.substring(0, maxLength - 4) + '...' + teamName.slice(-1)
    : teamName;
}

/**
 * Applies the bold styling to the top three rows of a given table.
 *
 * @param {string} tableId
 */
function updateBoldRows(tableId) {
  const table = document.getElementById(tableId);
  if (!table) return;
  const rows = table.rows;
  // Remove existing boldRow classes
  for (let i = 0; i < rows.length; i++) {
    rows[i].classList.remove('boldRow');
  }
  // Add boldRow to the first 3 data rows (skip header)
  const limit = Math.min(4, rows.length); // header + top 3
  for (let i = 1; i < limit; i++) {
    rows[i].classList.add('boldRow');
  }
  //add silver and bronze to second and third row
    rows[2].classList.add('boldRow2');
    rows[3].classList.add('boldRow3');
}

// Event listeners
addTeamButton.addEventListener('click', () => {
  addTeam();
});
loadAllButton.addEventListener('click', loadAll);

// Toggle collapse/expand of the team creation panel.  Clicking the arrow
// button will toggle the 'collapsed' class on the movementforBottom container
// and switch the arrow direction accordingly.  This prevents the bottom
// panel from covering the tables when not needed.
if (toggleCreationButton) {
  toggleCreationButton.addEventListener('click', () => {
    const panel = document.querySelector('.movementforBottom');
    if (!panel) return;
    panel.classList.toggle('collapsed');
    // Update the arrow direction: down arrow when panel is visible, up when collapsed
    if (panel.classList.contains('collapsed')) {
      toggleCreationButton.textContent = '▲';
      // Show the hint when collapsed
      if (addTeamHint) {
        addTeamHint.style.display = 'block';
      }
    } else {
      toggleCreationButton.textContent = '▼';
      // Hide the hint when expanded
      if (addTeamHint) {
        addTeamHint.style.display = 'none';
      }
    }
  });
}

// When the hint is clicked, expand the Add Team panel and hide the hint
if (addTeamHint) {
  addTeamHint.addEventListener('click', () => {
    const panel = document.querySelector('.movementforBottom');
    if (!panel) return;
    // Remove the collapsed class to show the panel
    panel.classList.remove('collapsed');
    // Change the toggle button arrow back to down
    if (toggleCreationButton) toggleCreationButton.textContent = '▼';
    // Hide the hint
    addTeamHint.style.display = 'none';
  });
}

// This is done for the testing phase, because I don't feel like inputting all of the info
// one value at a time, I will make JS input it for me based on the script I put on the HTML side
// For now, I will leave this commented out:
// Initial render with optional preload of teams from embedded JSON data
window.onload = function() {
  // If a script tag with id="initialData" exists, parse its JSON content and
  // populate the teams array.  This allows a JSON template to initialize
  // the competition with starting teams.  The JSON should be an array of
  // objects with properties: name, tableNumber, bridgeWeight and design.
  const dataTag = document.getElementById('initialData');
  if (dataTag && dataTag.textContent.trim()) {
    try {
      const initialData = JSON.parse(dataTag.textContent);
      if (Array.isArray(initialData)) {
        initialData.forEach(item => {
          if (item && item.name) {
            const design = String(item.design || 'truss').toLowerCase();
            const team = new Team(
              item.name,
              item.bridgeWeight,
              item.tableNumber,
              '',
              design
            );
            teams.push(team);
          }
        });
      }
    } catch (e) {
      console.error('Error parsing initial JSON data:', e);
    }
  }
  updateTables();
};
