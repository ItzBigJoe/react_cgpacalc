import { useState } from 'react';

interface HistoryItem {
  expression: string;
  result: string;
  timestamp: Date;
}

export default function App() {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [currentInput, setCurrentInput] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [memory, setMemory] = useState(0);
  const [angleMode, setAngleMode] = useState<'DEG' | 'RAD' | 'GRAD'>('DEG');
  const [isScientificMode, setIsScientificMode] = useState(false);
  const [statisticsData, setStatisticsData] = useState<number[]>([]);
  const [justCalculated, setJustCalculated] = useState(false);

  const handleNumber = (num: string) => {
    // If we just calculated and user enters a new number, start fresh
    if (justCalculated) {
      setCurrentInput(num === '.' ? '0.' : num);
      setDisplay(num === '.' ? '0.' : num);
      setJustCalculated(false);
      return;
    }
    
    if (currentInput === '0' && num !== '.') {
      setCurrentInput(num);
    } else if (num === '.' && !currentInput.includes('.')) {
      setCurrentInput(currentInput + num);
    } else if (num !== '.') {
      setCurrentInput(currentInput + num);
    }
    setDisplay(currentInput === '0' && num !== '.' ? num : currentInput + num);
  };

  const handleBracket = (bracket: string) => {
    if (bracket === '(') {
      setExpression(expression + currentInput + bracket);
      setCurrentInput('');
      setDisplay('0');
    } else if (bracket === ')') {
      setExpression(expression + currentInput + bracket);
      setCurrentInput('');
      setDisplay('0');
    }
  };

  const handleOperator = (op: string) => {
    setExpression(expression + currentInput + ' ' + op + ' ');
    setCurrentInput('');
    setDisplay('0');
    setJustCalculated(false);
  };

  const handleClear = () => {
    setDisplay('0');
    setExpression('');
    setCurrentInput('');
    setJustCalculated(false);
  };

  const handleClearAll = () => {
    handleClear();
    setHistory([]);
    setMemory(0);
  };

  const handleEquals = () => {
    try {
      const fullExpression = expression + currentInput;
      const result = evaluateExpression(fullExpression);
      
      const historyItem: HistoryItem = {
        expression: fullExpression,
        result: result.toString(),
        timestamp: new Date()
      };
      
      setHistory([historyItem, ...history.slice(0, 9)]);
      setDisplay(result.toString());
      setExpression('');
      setCurrentInput('');
      setJustCalculated(true);
    } catch (error) {
      setDisplay('Error');
      setExpression('');
      setCurrentInput('');
      setJustCalculated(false);
    }
  };

  const evaluateExpression = (expr: string): number => {
    try {
      // Replace mathematical symbols and functions
      let processedExpr = expr
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/mod/g, '%')
        .replace(/\^/g, '**')
        .replace(/sin/g, 'Math.sin')
        .replace(/cos/g, 'Math.cos')
        .replace(/tan/g, 'Math.tan')
        .replace(/asin/g, 'Math.asin')
        .replace(/acos/g, 'Math.acos')
        .replace(/atan/g, 'Math.atan')
        .replace(/sinh/g, 'Math.sinh')
        .replace(/cosh/g, 'Math.cosh')
        .replace(/tanh/g, 'Math.tanh')
        .replace(/log/g, 'Math.log10')
        .replace(/ln/g, 'Math.log')
        .replace(/sqrt/g, 'Math.sqrt')
        .replace(/cbrt/g, 'Math.cbrt')
        .replace(/abs/g, 'Math.abs')
        .replace(/pi/gi, 'Math.PI')
        .replace(/e(?![x])/gi, 'Math.E')
        .replace(/e\^/gi, 'Math.exp');

      // Handle angle conversion for trig functions
      if (angleMode === 'DEG') {
        processedExpr = processedExpr.replace(/Math\.sin\(([^)]+)\)/g, (_match, angle) => {
          return `Math.sin(${angle} * Math.PI / 180)`;
        });
        processedExpr = processedExpr.replace(/Math\.cos\(([^)]+)\)/g, (_match, angle) => {
          return `Math.cos(${angle} * Math.PI / 180)`;
        });
        processedExpr = processedExpr.replace(/Math\.tan\(([^)]+)\)/g, (_match, angle) => {
          return `Math.tan(${angle} * Math.PI / 180)`;
        });
        processedExpr = processedExpr.replace(/Math\.asin\(([^)]+)\)/g, (_match, angle) => {
          return `Math.asin(${angle}) * 180 / Math.PI`;
        });
        processedExpr = processedExpr.replace(/Math\.acos\(([^)]+)\)/g, (_match, angle) => {
          return `Math.acos(${angle}) * 180 / Math.PI`;
        });
        processedExpr = processedExpr.replace(/Math\.atan\(([^)]+)\)/g, (_match, angle) => {
          return `Math.atan(${angle}) * 180 / Math.PI`;
        });
      }

      // Handle factorial
      processedExpr = processedExpr.replace(/(\d+)!/g, (_match, n) => {
        return factorial(parseInt(n)).toString();
      });

      // Use Function constructor for safer evaluation
      const result = new Function('return ' + processedExpr)();
      return typeof result === 'number' && !isNaN(result) ? result : 0;
    } catch (error) {
      throw new Error('Invalid expression');
    }
  };

  const handleMemory = (operation: string) => {
    const currentValue = parseFloat(display);
    switch (operation) {
      case 'MC':
        setMemory(0);
        break;
      case 'MR':
        setDisplay(memory.toString());
        break;
      case 'M+':
        setMemory(memory + currentValue);
        break;
      case 'M-':
        setMemory(memory - currentValue);
        break;
    }
  };

  const handleScientificFunction = (func: string) => {
    try {
      const currentValue = parseFloat(currentInput || display);
      let result = 0;
      
      switch (func) {
        case 'x²':
          result = currentValue * currentValue;
          break;
        case 'x³':
          result = currentValue * currentValue * currentValue;
          break;
        case 'x^y':
          setExpression(expression + currentInput + '^');
          setCurrentInput('');
          setDisplay('0');
          return;
        case 'sqrt':
          result = Math.sqrt(currentValue);
          break;
        case 'cbrt':
          result = Math.cbrt(currentValue);
          break;
        case '1/x':
          result = 1 / currentValue;
          break;
        case 'sin':
          setExpression(expression + currentInput + 'sin(');
          setCurrentInput('');
          setDisplay('0');
          return;
        case 'cos':
          setExpression(expression + currentInput + 'cos(');
          setCurrentInput('');
          setDisplay('0');
          return;
        case 'tan':
          setExpression(expression + currentInput + 'tan(');
          setCurrentInput('');
          setDisplay('0');
          return;
        case 'asin':
          result = angleMode === 'DEG' ? Math.asin(currentValue) * 180 / Math.PI : Math.asin(currentValue);
          break;
        case 'acos':
          result = angleMode === 'DEG' ? Math.acos(currentValue) * 180 / Math.PI : Math.acos(currentValue);
          break;
        case 'atan':
          result = angleMode === 'DEG' ? Math.atan(currentValue) * 180 / Math.PI : Math.atan(currentValue);
          break;
        case 'sinh':
          result = Math.sinh(currentValue);
          break;
        case 'cosh':
          result = Math.cosh(currentValue);
          break;
        case 'tanh':
          result = Math.tanh(currentValue);
          break;
        case 'log':
          result = Math.log10(currentValue);
          break;
        case 'ln':
          result = Math.log(currentValue);
          break;
        case 'e^x':
          result = Math.exp(currentValue);
          break;
        case 'n!':
          result = factorial(Math.floor(currentValue));
          break;
        case '|x|':
          result = Math.abs(currentValue);
          break;
        case 'pi':
          setExpression(expression + currentInput + Math.PI.toString());
          setCurrentInput('');
          setDisplay('0');
          return;
        case 'e':
          setExpression(expression + currentInput + Math.E.toString());
          setCurrentInput('');
          setDisplay('0');
          return;
        case 'nPr':
          // Permutations: nPr = n! / (n-r)!
          if (currentInput.includes('P')) {
            const parts = currentInput.split('P');
            const n = parseInt(parts[0]);
            const r = parseInt(parts[1]);
            result = factorial(n) / factorial(n - r);
          } else {
            setExpression(expression + currentInput + 'P');
            setCurrentInput('');
            setDisplay('0');
            return;
          }
          break;
        case 'nCr':
          // Combinations: nCr = n! / (r! * (n-r)!)
          if (currentInput.includes('C')) {
            const parts = currentInput.split('C');
            const n = parseInt(parts[0]);
            const r = parseInt(parts[1]);
            result = factorial(n) / (factorial(r) * factorial(n - r));
          } else {
            setExpression(expression + currentInput + 'C');
            setCurrentInput('');
            setDisplay('0');
            return;
          }
          break;
        case 'mod':
          setExpression(expression + currentInput + 'mod');
          setCurrentInput('');
          setDisplay('0');
          return;
        case '%':
          result = currentValue / 100;
          break;
      }
      
      setDisplay(result.toString());
    } catch (error) {
      setDisplay('Error');
    }
  };

  const factorial = (n: number): number => {
    if (n < 0) throw new Error('Factorial of negative number');
    if (n === 0 || n === 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) {
      result *= i;
    }
    return result;
  };

  
  const calculateMean = (data: number[]): number => {
    if (data.length === 0) return 0;
    return data.reduce((sum, val) => sum + val, 0) / data.length;
  };

  const calculateStandardDeviation = (data: number[]): number => {
    if (data.length === 0) return 0;
    const mean = calculateMean(data);
    const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
    return Math.sqrt(variance);
  };

  const calculateVariance = (data: number[]): number => {
    if (data.length === 0) return 0;
    const mean = calculateMean(data);
    return data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
  };

  const handleStatistics = (operation: string) => {
    const currentValue = parseFloat(display);
    let result = 0;
    
    switch (operation) {
      case 'ADD_DATA':
        setStatisticsData([...statisticsData, currentValue]);
        setDisplay(`${statisticsData.length + 1} values`);
        break;
      case 'CLEAR_DATA':
        setStatisticsData([]);
        setDisplay('0');
        break;
      case 'MEAN':
        result = calculateMean(statisticsData);
        setDisplay(result.toString());
        break;
      case 'STD_DEV':
        result = calculateStandardDeviation(statisticsData);
        setDisplay(result.toString());
        break;
      case 'VARIANCE':
        result = calculateVariance(statisticsData);
        setDisplay(result.toString());
        break;
    }
  };

  
  const handleProgramming = (operation: string) => {
    const currentValue = parseFloat(display);
    let result = '';
    
    switch (operation) {
      case 'TO_BIN':
        result = Math.floor(currentValue).toString(2);
        break;
      case 'TO_OCT':
        result = Math.floor(currentValue).toString(8);
        break;
      case 'TO_HEX':
        result = Math.floor(currentValue).toString(16).toUpperCase();
        break;
      case 'FROM_BIN':
        result = parseInt(display, 2).toString();
        break;
      case 'FROM_OCT':
        result = parseInt(display, 8).toString();
        break;
      case 'FROM_HEX':
        result = parseInt(display, 16).toString();
        break;
    }
    
    setDisplay(result);
  };

  const handleFraction = (operation: string) => {
    const currentValue = parseFloat(currentInput || display);
    
    switch (operation) {
      case 'TO_FRAC':
        // Convert decimal to fraction
        const fraction = decimalToFraction(currentValue);
        setExpression(expression + currentInput);
        setCurrentInput(fraction);
        setDisplay(fraction);
        break;
      case 'TO_DEC':
        // Convert fraction to decimal
        if (currentInput.includes('/')) {
          const parts = currentInput.split('/');
          const numerator = parseFloat(parts[0]);
          const denominator = parseFloat(parts[1]);
          const decimal = numerator / denominator;
          setExpression(expression + currentInput);
          setCurrentInput(decimal.toString());
          setDisplay(decimal.toString());
        }
        break;
      case 'SIMPLIFY':
        // Simplify fraction
        if (currentInput.includes('/')) {
          const parts = currentInput.split('/');
          const numerator = parseInt(parts[0]);
          const denominator = parseInt(parts[1]);
          const gcdValue = gcd(Math.abs(numerator), Math.abs(denominator));
          const simplifiedNum = numerator / gcdValue;
          const simplifiedDen = denominator / gcdValue;
          const simplified = `${simplifiedNum}/${simplifiedDen}`;
          setExpression(expression + currentInput);
          setCurrentInput(simplified);
          setDisplay(simplified);
        }
        break;
    }
  };

  const decimalToFraction = (decimal: number): string => {
    if (decimal === 0) return '0';
    
    const maxDenominator = 1000;
    let bestNumerator = 1;
    let bestDenominator = 1;
    let minError = Math.abs(decimal - bestNumerator / bestDenominator);
    
    for (let denominator = 1; denominator <= maxDenominator; denominator++) {
      const numerator = Math.round(decimal * denominator);
      const error = Math.abs(decimal - numerator / denominator);
      
      if (error < minError) {
        minError = error;
        bestNumerator = numerator;
        bestDenominator = denominator;
      }
      
      if (error < 0.0001) break;
    }
    
    return `${bestNumerator}/${bestDenominator}`;
  };

  const gcd = (a: number, b: number): number => {
    return b === 0 ? a : gcd(b, a % b);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="casio-calculator">
        {/* Casio Header */}
        <div className="casio-header">
          <div className="flex justify-between items-center">
            <span>NATURAL-V.P.A.M.</span>
            <span className="casio-mode-indicator">{angleMode}</span>
          </div>
        </div>

        <div className="p-4">
          {/* Display */}
          <div className="calculator-display">
            <div className="expression">{expression + currentInput || '\u00A0'}</div>
            <div className="result">{display}</div>
          </div>

          {/* Mode Indicators */}
          <div className="flex justify-between mb-3 text-xs text-gray-600">
            <div className="flex gap-3">
              {memory !== 0 && <span>M</span>}
              {isScientificMode && <span>SCI</span>}
            </div>
            <div className="flex gap-3">
              <span>{angleMode}</span>
              <span>COMP</span>
            </div>
          </div>

          {/* Button Grid - Casio Style Layout */}
          <div className="space-y-2">
            {/* Row 1: Shift, Clear, and top functions */}
            <div className="grid grid-cols-5 gap-2">
              <button onClick={() => setIsScientificMode(!isScientificMode)} className="calculator-button shift">SHIFT</button>
              <button onClick={handleClear} className="calculator-button clear">C</button>
              <button onClick={() => handleBracket('(')} className="calculator-button function">(</button>
              <button onClick={() => handleBracket(')')} className="calculator-button function">)</button>
              <button onClick={handleClearAll} className="calculator-button clear">AC</button>
            </div>

            {/* Row 2: Trigonometric functions */}
            <div className="grid grid-cols-5 gap-2">
              <button onClick={() => handleScientificFunction('sin')} className="calculator-button function">sin</button>
              <button onClick={() => handleScientificFunction('cos')} className="calculator-button function">cos</button>
              <button onClick={() => handleScientificFunction('tan')} className="calculator-button function">tan</button>
              <button onClick={() => handleScientificFunction('log')} className="calculator-button function">log</button>
              <button onClick={() => handleScientificFunction('ln')} className="calculator-button function">ln</button>
            </div>

            {/* Row 3: Numbers and operators */}
            <div className="grid grid-cols-5 gap-2">
              <button onClick={() => handleNumber('7')} className="calculator-button">7</button>
              <button onClick={() => handleNumber('8')} className="calculator-button">8</button>
              <button onClick={() => handleNumber('9')} className="calculator-button">9</button>
              <button onClick={() => handleOperator('÷')} className="calculator-button operator">÷</button>
              <button onClick={() => handleScientificFunction('x²')} className="calculator-button function">x²</button>
            </div>

            {/* Row 4 */}
            <div className="grid grid-cols-5 gap-2">
              <button onClick={() => handleNumber('4')} className="calculator-button">4</button>
              <button onClick={() => handleNumber('5')} className="calculator-button">5</button>
              <button onClick={() => handleNumber('6')} className="calculator-button">6</button>
              <button onClick={() => handleOperator('×')} className="calculator-button operator">×</button>
              <button onClick={() => handleScientificFunction('x³')} className="calculator-button function">x³</button>
            </div>

            {/* Row 5 */}
            <div className="grid grid-cols-5 gap-2">
              <button onClick={() => handleNumber('1')} className="calculator-button">1</button>
              <button onClick={() => handleNumber('2')} className="calculator-button">2</button>
              <button onClick={() => handleNumber('3')} className="calculator-button">3</button>
              <button onClick={() => handleOperator('-')} className="calculator-button operator">-</button>
              <button onClick={() => handleScientificFunction('sqrt')} className="calculator-button function">sqrt</button>
            </div>

            {/* Row 6 */}
            <div className="grid grid-cols-5 gap-2">
              <button onClick={() => handleNumber('0')} className="calculator-button">0</button>
              <button onClick={() => handleNumber('.')} className="calculator-button">.</button>
              <button onClick={() => handleScientificFunction('%')} className="calculator-button function">%</button>
              <button onClick={handleEquals} className="calculator-button equals">=</button>
              <button onClick={() => handleScientificFunction('1/x')} className="calculator-button function">1/x</button>
            </div>

            {/* Row 7: Memory functions */}
            <div className="grid grid-cols-5 gap-2">
              <button onClick={() => handleMemory('MC')} className="calculator-button">MC</button>
              <button onClick={() => handleMemory('MR')} className="calculator-button">MR</button>
              <button onClick={() => handleMemory('M+')} className="calculator-button">M+</button>
              <button onClick={() => handleMemory('M-')} className="calculator-button">M-</button>
              <button onClick={() => handleScientificFunction('|x|')} className="calculator-button function">|x|</button>
            </div>

            {/* Row 8: Constants and advanced functions */}
            <div className="grid grid-cols-5 gap-2">
              <button onClick={() => handleScientificFunction('pi')} className="calculator-button function">pi</button>
              <button onClick={() => handleScientificFunction('e')} className="calculator-button function">e</button>
              <button onClick={() => handleScientificFunction('e^x')} className="calculator-button function">e^x</button>
              <button onClick={() => handleScientificFunction('n!')} className="calculator-button function">n!</button>
              <button onClick={() => handleScientificFunction('cbrt')} className="calculator-button function">³root</button>
            </div>

            {/* Row 9: Inverse trig functions */}
            <div className="grid grid-cols-5 gap-2">
              <button onClick={() => handleScientificFunction('asin')} className="calculator-button function">sin¹</button>
              <button onClick={() => handleScientificFunction('acos')} className="calculator-button function">cos¹</button>
              <button onClick={() => handleScientificFunction('atan')} className="calculator-button function">tan¹</button>
              <button onClick={() => handleScientificFunction('sinh')} className="calculator-button function">sinh</button>
              <button onClick={() => handleScientificFunction('cosh')} className="calculator-button function">cosh</button>
            </div>

            {/* Row 10: More functions */}
            <div className="grid grid-cols-5 gap-2">
              <button onClick={() => handleScientificFunction('tanh')} className="calculator-button function">tanh</button>
              <button onClick={() => handleScientificFunction('nPr')} className="calculator-button function">nPr</button>
              <button onClick={() => handleScientificFunction('nCr')} className="calculator-button function">nCr</button>
              <button onClick={() => handleScientificFunction('mod')} className="calculator-button function">mod</button>
              <button onClick={() => handleProgramming('TO_BIN')} className="calculator-button function">BIN</button>
            </div>

            {/* Row 11: Programming functions */}
            <div className="grid grid-cols-5 gap-2">
              <button onClick={() => handleProgramming('TO_OCT')} className="calculator-button function">OCT</button>
              <button onClick={() => handleProgramming('TO_HEX')} className="calculator-button function">HEX</button>
              <button onClick={() => handleFraction('TO_FRAC')} className="calculator-button function">Frac</button>
              <button onClick={() => handleFraction('TO_DEC')} className="calculator-button function">Dec</button>
              <button onClick={() => handleFraction('SIMPLIFY')} className="calculator-button function">Simp</button>
            </div>

            {/* Row 12: Statistics functions */}
            <div className="grid grid-cols-5 gap-2">
              <button onClick={() => handleStatistics('MEAN')} className="calculator-button function">MEAN</button>
              <button onClick={() => handleStatistics('STD_DEV')} className="calculator-button function">STD</button>
              <button onClick={() => handleStatistics('VARIANCE')} className="calculator-button function">VAR</button>
              <button onClick={() => handleStatistics('ADD_DATA')} className="calculator-button function">DATA+</button>
              <button onClick={() => handleStatistics('CLEAR_DATA')} className="calculator-button function">CLR</button>
            </div>

            {/* Row 13: Angle mode selector */}
            <div className="grid grid-cols-3 gap-2">
              <button 
                onClick={() => setAngleMode('DEG')} 
                className={`calculator-button ${angleMode === 'DEG' ? 'function' : ''}`}
              >
                DEG
              </button>
              <button 
                onClick={() => setAngleMode('RAD')} 
                className={`calculator-button ${angleMode === 'RAD' ? 'function' : ''}`}
              >
                RAD
              </button>
              <button 
                onClick={() => setAngleMode('GRAD')} 
                className={`calculator-button ${angleMode === 'GRAD' ? 'function' : ''}`}
              >
                GRAD
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
