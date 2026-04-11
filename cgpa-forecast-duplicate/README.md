# CGPA Forecast & Goals Module - Duplicate

This is a standalone duplicate of the CGPA forecast goal module extracted from the main Student Hub application.

## Files Structure

```
cgpa-forecast-duplicate/
|-- static/
|   |-- forecast-styles.css    # Complete CSS styles for the module
|   |-- forecast-script.js     # JavaScript functionality
|-- templates/
|   |-- forecast.html          # HTML template
|-- README.md                  # This documentation
```

## Features

### Core Functionality
- **CGPA Goal Calculation**: Calculate required grades to reach target CGPA
- **School Type Support**: University (5.0 scale) and Polytechnic (4.0 scale)
- **Real-time Validation**: Input validation and error handling
- **Comprehensive Results**: Detailed analysis with grade suggestions

### User Interface
- **Modern Design**: Clean, responsive interface with gradient backgrounds
- **Interactive Forms**: Smooth transitions and hover effects
- **Visual Feedback**: Success/error states with animations
- **Mobile Responsive**: Works on all device sizes

### Advanced Features
- **Difficulty Assessment**: Rates goal difficulty (Easy to Extremely Difficult)
- **Grade Suggestions**: Specific recommendations based on required GPA
- **Export Functionality**: Save results to JSON file
- **Keyboard Shortcuts**: Ctrl+Enter to submit, Escape to reset

## Usage

### Standalone Usage
1. Open `templates/forecast.html` in a web browser
2. Fill in your current CGPA and completed units
3. Set your target CGPA and remaining units
4. Select your school type (University/Polytechnic)
5. Click "Calculate Required Grades"

### Integration
To integrate this module into another application:

1. **Include CSS**: Link to `static/forecast-styles.css`
2. **Include JavaScript**: Link to `static/forecast-script.js`
3. **Add HTML Structure**: Use the HTML from `templates/forecast.html`

## API Reference

### JavaScript Functions

#### `calculateCgpaGoal()`
Main function to calculate CGPA goals based on form inputs.

#### `calculateCgpaGoalWithSchoolType(schoolType, currentCgpa, completedUnits, targetCgpa, remainingUnits)`
Core calculation logic with school type consideration.

#### `getGradeSuggestion(requiredGpa, isPolytechnic)`
Returns grade recommendations based on required GPA.

#### `getDifficultyAssessment(requiredGpa, maxGpa)`
Assesses goal difficulty on a scale from Easy to Extremely Difficult.

#### `resetForecastForm()`
Clears all form inputs and results.

#### `exportForecastResults()`
Exports current results to a JSON file.

### CSS Classes

#### `.forecast-container`
Main container wrapper.

#### `.forecast-card`
Individual card components with hover effects.

#### `.planner-form`
Form styling with focus states and transitions.

#### `.school-option`
Radio button styling for school type selection.

## Customization

### Colors
Primary color: `#0056b3` (blue)
Gradient: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`

### Responsive Breakpoints
- Mobile: `max-width: 480px`
- Tablet: `max-width: 768px`

### Animations
- Success pulse: `successPulse` keyframe
- Error shake: `errorShake` keyframe
- Loading spinner: `spin` keyframe

## Dependencies

This module has no external dependencies and uses:
- Vanilla JavaScript (ES6+)
- Modern CSS (Flexbox, Grid, Animations)
- HTML5 semantic elements

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Notes

- This is a complete duplicate of the original CGPA forecast functionality
- All file paths are relative to the module directory
- The module can be used standalone or integrated into larger applications
- No external libraries or frameworks required
