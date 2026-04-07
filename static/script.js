class CGPACalculatorBase {
  constructor(containerId, unitName, gradeName) {
    this.container = document.getElementById(containerId);
    this.unitName = unitName;
    this.gradeName = gradeName;
    this.resetCourses();
  }

  resetCourses() {
    this.container.innerHTML = '';
    for (let i = 0; i < 4; i++) this.addCourseRow();
  }

  addCourseRow() {
    const row = document.createElement('div');
    row.className = 'form-row';
    row.innerHTML = `
      <label>Course code</label>
      <input name="course_code" type="text">

      <label>Course unit</label>
      <input name="${this.unitName}" type="number" min="0" required>

      <label>Grade</label>
      <select name="${this.gradeName}" required>
        ${this.getGradeOptions()}
      </select>
    `;
    this.container.appendChild(row);
  }

  getGradeOptions() { return ''; }

  validateCourses() {
    const units = this.container.querySelectorAll(`input[name="${this.unitName}"]`);
    const grades = this.container.querySelectorAll(`select[name="${this.gradeName}"]`);
    for (let i = 0; i < units.length; i++) {
      if (!units[i].value || !grades[i].value) {
        alert(`Please fill all fields for course ${i+1}`);
        return false;
      }
    }
    return true;
  }
}

class UniversityCalculator extends CGPACalculatorBase {
  constructor() {
    super('coursesContainer', 'course_unit', 'grade');
  }

  getGradeOptions() {
    return `
      <option value="">--</option>
      <option value="5">A</option><option value="4">B</option>
      <option value="3">C</option><option value="2">D</option>
      <option value="1">E</option><option value="0">F</option>
    `;
  }
}

class PolytechnicCalculator extends CGPACalculatorBase {
  constructor() {
    super('coursesContainer', 'course_unit', 'grade');
  }

  getGradeOptions() {
    return `
      <option value="">--</option>
      <option value="4">A</option><option value="3.5">AB</option>
      <option value="3.25">B</option><option value="3">BC</option>
      <option value="2.75">C</option><option value="2.5">CD</option>
      <option value="2.25">D</option><option value="2">E</option>
      <option value="0">F</option>
    `;
  }
}

let activeCalc;

function setCalculator() {
  const isUni = document.getElementById('university').checked;
  activeCalc = isUni ? new UniversityCalculator() : new PolytechnicCalculator();
}

function addCourseRow() {
  activeCalc.addCourseRow();
}

function resetForm() {
  activeCalc.resetCourses();
  document.getElementById('cgpaResult').value = '';
  document.getElementById('resultBox').style.display = 'none';
}



function handleSaveChoice(choice) {
  document.getElementById('savePrompt').style.display = 'none';
  if (choice === 'yes') document.getElementById('namePrompt').style.display = 'block';
  else resetForm();
}

function displayHistory(historyArray) {
  const list = document.getElementById('historyList');
  const modal = document.getElementById('historyModal');
  list.innerHTML = '';

  if (!historyArray.length) {
    list.innerHTML = '<p>No matching records found.</p>';
    modal.style.display = 'block';
    return;
  }

  historyArray.forEach((record, index) => {
    const wrapper = document.createElement('div');
    wrapper.style.marginBottom = '15px';
    wrapper.innerHTML = `
      <pre style="white-space: pre-wrap; word-break: break-word;"><strong>${record.name}</strong> (${new Date(record.timestamp).toLocaleString()}):\n${record.result}</pre>
      <div style="display:flex; gap:10px; margin-bottom:10px;">
        <button onclick="editHistoryRecord(${index})">Update Result</button>
        <button onclick="deleteHistoryRecord(${index})">Clear Result</button>
      </div>
      <hr/>
    `;
    list.appendChild(wrapper);
  });

  modal.style.display = 'block';
}


function viewHistory() {
  const history = JSON.parse(localStorage.getItem('cgpaHistory') || '[]');
  displayHistory(history);
}


function deleteHistoryRecord(index) {
  const history = JSON.parse(localStorage.getItem('cgpaHistory') || '[]');
  history.splice(index, 1);
  localStorage.setItem('cgpaHistory', JSON.stringify(history));
  viewHistory(); // Refresh UI
}

function editHistoryRecord(index) {
  const history = JSON.parse(localStorage.getItem('cgpaHistory') || '[]');
  const record = history[index];
  if (!record) return alert("Record not found");

  // Set and trigger the correct radio input
  if (record.schooltype === '1') {
    const polyRadio = document.getElementById('polytechnic');
    polyRadio.checked = true;
    polyRadio.dispatchEvent(new Event('change')); // fire the change event
  } else {
    const uniRadio = document.getElementById('university');
    uniRadio.checked = true;
    uniRadio.dispatchEvent(new Event('change')); // fire the change event
  }

  // Delay to ensure activeCalc is set after change
  setTimeout(() => {
    activeCalc.container.innerHTML = '';
    record.courses.forEach(course => {
      activeCalc.addCourseRow();
      const rows = activeCalc.container.querySelectorAll('.form-row');
      const lastRow = rows[rows.length - 1];
      lastRow.querySelector('input[name="course_code"]').value = course.code;
      lastRow.querySelector(`input[name="${activeCalc.unitName}"]`).value = course.unit;
      lastRow.querySelector(`select[name="${activeCalc.gradeName}"]`).value = course.grade;
    });

    document.getElementById('historyModal').style.display = 'none';
    document.getElementById('resultBox').style.display = 'none';
    document.getElementById('cgpaResult').value = '';
  }, 50); // short delay to ensure calculator is updated
}



function handleSortChange() {
  const sort = document.getElementById('sortSelect').value;
  const search = document.getElementById('searchInput').value.trim().toLowerCase();
  const history = JSON.parse(localStorage.getItem('cgpaHistory') || '[]');

  let filtered = history.filter(entry => entry.name.toLowerCase().includes(search));

  if (sort === 'name') {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  } else {
    filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  displayHistory(filtered);
}

function clearHistory() {
  const confirmClear = confirm("⚠️ Are you sure you want to delete ALL saved CGPA records?\nThis action cannot be undone.");
  if (confirmClear) {
    localStorage.removeItem('cgpaHistory');
    displayHistory([]);
    alert("✅ All history has been cleared.");
  }
}


function closeHistory() {
  document.getElementById('historyModal').style.display = 'none';
}



function showSaveName() {
  const name = document.getElementById('saveName').value.trim();
  if (!name) return alert('Enter a name to save.');
  const resultText = document.getElementById('cgpaResult').value;
  const rows = activeCalc.container.querySelectorAll('.form-row');
  const courses = Array.from(rows).map(r => ({
    code: r.querySelector('input[name="course_code"]').value,
    unit: r.querySelector(`input[name="${activeCalc.unitName}"]`).value,
    grade: r.querySelector(`select[name="${activeCalc.gradeName}"]`).value
  }));
  const record = {
    name,
    result: resultText,
    timestamp: new Date().toISOString(),
    courses,
    schooltype: document.querySelector('input[name="schooltype"]:checked').value
  };

  const history = JSON.parse(localStorage.getItem('cgpaHistory') || '[]');
  const exists = history.findIndex(r => r.name.toLowerCase() === name.toLowerCase());
  if (exists > -1) history.splice(exists, 1);
  history.unshift(record);
  localStorage.setItem('cgpaHistory', JSON.stringify(history));
  document.getElementById('namePrompt').style.display = 'none';
  resetForm();
  document.getElementById('successPopup').style.display = 'block';
  setTimeout(() => document.getElementById('successPopup').style.display = 'none', 2000);
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('input[name="schooltype"]').forEach(radio => {
    radio.addEventListener('change', () => {
      setCalculator();
    });
  });

  document.getElementById('addBtn').addEventListener('click', addCourseRow);
  document.getElementById('resetBtn').addEventListener('click', resetForm);
  document.getElementById('yesBtn').addEventListener('click', () => handleSaveChoice('yes'));
  document.getElementById('noBtn').addEventListener('click', () => handleSaveChoice('no'));
  document.getElementById('saveNameBtn').addEventListener('click', showSaveName);

  setCalculator();

  document.getElementById('cgpaform').addEventListener('submit', async e => {
    e.preventDefault();
    if (!activeCalc.validateCourses()) return;

    const resp = await fetch('/calculate', {
      method: 'POST',
      body: new FormData(e.target)
    });
    const data = await resp.json();
    const box = document.getElementById('resultBox');
    const area = document.getElementById('cgpaResult');
    box.style.display = 'block';
    if (resp.ok) {
      area.value = `CGPA: ${data.cgpa}\n${data.message}\n\n"${data.message2}"`;
      area.style.borderColor = '#007bff';
      box.style.backgroundColor = '#e6f2ff';
      document.getElementById('savePrompt').style.display = 'block';
    } else {
      area.value = `Error: ${data.error}`;
      area.style.borderColor = '#dc3545';
      box.style.backgroundColor = '#f8d7da';
    }
  });
});
