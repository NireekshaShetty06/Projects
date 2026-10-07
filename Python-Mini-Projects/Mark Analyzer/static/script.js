// Helper to set preset values
function applyPreset(name, marks) {
  document.getElementById('studentName').value = name;
  document.getElementById('marksInput').value = marks;
  handleAnalyze();
}

// Function to calculate in JS if opened directly as file:// (Offline Fallback)
function calculateOffline(name, marksStr) {
  const raw = marksStr.replace(/,/g, ' ').trim().split(/\s+/);
  if (!raw.length || raw[0] === '') throw new Error("Please enter marks for at least one subject.");
  
  const marks = [];
  for (let item of raw) {
    const val = Number(item);
    if (isNaN(val)) throw new Error(`"${item}" is not a valid number.`);
    marks.push(val);
  }

  let total_marks = 0;
  let highest_mark = marks[0];
  let lowest_mark = marks[0];
  let passed_subjects = 0;

  const subject_details = [];
  for (let i = 0; i < marks.length; i++) {
    const mark = marks[i];
    total_marks += mark;
    if (mark > highest_mark) highest_mark = mark;
    if (mark < lowest_mark) lowest_mark = mark;
    const is_passed = mark >= 40;
    if (is_passed) passed_subjects++;

    subject_details.append ? null : subject_details.push({
      subject: `Subject ${i + 1}`,
      mark: mark,
      passed: is_passed
    });
  }

  const average_marks = Number((total_marks / marks.length).toFixed(2));
  let grade = "Pass Class (C)";
  let badge_color = "amber";

  if (average_marks >= 90) { grade = "Outstanding (A+)"; badge_color = "emerald"; }
  else if (average_marks >= 75) { grade = "Distinction (A)"; badge_color = "blue"; }
  else if (average_marks >= 60) { grade = "First Class (B)"; badge_color = "purple"; }
  else if (average_marks < 40) { grade = "Needs Improvement (F)"; badge_color = "rose"; }

  return {
    student_name: name.trim() || "Student",
    marks: marks,
    total_marks: total_marks,
    average_marks: average_marks,
    highest_mark: highest_mark,
    lowest_mark: lowest_mark,
    passed_subjects: passed_subjects,
    total_subjects: marks.length,
    grade: grade,
    badge_color: badge_color,
    subject_details: subject_details
  };
}

// Main handler for analyzing marks
async function handleAnalyze() {
  const errorBanner = document.getElementById('errorBanner');
  const resultsCard = document.getElementById('resultsCard');
  const name = document.getElementById('studentName').value.trim();
  const marks = document.getElementById('marksInput').value.trim();

  // Clear previous error
  errorBanner.style.display = 'none';
  errorBanner.textContent = '';

  if (!marks) {
    showError("Please enter marks for your subjects.");
    return;
  }

  try {
    let result;

    // Check if running on Flask server or standalone local file
    if (window.location.protocol.startsWith('http')) {
      // Connect to Python Flask backend
      const response = await fetch('/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name, marks: marks })
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to analyze marks.");
      }
      result = data.result;
    } else {
      // Offline fallback
      result = calculateOffline(name, marks);
    }

    renderResults(result);
  } catch (err) {
    showError(err.message);
  }
}

function showError(message) {
  const errorBanner = document.getElementById('errorBanner');
  errorBanner.textContent = message;
  errorBanner.style.display = 'block';
  document.getElementById('resultsCard').classList.remove('active');
}

function renderResults(res) {
  // Update header meta
  document.getElementById('resStudentName').textContent = `Student: ${res.student_name}`;
  document.getElementById('resMarksList').textContent = `Marks: [${res.marks.join(', ')}]`;

  // Update grade badge
  const badge = document.getElementById('resGradeBadge');
  badge.className = `grade-pill grade-${res.badge_color}`;
  badge.textContent = res.grade;

  // Update stats grid
  document.getElementById('resTotal').textContent = res.total_marks;
  document.getElementById('resAverage').textContent = res.average_marks;
  document.getElementById('resHighest').textContent = res.highest_mark;
  document.getElementById('resLowest').textContent = res.lowest_mark;
  document.getElementById('resPassed').textContent = `${res.passed_subjects} / ${res.total_subjects}`;

  // Render subject breakdown bars
  const container = document.getElementById('subjectBarsContainer');
  container.innerHTML = '';

  res.subject_details.forEach(item => {
    const row = document.createElement('div');
    row.className = 'subject-row';

    const percentage = Math.min(Math.max(item.mark, 0), 100);
    const passClass = item.passed ? 'status-passed' : 'status-failed';
    const fillClass = item.passed ? 'fill-pass' : 'fill-fail';
    const statusText = item.passed ? 'Passed (≥40)' : 'Failed (<40)';

    row.innerHTML = `
      <div class="subject-info">
        <span><strong>${item.subject}:</strong> ${item.mark} marks</span>
        <span class="subject-status ${passClass}">${statusText}</span>
      </div>
      <div class="bar-track">
        <div class="bar-fill ${fillClass}" style="width: 0%;"></div>
      </div>
    `;

    container.appendChild(row);

    // Animate bar width smoothly
    setTimeout(() => {
      row.querySelector('.bar-fill').style.width = `${percentage}%`;
    }, 50);
  });

  // Reveal results card
  resultsCard.classList.add('active');
  resultsCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Automatically analyze the initial default values on page load
window.addEventListener('DOMContentLoaded', () => {
  handleAnalyze();
});
