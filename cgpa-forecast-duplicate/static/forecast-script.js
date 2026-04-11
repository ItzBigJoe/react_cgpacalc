// CGPA Forecast & Goals Module - Duplicate
// Standalone JavaScript for CGPA calculation and forecasting

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the forecast module
    initializeForecastModule();
});

function initializeForecastModule() {
    // Goals form event listener
    const goalsForm = document.getElementById('goalsForm');
    if (goalsForm) {
        goalsForm.addEventListener('submit', e => {
            e.preventDefault();
            calculateCgpaGoal();
        });
    }

    // School type selection
    const schoolTypeRadios = document.querySelectorAll('input[name="schoolType"]');
    schoolTypeRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            updateSchoolTypeDisplay();
        });
    });

    // Initialize display
    updateSchoolTypeDisplay();
}

function updateSchoolTypeDisplay() {
    const selectedType = document.querySelector('input[name="schoolType"]:checked')?.value || '0';
    const display = selectedType === '1' ? 'Polytechnic (4.0 Scale)' : 'University (5.0 Scale)';
    
    // Update any display elements if needed
    const schoolTypeDisplay = document.getElementById('schoolTypeDisplay');
    if (schoolTypeDisplay) {
        schoolTypeDisplay.textContent = display;
    }
}

function getSchoolType() {
    const selectedType = document.querySelector('input[name="schoolType"]:checked')?.value;
    return selectedType || '0'; // Default to university
}

function calculateCgpaGoal() {
    // Step 1: Collect user input
    const currentCgpa = parseFloat(document.getElementById('currentCgpa').value);
    const completedUnits = parseInt(document.getElementById('completedUnits').value);
    const targetCgpa = parseFloat(document.getElementById('targetCgpa').value);
    const remainingUnits = parseInt(document.getElementById('remainingUnits').value);

    // Step 2: Input validation
    if (!currentCgpa || !completedUnits || !targetCgpa || !remainingUnits) {
        alert('Please fill all fields.');
        return;
    }

    if (currentCgpa < 0 || currentCgpa > 5 || targetCgpa < 0 || targetCgpa > 5) {
        alert('CGPA values must be between 0 and 5.');
        return;
    }

    if (completedUnits < 0 || remainingUnits < 0) {
        alert('Unit values must be positive numbers.');
        return;
    }

    // Step 3: Get school type
    const schoolType = getSchoolType();
  
    // Step 4: Proceed with calculation
    calculateCgpaGoalWithSchoolType(schoolType, currentCgpa, completedUnits, targetCgpa, remainingUnits);
}

function calculateCgpaGoalWithSchoolType(schoolType, currentCgpa, completedUnits, targetCgpa, remainingUnits) {
    // Determine grading system from stored school type
    const isPolytechnic = schoolType === '1';
    const maxGpa = isPolytechnic ? 4.0 : 5.0;

    // Step 5: Calculate current total points
    const currentTotalPoints = currentCgpa * completedUnits;

    // Step 6: Calculate required points for target
    const targetTotalPoints = targetCgpa * (completedUnits + remainingUnits);
    const pointsNeeded = targetTotalPoints - currentTotalPoints;

    // Step 7: Calculate required GPA for remaining courses
    const requiredGpaRemaining = remainingUnits > 0 ? pointsNeeded / remainingUnits : 0;

    // Step 8: Check feasibility and display results
    const result = document.getElementById('forecastResult');
    let output = '<div style="background: #f0f8ff; padding: 1rem; border-radius: 8px; margin-top: 1rem;">';

    // Display calculations summary
    output += `<h3>CGPA Forecast Results</h3>`;
    output += `<p><strong>Current CGPA:</strong> ${currentCgpa.toFixed(2)} (${completedUnits} units)</p>`;
    output += `<p><strong>Target CGPA:</strong> ${targetCgpa.toFixed(2)} (${completedUnits + remainingUnits} total units)</p>`;
    output += `<p><strong>Points Needed:</strong> ${pointsNeeded.toFixed(2)}</p>`;

    if (requiredGpaRemaining < 0) {
        // Case 2: Goal already achieved
        output += `<h4 style="color: #28a745;">Goal Already Achieved!</h4>`;
        output += `<p>Your current CGPA (${currentCgpa}) already meets or exceeds your target (${targetCgpa}).</p>`;
    } else if (requiredGpaRemaining > maxGpa) {
        // Case 1: Goal not achievable
        output += `<h4 style="color: #dc3545;">Goal Not Achievable</h4>`;
        output += `<p>To reach CGPA ${targetCgpa}, you would need an average of ${requiredGpaRemaining.toFixed(2)} in remaining courses.</p>`;
        output += `<p>However, the maximum possible GPA is ${maxGpa}. This goal is not achievable.</p>`;
        output += `<p><strong>Suggestion:</strong> Set a lower target CGPA (e.g., ${(currentCgpa + 0.5).toFixed(2)}) or review your goal.</p>`;
    } else {
        // Case 3: Goal is achievable
        output += `<h4 style="color: #0056b3;">Goal is Achievable!</h4>`;
        output += `<p><strong>Required average GPA for remaining courses: ${requiredGpaRemaining.toFixed(3)}</strong></p>`;
        
        // Add grade suggestions based on grading system
        const gradeSuggestion = getGradeSuggestion(requiredGpaRemaining, isPolytechnic);
        output += `<p>${gradeSuggestion}</p>`;

        // Add difficulty assessment
        const difficulty = getDifficultyAssessment(requiredGpaRemaining, maxGpa);
        output += `<p><strong>Difficulty:</strong> ${difficulty}</p>`;
    }

    output += '</div>';
    result.innerHTML = output;
}

function getGradeSuggestion(requiredGpa, isPolytechnic) {
    if (isPolytechnic) {
        // Polytechnic scale: A=4, B=3, C=2, D=1, F=0
        if (requiredGpa >= 3.75) {
            return 'Mostly A grades - Aim for A in most courses with occasional B.';
        } else if (requiredGpa >= 3.5) {
            return 'A and B mix - Balance of A and B grades will help you reach your goal.';
        } else if (requiredGpa >= 3.25) {
            return 'B and C average - Maintain grades between B (3.0) and C (2.0).';
        } else if (requiredGpa >= 3.0) {
            return 'B average - Consistent B grades will achieve your goal.';
        } else if (requiredGpa >= 2.5) {
            return 'B and C mix - More B grades than C, with some flexibility.';
        } else if (requiredGpa >= 2.0) {
            return 'C or better - Even C grades will work if you are consistent.';
        } else {
            return 'Any passing grade - Your goal is very achievable.';
        }
    } else {
        // University scale: A=5, B=4, C=3, D=2, E=1, F=0
        if (requiredGpa >= 4.75) {
            return 'Nearly all A grades - Aim for A in almost every course.';
        } else if (requiredGpa >= 4.5) {
            return 'Mostly A grades - A grades in most courses with occasional B.';
        } else if (requiredGpa >= 4.0) {
            return 'A and B mix - Balance of A and B grades.';
        } else if (requiredGpa >= 3.5) {
            return 'B average with some A - Consistent B grades with some A grades.';
        } else if (requiredGpa >= 3.0) {
            return 'B and C average - Mix of B and C grades will work.';
        } else if (requiredGpa >= 2.5) {
            return 'C and D grades - Even with D grades (2.0), you can reach your goal.';
        } else if (requiredGpa >= 2.0) {
            return 'D or better - Your goal is very achievable.';
        } else {
            return 'Any passing grade - Your goal is easily achievable.';
        }
    }
}

function getDifficultyAssessment(requiredGpa, maxGpa) {
    const percentage = (requiredGpa / maxGpa) * 100;
    
    if (percentage >= 95) {
        return 'Extremely Difficult - Requires near-perfect performance';
    } else if (percentage >= 85) {
        return 'Very Difficult - Requires excellent grades consistently';
    } else if (percentage >= 75) {
        return 'Moderate - You need good grades. Steady effort should suffice';
    } else if (percentage >= 60) {
        return 'Manageable - This is an achievable goal with normal effort';
    } else {
        return 'Easy - You have room for grades below average and still reach your goal';
    }
}

// Utility functions for the forecast module
function resetForecastForm() {
    const form = document.getElementById('goalsForm');
    if (form) {
        form.reset();
    }
    const result = document.getElementById('forecastResult');
    if (result) {
        result.innerHTML = '';
    }
}

function exportForecastResults() {
    const result = document.getElementById('forecastResult');
    if (result && result.innerHTML) {
        // Create a temporary element for export
        const exportData = {
            timestamp: new Date().toISOString(),
            results: result.innerHTML,
            schoolType: getSchoolType()
        };
        
        // Convert to JSON and download
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `cgpa-forecast-${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    } else {
        alert('No forecast results to export. Please calculate your goals first.');
    }
}

// Add keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + Enter to submit form
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        const form = document.getElementById('goalsForm');
        if (form) {
            form.dispatchEvent(new Event('submit'));
        }
    }
    
    // Escape to reset form
    if (e.key === 'Escape') {
        resetForecastForm();
    }
});

console.log('CGPA Forecast Module loaded successfully');
