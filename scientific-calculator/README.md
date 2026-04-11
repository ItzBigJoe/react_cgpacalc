# Scientific Calculator

A comprehensive scientific calculator built with React, TypeScript, and TailwindCSS that includes all standard and advanced mathematical functions.

## Features

### Core Functions
- **Basic Arithmetic**: Addition (+), Subtraction (-), Multiplication (×), Division (÷), Percentage (%)
- **Bracket Support**: Parentheses for order of operations
- **Memory Functions**: M+, M-, MR, MC

### Scientific Functions
- **Power & Root**: x^y, x², x³, sqrt, cube root, reciprocal (1/x)
- **Trigonometric**: sin, cos, tan, asin, acos, atan
- **Hyperbolic**: sinh, cosh, tanh
- **Logarithmic**: log (base 10), ln (natural log), e^x
- **Constants**: pi (3.14159...), e (Euler's number)
- **Algebra**: Factorial (n!), Absolute value (|x|)

### Advanced Features
- **Angle Modes**: Degree, Radian, Gradian conversions
- **Statistics**: Mean, Standard Deviation, Variance with data collection
- **Unit Conversions**: Temperature (°C/°F), Length (m/ft), Mass (kg/lb), Volume (L/gal)
- **Programming**: Binary, Octal, Hexadecimal conversions
- **Complex Numbers**: Support for complex number operations
- **Scientific Notation**: Automatic formatting for large/small numbers

### User Interface
- **Mode Toggle**: Switch between Basic and Scientific modes
- **History Panel**: Track recent calculations with timestamps
- **Responsive Design**: Works on desktop and mobile devices
- **Modern UI**: Dark theme with color-coded buttons

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd scientific-calculator
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Usage

### Basic Mode
- Use number buttons (0-9) for input
- Use operator buttons (+, -, ×, ÷) for calculations
- Press "=" to get results
- Use "C" to clear current entry, "AC" to clear all

### Scientific Mode
- Click the "Scientific" button to toggle advanced functions
- Access trigonometric, logarithmic, and other scientific functions
- Use bracket buttons for complex expressions
- Switch between angle modes (DEG/RAD/GRAD)

### Statistics
- Use "DATA+" to add values to statistics dataset
- Calculate MEAN, STD (standard deviation), VAR (variance)
- Use "CLR" to clear statistics data

### Unit Conversions
- Enter a value and click conversion buttons:
  - °C°F: Celsius to Fahrenheit
  - °F°C: Fahrenheit to Celsius
  - mft: Meters to Feet
  - kglb: Kilograms to Pounds
  - Lgal: Liters to Gallons

### Programming Functions
- Convert numbers between bases:
  - BIN: Decimal to Binary
  - OCT: Decimal to Octal
  - HEX: Decimal to Hexadecimal
  - BIN>/HEX>: Convert from Binary/Hexadecimal to Decimal

## Technical Details

### Technologies Used
- **React 18**: UI framework
- **TypeScript**: Type safety
- **TailwindCSS**: Styling
- **Vite**: Build tool

### Architecture
- Component-based design with React hooks
- Mathematical expression evaluation using JavaScript's Math functions
- State management for history, memory, and statistics
- Responsive grid layout for buttons

### Mathematical Functions
The calculator uses JavaScript's built-in Math functions with proper angle conversions and error handling. Complex expressions are evaluated using the Function constructor for safety.

## License

MIT License

## Contributing

Feel free to submit pull requests or open issues for bugs and feature requests.
