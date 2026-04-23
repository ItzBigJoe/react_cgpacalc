import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
  AppState,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');
const scale = width / 375; // Based on standard iPhone 6/7/8 width

function normalize(size) {
  const newSize = size * scale;
  if (Platform.OS === 'ios') {
    return Math.round(newSize);
  } else {
    return Math.round(newSize) - 2;
  }
}
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});


const UNIVERSITY_GRADES = [
  { label: 'A', value: '5' },
  { label: 'B', value: '4' },
  { label: 'C', value: '3' },
  { label: 'D', value: '2' },
  { label: 'E', value: '1' },
  { label: 'F', value: '0' },
];

const POLY_GRADES = [
  { label: 'A', value: '4' },
  { label: 'AB', value: '3.5' },
  { label: 'B', value: '3.25' },
  { label: 'BC', value: '3' },
  { label: 'C', value: '2.75' },
  { label: 'CD', value: '2.5' },
  { label: 'D', value: '2.25' },
  { label: 'E', value: '2' },
  { label: 'F', value: '0' },
];

const INITIAL_COURSES = Array.from({ length: 4 }, () => ({
  code: '',
  unit: '',
  grade: '',
}));

const STORAGE_KEY = '@cgpa_history';

function classifyCgpa(cgpa, schoolCategory) {
  if (schoolCategory === 'polytechnic') {
    if (cgpa >= 3.5) return 'You are on Distinction';
    if (cgpa >= 3.0) return "You're currently on Upper Credit";
    if (cgpa >= 2.5) return "You're currently on Lower Credit";
    if (cgpa >= 2.0) return "You're currently on Pass";
    return 'Fail';
  }

  if (cgpa >= 4.5) return 'You are on First Class';
  if (cgpa >= 3.5) return 'You are on Second Class Upper';
  if (cgpa >= 2.5) return 'You are on Second Class Lower';
  if (cgpa >= 2.0) return 'You are on Third Class';
  if (cgpa >= 1.0) return 'You are on Pass';
  return 'Fail';
}

async function fetchMotivationalQuote() {
  try {
    const response = await fetch('https://zenquotes.io/api/random');
    if (!response.ok) throw new Error('Quote service unavailable');
    const data = await response.json();
    return `${data[0].q} — ${data[0].a}`;
  } catch (error) {
    return 'Your best is yet to come. Keep moving!';
  }
}

const Stack = createNativeStackNavigator();

function MainHomeScreen({ navigation }) {
  const menuItems = [
    {
      title: 'Calculate CGPA',
      subtitle: 'Compute your semester/session results',
      icon: '📊',
      screen: 'Calculator',
      color: '#0056b3',
    },
    {
      title: 'CGPA Targets',
      subtitle: 'Set and track your academic goals',
      icon: '🎯',
      screen: 'Targets',
      color: '#28a745',
    },
    {
      title: 'Math Calculator',
      subtitle: 'Simple & Scientific calculations',
      icon: '🔢',
      screen: 'MathCalculator',
      color: '#6f42c1',
    },
    {
      title: 'Reminder Alarm',
      subtitle: 'Set and track your academic schedule',
      icon: '⏰',
      screen: 'Reminders',
      color: '#fd7e14',
    },
    {
      title: 'To-Do List',
      subtitle: "Don't wish it, Do it",
      icon: '📝',
      screen: 'TodoList',
      color: '#e83e8c',
    },
  ];

  const handlePress = (item) => {
    if (item.screen) {
      navigation.navigate(item.screen);
    } else {
      Alert.alert('Coming Soon', `${item.title} feature is currently under development.`);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.menuHeader}>
          <Text style={styles.menuTitle}>Welcome to</Text>
          <Text style={styles.menuTitleLarge}>Scholar<Text style={{color: '#0056b3'}}>Suite</Text></Text>
        </View>

        <View style={styles.menuGrid}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.menuCard, { borderLeftColor: item.color }]}
              onPress={() => handlePress(item)}
            >
              <View style={styles.menuCardContent}>
                <Text style={styles.menuIcon}>{item.icon}</Text>
                <View>
                  <Text style={styles.menuItemTitle}>{item.title}</Text>
                  <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function CalculatorScreen({ navigation, route }) {
  const [schoolCategory, setSchoolCategory] = useState('university');
  const [courses, setCourses] = useState(INITIAL_COURSES);

  useEffect(() => {
    if (route.params?.editRecord) {
      const { editRecord } = route.params;
      setSchoolCategory(editRecord.schooltype === '1' ? 'polytechnic' : 'university');
      setCourses(
        editRecord.courses.map(course => ({
          code: course.code ?? '',
          unit: String(course.unit),
          grade: String(course.grade),
        })),
      );
    }
  }, [route.params?.editRecord]);

  const gradeOptions = schoolCategory === 'polytechnic' ? POLY_GRADES : UNIVERSITY_GRADES;

  const validateCourses = () => {
    for (let i = 0; i < courses.length; i += 1) {
      const { unit, grade } = courses[i];
      if (!unit.trim() || !grade.trim()) {
        Alert.alert('Incomplete input', `Please fill all fields for course ${i + 1}.`);
        return false;
      }
    }
    return true;
  };

  const handleChangeCourse = (index, key, value) => {
    const updated = [...courses];
    updated[index] = { ...updated[index], [key]: value };
    setCourses(updated);
  };

  const handleAddCourse = () => {
    setCourses([...courses, { code: '', unit: '', grade: '' }]);
  };

  const handleReset = () => {
    setCourses(INITIAL_COURSES);
  };

  const handleCalculate = async () => {
    if (!validateCourses()) return;

    const units = courses.map(course => parseInt(course.unit, 10));
    const grades = courses.map(course => parseFloat(course.grade));

    const totalUnits = units.reduce((sum, value) => sum + (Number.isNaN(value) ? 0 : value), 0);
    const totalPoints = grades.reduce((sum, value, index) => sum + (Number.isNaN(value) ? 0 : value * units[index]), 0);
    const cgpa = totalUnits > 0 ? totalPoints / totalUnits : 0;

    const quote = await fetchMotivationalQuote();
    const message = classifyCgpa(cgpa, schoolCategory);

    navigation.navigate('Result', {
      cgpa: cgpa.toFixed(2),
      message,
      quote,
      courses,
      schoolCategory
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={60}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>
              <Text style={styles.titleAccent}>CGPA</Text> Calculator
            </Text>
            <TouchableOpacity style={styles.historyButton} onPress={() => navigation.navigate('History')}>
              <Text style={styles.historyButtonText}>History</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>School Category</Text>
            <View style={styles.radioGroup}>
              <TouchableOpacity
                style={[styles.radioOption, schoolCategory === 'university' && styles.radioOptionActive]}
                onPress={() => setSchoolCategory('university')}
              >
                <View style={styles.radioCircle}>
                  {schoolCategory === 'university' && <View style={styles.radioDot} />}
                </View>
                <Text style={styles.radioLabel}>University</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.radioOption, schoolCategory === 'polytechnic' && styles.radioOptionActive]}
                onPress={() => setSchoolCategory('polytechnic')}
              >
                <View style={styles.radioCircle}>
                  {schoolCategory === 'polytechnic' && <View style={styles.radioDot} />}
                </View>
                <Text style={styles.radioLabel}>Polytechnic</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.card}>
            {courses.map((course, index) => (
              <View key={index} style={styles.courseRow}>
                <Text style={styles.courseLabel}>Course {index + 1}</Text>
                <TextInput
                  style={styles.input}
                  value={course.code}
                  placeholder="Course code"
                  placeholderTextColor="#777"
                  onChangeText={text => handleChangeCourse(index, 'code', text)}
                />
                <TextInput
                  style={styles.input}
                  value={course.unit}
                  placeholder="Course unit"
                  placeholderTextColor="#777"
                  keyboardType="numeric"
                  onChangeText={text => handleChangeCourse(index, 'unit', text.replace(/[^0-9]/g, ''))}
                />
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={course.grade}
                    onValueChange={value => handleChangeCourse(index, 'grade', String(value))}
                    style={styles.picker}
                    itemStyle={styles.pickerItem}
                  >
                    <Picker.Item label="Select grade" value="" />
                    {gradeOptions.map(option => (
                      <Picker.Item key={option.value} label={`${option.label} (${option.value})`} value={option.value} />
                    ))}
                  </Picker>
                </View>
              </View>
            ))}

            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.actionButton} onPress={handleAddCourse}>
                <Text style={styles.buttonText}>Add</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={handleCalculate}>
                <Text style={styles.buttonText}>Calculate</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.bottomRow}>
            <TouchableOpacity style={[styles.actionButton, styles.resetButton]} onPress={handleReset}>
              <Text style={styles.buttonText}>Reset</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function ResultScreen({ route, navigation }) {
  const { cgpa, message, quote, courses, schoolCategory } = route.params;
  const [showSavePrompt, setShowSavePrompt] = useState(true);
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [saveName, setSaveName] = useState('');

  const formattedResult = `CGPA: ${cgpa}\n${message}\n\n"${quote}"`;

  const saveHistoryRecord = async () => {
    if (!saveName.trim()) {
      Alert.alert('Missing name', 'Enter a name to save the record.');
      return;
    }

    const record = {
      name: saveName.trim(),
      result: formattedResult,
      timestamp: new Date().toISOString(),
      courses: courses.map(course => ({ ...course })),
      schooltype: schoolCategory === 'polytechnic' ? '1' : '0',
    };

    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      const existingHistory = stored ? JSON.parse(stored) : [];
      const sameNameIndex = existingHistory.findIndex(
        item => item.name.toLowerCase() === record.name.toLowerCase(),
      );

      if (sameNameIndex >= 0) {
        existingHistory.splice(sameNameIndex, 1);
      }

      const updatedHistory = [record, ...existingHistory];
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
      setShowNamePrompt(false);
      setSaveName('');
      Alert.alert('Saved', 'Record saved successfully.', [
        { text: 'OK', onPress: () => navigation.navigate('Home') }
      ]);
    } catch (error) {
      Alert.alert('Save failed', 'Unable to save your record.');
      console.warn(error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>Calculation Result</Text>
          <Text style={styles.resultText}>{formattedResult}</Text>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setShowNamePrompt(true)}
          >
            <Text style={styles.buttonText}>Save Result</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.modalButtonSecondary]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.buttonText}>Back</Text>
          </TouchableOpacity>
        </View>

        <Modal visible={showNamePrompt} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>Enter the name you wish to save your result with:</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter name here"
                placeholderTextColor="#777"
                value={saveName}
                onChangeText={setSaveName}
              />
              <View style={styles.modalButtonRow}>
                <TouchableOpacity style={styles.modalButton} onPress={saveHistoryRecord}>
                  <Text style={styles.modalButtonText}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonSecondary]}
                  onPress={() => setShowNamePrompt(false)}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

function CgpaTargetsScreen({ navigation }) {
  const [currentCgpa, setCurrentCgpa] = useState('');
  const [completedUnits, setCompletedUnits] = useState('');
  const [targetCgpa, setTargetCgpa] = useState('');
  const [remainingUnits, setRemainingUnits] = useState('');
  const [schoolCategory, setSchoolCategory] = useState('university');
  const [result, setResult] = useState(null);

  const handleCalculate = () => {
    const cur = parseFloat(currentCgpa);
    const comp = parseInt(completedUnits, 10);
    const tar = parseFloat(targetCgpa);
    const rem = parseInt(remainingUnits, 10);

    if (isNaN(cur) || isNaN(comp) || isNaN(tar) || isNaN(rem)) {
      Alert.alert('Incomplete input', 'Please fill all fields with valid numbers.');
      return;
    }

    const isPoly = schoolCategory === 'polytechnic';
    const maxGpa = isPoly ? 4.0 : 5.0;

    if (cur > maxGpa || tar > maxGpa) {
      Alert.alert('Invalid CGPA', `CGPA values cannot exceed ${maxGpa} for ${schoolCategory}.`);
      return;
    }

    const currentTotalPoints = cur * comp;
    const targetTotalPoints = tar * (comp + rem);
    const pointsNeeded = targetTotalPoints - currentTotalPoints;
    const requiredGpaRemaining = rem > 0 ? pointsNeeded / rem : 0;

    setResult({
      requiredGpaRemaining,
      pointsNeeded,
      maxGpa,
      isPoly,
      cur,
      comp,
      tar,
      rem,
    });
  };

  const getGradeSuggestion = (requiredGpa, isPolytechnic) => {
    if (isPolytechnic) {
      if (requiredGpa >= 3.75) return 'Mostly A grades - Aim for A in most courses with occasional B.';
      if (requiredGpa >= 3.5) return 'A and B mix - Balance of A and B grades will help you reach your goal.';
      if (requiredGpa >= 3.25) return 'B and C average - Maintain grades between B (3.0) and C (2.0).';
      if (requiredGpa >= 3.0) return 'B average - Consistent B grades will achieve your goal.';
      if (requiredGpa >= 2.5) return 'B and C mix - More B grades than C, with some flexibility.';
      if (requiredGpa >= 2.0) return 'C or better - Even C grades will work if you are consistent.';
      return 'Any passing grade - Your goal is very achievable.';
    } else {
      if (requiredGpa >= 4.75) return 'Nearly all A grades - Aim for A in almost every course.';
      if (requiredGpa >= 4.5) return 'Mostly A grades - A grades in most courses with occasional B.';
      if (requiredGpa >= 4.0) return 'A and B mix - Balance of A and B grades.';
      if (requiredGpa >= 3.5) return 'B average with some A - Consistent B grades with some A grades.';
      if (requiredGpa >= 3.0) return 'B and C average - Mix of B and C grades will work.';
      if (requiredGpa >= 2.5) return 'C and D grades - Even with D grades (2.0), you can reach your goal.';
      if (requiredGpa >= 2.0) return 'D or better - Your goal is very achievable.';
      return 'Any passing grade - Your goal is easily achievable.';
    }
  };

  const getDifficultyAssessment = (requiredGpa, maxGpa) => {
    const percentage = (requiredGpa / maxGpa) * 100;
    if (percentage >= 95) return 'Extremely Difficult - Requires near-perfect performance';
    if (percentage >= 85) return 'Very Difficult - Requires excellent grades consistently';
    if (percentage >= 75) return 'Moderate - You need good grades. Steady effort should suffice';
    if (percentage >= 60) return 'Manageable - This is an achievable goal with normal effort';
    return 'Easy - You have room for grades below average and still reach your goal';
  };

  const renderResult = () => {
    if (!result) return null;

    const { requiredGpaRemaining, maxGpa, isPoly, cur, tar } = result;

    if (requiredGpaRemaining < 0) {
      return (
        <View style={[styles.resultCard, { borderColor: '#28a745' }]}>
          <Text style={[styles.resultTitle, { color: '#28a745' }]}>Goal Already Achieved!</Text>
          <Text style={styles.resultText}>
            Your current CGPA ({cur.toFixed(2)}) already meets or exceeds your target ({tar.toFixed(2)}).
          </Text>
        </View>
      );
    }

    if (requiredGpaRemaining > maxGpa) {
      return (
        <View style={[styles.resultCard, { borderColor: '#dc3545' }]}>
          <Text style={[styles.resultTitle, { color: '#dc3545' }]}>Goal Not Achievable</Text>
          <Text style={styles.resultText}>
            To reach CGPA {tar.toFixed(2)}, you would need an average of {requiredGpaRemaining.toFixed(2)} in remaining courses.
          </Text>
          <Text style={[styles.resultText, { marginTop: 8 }]}>
            However, the maximum possible GPA is {maxGpa}. This goal is not achievable.
          </Text>
          <Text style={[styles.resultText, { fontWeight: '700', marginTop: 8 }]}>
            Suggestion: Set a lower target CGPA or review your goal.
          </Text>
        </View>
      );
    }

    const gradeSuggestion = getGradeSuggestion(requiredGpaRemaining, isPoly);
    const difficulty = getDifficultyAssessment(requiredGpaRemaining, maxGpa);

    return (
      <View style={styles.resultCard}>
        <Text style={styles.resultTitle}>Goal is Achievable!</Text>
        <Text style={styles.resultText}>Required average GPA for remaining courses:</Text>
        <Text style={[styles.resultText, { fontSize: 24, fontWeight: '800', color: '#0056b3', marginVertical: 10 }]}>
          {requiredGpaRemaining.toFixed(3)}
        </Text>
        <Text style={styles.resultText}>
          <Text style={{ fontWeight: '700' }}>Advice:</Text> {gradeSuggestion}
        </Text>
        <Text style={[styles.resultText, { marginTop: 8 }]}>
          <Text style={{ fontWeight: '700' }}>Difficulty:</Text> {difficulty}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Institutional Settings</Text>
          <View style={styles.radioGroup}>
            <TouchableOpacity
              style={[styles.radioOption, schoolCategory === 'university' && styles.radioOptionActive]}
              onPress={() => setSchoolCategory('university')}
            >
              <View style={styles.radioCircle}>
                {schoolCategory === 'university' && <View style={styles.radioDot} />}
              </View>
              <Text style={styles.radioLabel}>University</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.radioOption, schoolCategory === 'polytechnic' && styles.radioOptionActive]}
              onPress={() => setSchoolCategory('polytechnic')}
            >
              <View style={styles.radioCircle}>
                {schoolCategory === 'polytechnic' && <View style={styles.radioDot} />}
              </View>
              <Text style={styles.radioLabel}>Polytechnic</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Your Goals</Text>

          <Text style={styles.courseLabel}>Current CGPA</Text>
          <TextInput
            style={styles.input}
            value={currentCgpa}
            placeholder="e.g. 3.2"
            keyboardType="numeric"
            onChangeText={setCurrentCgpa}
          />

          <Text style={styles.courseLabel}>Completed Units/Credits</Text>
          <TextInput
            style={styles.input}
            value={completedUnits}
            placeholder="e.g. 45"
            keyboardType="numeric"
            onChangeText={setCompletedUnits}
          />

          <Text style={styles.courseLabel}>Target CGPA</Text>
          <TextInput
            style={styles.input}
            value={targetCgpa}
            placeholder="e.g. 4.0"
            keyboardType="numeric"
            onChangeText={setTargetCgpa}
          />

          <Text style={styles.courseLabel}>Remaining Units/Credits</Text>
          <TextInput
            style={styles.input}
            value={remainingUnits}
            placeholder="e.g. 30"
            keyboardType="numeric"
            onChangeText={setRemainingUnits}
          />

          <TouchableOpacity style={styles.actionButton} onPress={handleCalculate}>
            <Text style={styles.buttonText}>Forecast Results</Text>
          </TouchableOpacity>
        </View>

        {renderResult()}
      </ScrollView>
    </SafeAreaView>
  );
}

function MathCalculatorScreen({ navigation }) {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [currentInput, setCurrentInput] = useState('');
  const [memory, setMemory] = useState(0);
  const [angleMode, setAngleMode] = useState('DEG');
  const [statisticsData, setStatisticsData] = useState([]);
  const [justCalculated, setJustCalculated] = useState(false);

  const handleNumber = (num) => {
    if (justCalculated) {
      setCurrentInput(num === '.' ? '0.' : num);
      setDisplay(num === '.' ? '0.' : num);
      setJustCalculated(false);
      return;
    }

    let newInput = currentInput;
    if (currentInput === '0' && num !== '.') {
      newInput = num;
    } else if (num === '.' && !currentInput.includes('.')) {
      newInput = currentInput + num;
    } else if (num !== '.') {
      newInput = currentInput + num;
    }
    setCurrentInput(newInput);
    setDisplay(newInput);
  };

  const handleOperator = (op) => {
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
    setMemory(0);
    setStatisticsData([]);
  };

  const factorial = (n) => {
    if (n < 0) return 0;
    if (n === 0 || n === 1) return 1;
    let res = 1;
    for (let i = 2; i <= n; i++) res *= i;
    return res;
  };

  const evaluateExpression = (expr) => {
    try {
      let processedExpr = expr
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/mod/g, '%')
        .replace(/\^/g, '**')
        // Handle implicit multiplication (e.g., 2sin(30) -> 2*sin(30))
        .replace(/(\d)\(/g, '$1*(')
        .replace(/\)(\d)/g, ')*$1')
        .replace(/(\d)([a-z])/gi, '$1*$2')
        .replace(/\)([a-z])/gi, ')*$1')
        // Using word boundaries to avoid replacing "sin" inside "asin"
        .replace(/\basin\(/g, 'Math.asin(')
        .replace(/\bacos\(/g, 'Math.acos(')
        .replace(/\batan\(/g, 'Math.atan(')
        .replace(/\bsin\(/g, 'Math.sin(')
        .replace(/\bcos\(/g, 'Math.cos(')
        .replace(/\btan\(/g, 'Math.tan(')
        .replace(/\bsqrt\(/g, 'Math.sqrt(')
        .replace(/\blog\(/g, 'Math.log10(')
        .replace(/\bln\(/g, 'Math.log(')
        .replace(/pi/gi, 'Math.PI')
        .replace(/e/gi, 'Math.E');

      if (angleMode === 'DEG') {
        // Handle trig functions: convert degree to radian
        processedExpr = processedExpr.replace(/Math\.sin\(([^)]+)\)/g, 'Math.sin(($1) * Math.PI / 180)');
        processedExpr = processedExpr.replace(/Math\.cos\(([^)]+)\)/g, 'Math.cos(($1) * Math.PI / 180)');
        processedExpr = processedExpr.replace(/Math\.tan\(([^)]+)\)/g, 'Math.tan(($1) * Math.PI / 180)');

        // Handle inverse trig: result is in radian, convert to degree
        processedExpr = processedExpr.replace(/Math\.asin\(([^)]+)\)/g, '(Math.asin($1) * 180 / Math.PI)');
        processedExpr = processedExpr.replace(/Math\.acos\(([^)]+)\)/g, '(Math.acos($1) * 180 / Math.PI)');
        processedExpr = processedExpr.replace(/Math\.atan\(([^)]+)\)/g, '(Math.atan($1) * 180 / Math.PI)');
      }

      // Simple evaluator using Function
      const result = new Function('return ' + processedExpr)();
      return Number.isFinite(result) ? result : 'Error';
    } catch (e) {
      return 'Error';
    }
  };

  const handleEquals = () => {
    let expr = expression + currentInput;
    // Auto-close parentheses
    const openParenCount = (expr.match(/\(/g) || []).length;
    const closeParenCount = (expr.match(/\)/g) || []).length;
    for (let i = 0; i < openParenCount - closeParenCount; i++) {
      expr += ')';
    }

    const res = evaluateExpression(expr);
    setDisplay(String(res));
    setExpression('');
    setCurrentInput(String(res));
    setJustCalculated(true);
  };

  const handleFunc = (func) => {
    if (['sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'sqrt', 'log', 'ln'].includes(func)) {
      setExpression(expression + currentInput + func + '(');
      setCurrentInput('');
      setDisplay('0');
    } else if (func === 'pi') {
      handleNumber(Math.PI.toFixed(8));
    } else if (func === 'e') {
      handleNumber(Math.E.toFixed(8));
    }
  };

  const CalcButton = ({ label, onPress, color = '#fff', textColor = '#333', wide = false, small = false }) => (
    <TouchableOpacity
      style={[
        styles.calcButton,
        { backgroundColor: color, flex: wide ? 2 : 1 },
        small && { paddingVertical: 8 }
      ]}
      onPress={onPress}
    >
      <Text style={[styles.calcButtonText, { color: textColor }, small && { fontSize: 14 }]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.calcContainer}>
        <View style={styles.calcDisplayContainer}>
          <Text style={styles.calcExpressionText} numberOfLines={1}>{expression || ' '}</Text>
          <Text style={styles.calcDisplayText} numberOfLines={1}>{display}</Text>
        </View>

        <View style={styles.calcGrid}>
          {/* Top Row */}
          <View style={styles.calcRow}>
            <CalcButton label={angleMode} onPress={() => setAngleMode(angleMode === 'DEG' ? 'RAD' : 'DEG')} color="#6c757d" textColor="#fff" small />
            <CalcButton label="CLR" onPress={handleClear} color="#ffc107" textColor="#fff" small />
            <CalcButton label="AC" onPress={handleClearAll} color="#dc3545" textColor="#fff" small />
            <CalcButton label="(" onPress={() => {setExpression(expression + '(');}} color="#e9ecef" small />
            <CalcButton label=")" onPress={() => {setExpression(expression + currentInput + ')'); setCurrentInput('');}} color="#e9ecef" small />
          </View>

          {/* Scientific Row 1 */}
          <View style={styles.calcRow}>
            <CalcButton label="sin" onPress={() => handleFunc('sin')} color="#f8f9fa" small />
            <CalcButton label="cos" onPress={() => handleFunc('cos')} color="#f8f9fa" small />
            <CalcButton label="tan" onPress={() => handleFunc('tan')} color="#f8f9fa" small />
            <CalcButton label="sqrt" onPress={() => handleFunc('sqrt')} color="#f8f9fa" small />
            <CalcButton label="x²" onPress={() => { const val = parseFloat(display); setDisplay(String(val*val)); setCurrentInput(String(val*val)); }} color="#f8f9fa" small />
          </View>

          {/* Scientific Row 2: Inverse Trig */}
          <View style={styles.calcRow}>
            <CalcButton label="sin⁻¹" onPress={() => handleFunc('asin')} color="#f8f9fa" small />
            <CalcButton label="cos⁻¹" onPress={() => handleFunc('acos')} color="#f8f9fa" small />
            <CalcButton label="tan⁻¹" onPress={() => handleFunc('atan')} color="#f8f9fa" small />
            <CalcButton label="log" onPress={() => handleFunc('log')} color="#f8f9fa" small />
            <CalcButton label="ln" onPress={() => handleFunc('ln')} color="#f8f9fa" small />
          </View>

          {/* Numbers & Basic Ops */}
          <View style={styles.calcRow}>
            <CalcButton label="7" onPress={() => handleNumber('7')} />
            <CalcButton label="8" onPress={() => handleNumber('8')} />
            <CalcButton label="9" onPress={() => handleNumber('9')} />
            <CalcButton label="÷" onPress={() => handleOperator('÷')} color="#007bff" textColor="#fff" />
            <CalcButton label="π" onPress={() => handleFunc('pi')} color="#f8f9fa" small />
          </View>

          <View style={styles.calcRow}>
            <CalcButton label="4" onPress={() => handleNumber('4')} />
            <CalcButton label="5" onPress={() => handleNumber('5')} />
            <CalcButton label="6" onPress={() => handleNumber('6')} />
            <CalcButton label="×" onPress={() => handleOperator('×')} color="#007bff" textColor="#fff" />
            <CalcButton label="e" onPress={() => handleFunc('e')} color="#f8f9fa" small />
          </View>

          <View style={styles.calcRow}>
            <CalcButton label="1" onPress={() => handleNumber('1')} />
            <CalcButton label="2" onPress={() => handleNumber('2')} />
            <CalcButton label="3" onPress={() => handleNumber('3')} />
            <CalcButton label="-" onPress={() => handleOperator('-')} color="#007bff" textColor="#fff" />
            <CalcButton label="^" onPress={() => handleOperator('^')} color="#f8f9fa" small />
          </View>

          <View style={styles.calcRow}>
            <CalcButton label="0" onPress={() => handleNumber('0')} wide />
            <CalcButton label="." onPress={() => handleNumber('.')} />
            <CalcButton label="+" onPress={() => handleOperator('+')} color="#007bff" textColor="#fff" />
            <CalcButton label="=" onPress={handleEquals} color="#28a745" textColor="#fff" />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

function TodoListScreen({ navigation }) {
  const [tasks, setTasks] = useState([]);
  const [taskTitle, setTaskTitle] = useState('');
  const [venue, setVenue] = useState('');

  const [selectedDay, setSelectedDay] = useState(new Date().getDate().toString().padStart(2, '0'));
  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString().padStart(2, '0'));
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  const [selectedHour, setSelectedHour] = useState('08');
  const [selectedMinute, setSelectedMinute] = useState('00');
  const [selectedPeriod, setSelectedPeriod] = useState('AM');

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    loadTasks();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const loadTasks = async () => {
    try {
      const stored = await AsyncStorage.getItem('@todo_tasks');
      if (stored) setTasks(JSON.parse(stored));
    } catch (e) {
      console.error(e);
    }
  };

  const saveTasks = async (updatedTasks) => {
    try {
      await AsyncStorage.setItem('@todo_tasks', JSON.stringify(updatedTasks));
    } catch (e) {
      console.error(e);
    }
  };

  const addTask = async () => {
    if (taskTitle.trim() === '') {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }

    let hour24 = parseInt(selectedHour, 10);
    if (selectedPeriod === 'PM' && hour24 !== 12) hour24 += 12;
    if (selectedPeriod === 'AM' && hour24 === 12) hour24 = 0;

    const taskDate = new Date(
      parseInt(selectedYear, 10),
      parseInt(selectedMonth, 10) - 1,
      parseInt(selectedDay, 10),
      hour24,
      parseInt(selectedMinute, 10),
      0
    );

    if (taskDate <= new Date()) {
      Alert.alert('Error', 'Cannot set task in the past');
      return;
    }

    const id = Date.now().toString();
    const newTask = {
      id,
      title: taskTitle,
      venue: venue || 'Not Specified',
      targetDate: taskDate.toISOString(),
      completed: false,
      dayName: taskDate.toLocaleDateString('en-US', { weekday: 'long' }),
      dateString: `${selectedDay}/${selectedMonth}/${selectedYear}`,
      timeString: `${selectedHour}:${selectedMinute} ${selectedPeriod}`
    };

    // Schedule notification for task alarm
    if (Platform.OS !== 'web') {
      try {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "ScholarSuite Task Reminder",
            body: `Time for: ${taskTitle}${venue ? ' at ' + venue : ''}`,
            data: { alarmId: id, type: 'todo' },
            sound: 'default',
          },
          trigger: taskDate,
        });
      } catch (e) {
        console.warn('Notification scheduling failed', e);
      }
    }

    const updated = [...tasks, newTask];
    setTasks(updated);
    saveTasks(updated);

    // Reset fields
    setTaskTitle('');
    setVenue('');
    Alert.alert('Success', 'Task scheduled successfully!');
  };

  const deleteTask = (id) => {
    const updated = tasks.filter(t => t.id !== id);
    setTasks(updated);
    saveTasks(updated);
  };

  const formatCountdown = (targetDateStr) => {
    const target = new Date(targetDateStr);
    const diff = target - currentTime;
    if (diff <= 0) return '00:00:00';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const years = [new Date().getFullYear().toString(), (new Date().getFullYear() + 1).toString()];

  const hoursArr = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const minutesArr = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));
  const periods = ['AM', 'PM'];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Add New Task</Text>

          <TextInput
            style={styles.input}
            value={taskTitle}
            onChangeText={setTaskTitle}
            placeholder="Task Title / Course Name"
            placeholderTextColor="#777"
          />

          <TextInput
            style={styles.input}
            value={venue}
            onChangeText={setVenue}
            placeholder="Venue (Optional)"
            placeholderTextColor="#777"
          />

          <Text style={styles.pickerLabel}>Date (DD/MM/YYYY)</Text>
          <View style={styles.timePickerContainer}>
            <View style={styles.pickerColumn}>
              <View style={styles.smallInputWrapper}>
                <Picker selectedValue={selectedDay} onValueChange={setSelectedDay} style={styles.picker} mode="dropdown" dropdownIconColor="#0056b3">
                  {days.map(d => <Picker.Item key={d} label={d} value={d} color="#333" />)}
                </Picker>
              </View>
            </View>
            <View style={styles.pickerColumn}>
              <View style={styles.smallInputWrapper}>
                <Picker selectedValue={selectedMonth} onValueChange={setSelectedMonth} style={styles.picker} mode="dropdown" dropdownIconColor="#0056b3">
                  {months.map(m => <Picker.Item key={m} label={m} value={m} color="#333" />)}
                </Picker>
              </View>
            </View>
            <View style={[styles.pickerColumn, { flex: 1.5 }]}>
              <View style={styles.smallInputWrapper}>
                <Picker selectedValue={selectedYear} onValueChange={setSelectedYear} style={styles.picker} mode="dropdown" dropdownIconColor="#0056b3">
                  {years.map(y => <Picker.Item key={y} label={y} value={y} color="#333" />)}
                </Picker>
              </View>
            </View>
          </View>

          <Text style={styles.pickerLabel}>Time</Text>
          <View style={styles.timePickerContainer}>
            <View style={styles.pickerColumn}>
              <View style={styles.smallInputWrapper}>
                <Picker selectedValue={selectedHour} onValueChange={setSelectedHour} style={styles.picker} mode="dropdown" dropdownIconColor="#0056b3" itemStyle={styles.pickerItem}>
                  {hoursArr.map(h => <Picker.Item key={h} label={h} value={h} color="#333" />)}
                </Picker>
              </View>
            </View>
            <Text style={styles.timeSeparator}>:</Text>
            <View style={styles.pickerColumn}>
              <View style={styles.smallInputWrapper}>
                <Picker selectedValue={selectedMinute} onValueChange={setSelectedMinute} style={styles.picker} mode="dropdown" dropdownIconColor="#0056b3" itemStyle={styles.pickerItem}>
                  {minutesArr.map(m => <Picker.Item key={m} label={m} value={m} color="#333" />)}
                </Picker>
              </View>
            </View>
            <View style={[styles.pickerColumn, { marginLeft: 10 }]}>
              <View style={styles.smallInputWrapper}>
                <Picker selectedValue={selectedPeriod} onValueChange={setSelectedPeriod} style={styles.picker} mode="dropdown" dropdownIconColor="#0056b3" itemStyle={styles.pickerItem}>
                  {periods.map(p => <Picker.Item key={p} label={p} value={p} color="#333" />)}
                </Picker>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.actionButton} onPress={addTask}>
            <Text style={styles.buttonText}>Schedule Task</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Active Tasks & Countdowns</Text>
        {tasks.length === 0 ? (
          <Text style={styles.emptyText}>No tasks scheduled.</Text>
        ) : (
          tasks.map(task => (
            <View key={task.id} style={[styles.todoItem, { flexDirection: 'column', alignItems: 'flex-start' }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
                <Text style={[styles.todoText, { fontSize: 18, color: '#0056b3' }]}>{task.title}</Text>
                <TouchableOpacity onPress={() => deleteTask(task.id)}>
                  <Text style={{ fontSize: 20 }}>🗑️</Text>
                </TouchableOpacity>
              </View>

              <Text style={{ fontSize: 14, color: '#555', marginTop: 4 }}>
                📍 Venue: {task.venue}
              </Text>

              <Text style={{ fontSize: 14, color: '#555' }}>
                📅 {task.dayName}, {task.dateString} at {task.timeString}
              </Text>

              <View style={styles.countdownContainer}>
                <Text style={styles.countdownLabel}>Time Left:</Text>
                <Text style={styles.countdownValue}>{formatCountdown(task.targetDate)}</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function RemindersScreen({ navigation }) {
  const [reminders, setReminders] = useState([]);
  const [newReminder, setNewReminder] = useState('');
  const [selectedHour, setSelectedHour] = useState('08');
  const [selectedMinute, setSelectedMinute] = useState('00');
  const [selectedPeriod, setSelectedPeriod] = useState('AM');
  const [snoozeDuration, setSnoozeDuration] = useState('5');

  useEffect(() => {
    loadReminders();
    setupNotifications();
  }, []);

  const setupNotifications = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please enable notifications to use alarms.');
    }
  };

  const loadReminders = async () => {
    try {
      const stored = await AsyncStorage.getItem('@reminders');
      if (stored) setReminders(JSON.parse(stored));
    } catch (e) {
      console.error(e);
    }
  };

  const saveReminders = async (updated) => {
    try {
      await AsyncStorage.setItem('@reminders', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  
  
  const addReminder = async () => {
    if (newReminder.trim() === '') {
      Alert.alert('Error', 'Please enter a title for your reminder');
      return;
    }

    const id = Date.now().toString();
    const timeString = `${selectedHour}:${selectedMinute} ${selectedPeriod}`;

    let hour24 = parseInt(selectedHour, 10);
    if (selectedPeriod === 'PM' && hour24 !== 12) hour24 += 12;
    if (selectedPeriod === 'AM' && hour24 === 12) hour24 = 0;

    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(hour24);
    scheduledTime.setMinutes(parseInt(selectedMinute, 10));
    scheduledTime.setSeconds(0);
    scheduledTime.setMilliseconds(0);

    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    const trigger = scheduledTime;

    if (Platform.OS !== 'web') {
      try {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "ScholarSuite Alarm",
            body: newReminder,
            data: { alarmId: id },
            sound: 'default',
          },
          trigger,
        });
      } catch (e) {
        console.warn('Notification scheduling failed', e);
      }
    }

    const newAlarm = {
      id,
      title: newReminder,
      time: timeString,
      snooze: snoozeDuration
    };

    const updated = [...reminders, newAlarm];
    setReminders(updated);
    saveReminders(updated);
    setNewReminder('');
    Alert.alert('Success', `Alarm set for ${timeString}`);
  };

  const deleteReminder = async (id) => {
    const updated = reminders.filter(r => r.id !== id);
    setReminders(updated);
    saveReminders(updated);
    // Cancel notification if possible (Expo Notifications requires identifier)
  };

  const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));
  const periods = ['AM', 'PM'];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Set New Alarm</Text>

          <TextInput
            style={styles.input}
            value={newReminder}
            onChangeText={setNewReminder}
            placeholder="What's this alarm for?"
            placeholderTextColor="#777"
          />

          <View style={styles.timePickerContainer}>
            <View style={styles.pickerColumn}>
              <Text style={styles.pickerLabel}>Hour</Text>
              <View style={styles.smallInputWrapper}>
                <Picker
                  selectedValue={selectedHour}
                  onValueChange={setSelectedHour}
                  style={styles.picker}
                  mode="dropdown"
                  dropdownIconColor="#0056b3"
                  itemStyle={styles.pickerItem}
                >
                  {hours.map(h => <Picker.Item key={h} label={h} value={h} color="#333" />)}
                </Picker>
              </View>
            </View>
            <Text style={styles.timeSeparator}>:</Text>
            <View style={styles.pickerColumn}>
              <Text style={styles.pickerLabel}>Minute</Text>
              <View style={styles.smallInputWrapper}>
                <Picker
                  selectedValue={selectedMinute}
                  onValueChange={setSelectedMinute}
                  style={styles.picker}
                  mode="dropdown"
                  dropdownIconColor="#0056b3"
                  itemStyle={styles.pickerItem}
                >
                  {minutes.map(m => <Picker.Item key={m} label={m} value={m} color="#333" />)}
                </Picker>
              </View>
            </View>
            <View style={[styles.pickerColumn, { marginLeft: 10 }]}>
              <Text style={styles.pickerLabel}>AM/PM</Text>
              <View style={styles.smallInputWrapper}>
                <Picker
                  selectedValue={selectedPeriod}
                  onValueChange={setSelectedPeriod}
                  style={styles.picker}
                  mode="dropdown"
                  dropdownIconColor="#0056b3"
                  itemStyle={styles.pickerItem}
                >
                  {periods.map(p => <Picker.Item key={p} label={p} value={p} color="#333" />)}
                </Picker>
              </View>
            </View>
          </View>

          
          <Text style={styles.pickerLabel}>Snooze Duration (minutes)</Text>
          <View style={styles.smallInputWrapper}>
            <Picker
              selectedValue={snoozeDuration}
              onValueChange={setSnoozeDuration}
              style={styles.picker}
              mode="dropdown"
              dropdownIconColor="#0056b3"
            >
              {['2', '5', '10', '15', '20'].map(d => <Picker.Item key={d} label={`${d} mins`} value={d} color="#333" />)}
            </Picker>
          </View>

          <TouchableOpacity style={styles.actionButton} onPress={addReminder}>
            <Text style={styles.buttonText}>Schedule Alarm</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Upcoming Alarms</Text>
        {reminders.length === 0 ? (
          <Text style={styles.emptyText}>No alarms set.</Text>
        ) : (
          reminders.map(rem => (
            <View key={rem.id} style={styles.todoItem}>
              <View style={styles.todoTextContainer}>
                <Text style={styles.todoText}>⏰ {rem.time}</Text>
                <Text style={[styles.todoText, { fontSize: 14, color: '#666' }]}>{rem.title}</Text>
              </View>
              <TouchableOpacity onPress={() => deleteReminder(rem.id)}>
                <Text style={{ fontSize: 20 }}>🗑️</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      <Modal visible={isRinging} transparent animationType="slide">
        <View style={styles.alarmOverlay}>
          <View style={styles.alarmModal}>
            <Text style={styles.alarmIcon}>🔔</Text>
            <Text style={styles.alarmTitle}>Alarm Ringing!</Text>
            <Text style={styles.alarmSubject}>{activeAlarm?.title}</Text>
            <Text style={styles.alarmTime}>{activeAlarm?.time}</Text>

            <View style={styles.alarmButtonContainer}>
              <TouchableOpacity style={[styles.alarmButton, styles.snoozeBtn]} onPress={handleSnooze}>
                <Text style={styles.buttonText}>Snooze ({snoozeDuration}m)</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.alarmButton, styles.stopBtn]} onPress={stopAlarm}>
                <Text style={styles.buttonText}>Stop</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function ComingSoonScreen({ route, navigation }) {
  const { feature } = route.params || { feature: 'This feature' };
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.container, { flex: 1, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ fontSize: 60, marginBottom: 20 }}>🚀</Text>
        <Text style={[styles.menuTitleLarge, { textAlign: 'center' }]}>Coming Soon</Text>
        <Text style={[styles.menuItemSubtitle, { textAlign: 'center', fontSize: 18, marginTop: 10, paddingHorizontal: 20 }]}>
          {feature} is currently under development. Stay tuned!
        </Text>
        <TouchableOpacity
          style={[styles.actionButton, { marginTop: 30, paddingHorizontal: 40, flex: 0 }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function HistoryScreen({ navigation }) {
  const [history, setHistory] = useState([]);
  const [sortBy, setSortBy] = useState('date');
  const [searchText, setSearchText] = useState('');

  const loadHistory = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) setHistory(JSON.parse(stored));
    } catch (error) {
      console.warn('Failed to load history', error);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const filteredHistory = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    const filtered = history.filter(record => record.name.toLowerCase().includes(query));

    if (sortBy === 'name') {
      return filtered.slice().sort((a, b) => a.name.localeCompare(b.name));
    }

    return filtered.slice().sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [history, searchText, sortBy]);

  const deleteHistoryRecord = async recordToDelete => {
    const updated = history.filter(record => record.timestamp !== recordToDelete.timestamp || record.name !== recordToDelete.name);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setHistory(updated);
  };

  const editHistoryRecord = record => {
    navigation.navigate('Home', { editRecord: record });
  };

  const clearHistory = () => {
    Alert.alert(
      'Confirm Clear',
      'Are you sure you want to delete ALL saved CGPA records? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem(STORAGE_KEY);
            setHistory([]);
            Alert.alert('Cleared', 'All history records have been removed.');
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.historyContainer}>
      <View style={styles.historyFilters}>
        <View style={styles.smallInputWrapper}>
          <Picker
            selectedValue={sortBy}
            onValueChange={value => setSortBy(value)}
            style={styles.historyPicker}
          >
            <Picker.Item label="Sort by Date" value="date" />
            <Picker.Item label="Sort by Name" value="name" />
          </Picker>
        </View>
        <TextInput
          style={[styles.input, styles.searchInput]}
          placeholder="Search by name..."
          placeholderTextColor="#777"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>
      <ScrollView style={styles.historyList}>
        {filteredHistory.length === 0 ? (
          <Text style={styles.emptyText}>No matching records found.</Text>
        ) : (
          filteredHistory.map((record, index) => (
            <View key={`${record.name}-${record.timestamp}`} style={styles.historyCard}>
              <Text style={styles.historyName}>{record.name}</Text>
              <Text style={styles.historyTimestamp}>{new Date(record.timestamp).toLocaleString()}</Text>
              <Text style={styles.historyResult}>{record.result}</Text>
              <View style={styles.historyButtonRow}>
                <TouchableOpacity
                  style={styles.historyActionButton}
                  onPress={() => editHistoryRecord(record)}
                >
                  <Text style={styles.historyActionText}>Update Result</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.historyActionButton, styles.deleteButton]}
                  onPress={() => deleteHistoryRecord(record)}
                >
                  <Text style={styles.historyActionText}>Clear Result</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
      <View style={styles.historyFooter}>
        <TouchableOpacity style={styles.actionButton} onPress={clearHistory}>
          <Text style={styles.buttonText}>Clear All</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#0056b3',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="Home"
          component={MainHomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Calculator"
          component={CalculatorScreen}
          options={{ title: 'CGPA Calculator' }}
        />
        <Stack.Screen
          name="Targets"
          component={CgpaTargetsScreen}
          options={{ title: 'CGPA Forecast & Goals' }}
        />
        <Stack.Screen
          name="History"
          component={HistoryScreen}
          options={{ title: 'Saved CGPA History' }}
        />
        <Stack.Screen
          name="Result"
          component={ResultScreen}
          options={{ title: 'Result Summary' }}
        />
        <Stack.Screen
          name="MathCalculator"
          component={MathCalculatorScreen}
          options={{ title: 'Math Calculator' }}
        />
        <Stack.Screen
          name="Reminders"
          component={RemindersScreen}
          options={{ title: 'Study Reminders' }}
        />
        <Stack.Screen
          name="TodoList"
          component={TodoListScreen}
          options={{ title: 'To-Do List' }}
        />
        <Stack.Screen
          name="ComingSoon"
          component={ComingSoonScreen}
          options={{ title: 'Under Development' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f4f4f9',
  },
  flex: {
    flex: 1,
  },
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    marginTop: Platform.OS === 'android' ? 10 : 0,
  },
  title: {
    fontSize: normalize(24),
    color: '#0056b3',
    fontWeight: '700',
  },
  titleAccent: {
    fontFamily: Platform.OS === 'ios' ? 'Arial' : 'sans-serif',
    fontWeight: '900',
  },
  historyButton: {
    backgroundColor: '#f4f4f9',
    borderColor: '#0056b3',
    borderWidth: 2,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  historyButtonText: {
    color: '#0056b3',
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#eaf7fa',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#0056b3',
    fontWeight: '700',
    marginBottom: 12,
  },
  radioGroup: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#fff',
  },
  radioOptionActive: {
    borderColor: '#0056b3',
    backgroundColor: '#e6f2ff',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#0056b3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0056b3',
  },
  radioLabel: {
    fontWeight: '700',
  },
  courseRow: {
    marginBottom: 16,
  },
  courseLabel: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    marginBottom: 12,
    color: '#111',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#fff',
    marginBottom: 12,
  },
  picker: {
    height: 60,
    width: '100%',
    color: '#333',
    fontSize: 16,
  },
  pickerItem: {
    height: 50,
    fontSize: 16,
    color: '#333',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#007bff',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  resetButton: {
    backgroundColor: '#dc3545',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
  },
  resultCard: {
    backgroundColor: '#e6f2ff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#007bff',
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
    color: '#0056b3',
  },
  resultText: {
    fontSize: 16,
    color: '#0a3d62',
    lineHeight: 22,
  },
  bottomRow: {
    marginBottom: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalBox: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    color: '#0056b3',
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    backgroundColor: '#007bff',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalButtonSecondary: {
    backgroundColor: '#6c757d',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  historyContainer: {
    flex: 1,
    backgroundColor: '#f4f4f9',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#fff',
  },
  historyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0056b3',
  },
  closeText: {
    color: '#007bff',
    fontWeight: '700',
  },
  historyFilters: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  smallInputWrapper: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    marginBottom: 12,
    backgroundColor: '#fff',
    width: '100%',
    minHeight: 60,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  historyPicker: {
    height: 48,
  },
  searchInput: {
    marginBottom: 0,
  },
  historyList: {
    paddingHorizontal: 16,
  },
  historyCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  historyName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  historyTimestamp: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 10,
  },
  historyResult: {
    fontSize: 14,
    color: '#111827',
    lineHeight: 20,
    marginBottom: 12,
  },
  historyButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  historyActionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#007bff',
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
  },
  historyActionText: {
    color: '#fff',
    fontWeight: '700',
  },
  emptyText: {
    color: '#6b7280',
    textAlign: 'center',
    marginVertical: 40,
    fontSize: 16,
  },
  historyFooter: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  menuHeader: {
    marginTop: 40,
    marginBottom: 30,
    alignItems: 'center',
  },
  menuTitle: {
    fontSize: 18,
    color: '#666',
  },
  menuTitleLarge: {
    fontSize: normalize(28),
    fontWeight: '800',
    color: '#333',
  },
  menuGrid: {
    gap: 16,
  },
  menuCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    borderLeftWidth: 6,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  menuCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  menuIcon: {
    fontSize: 34,
  },
  menuItemTitle: {
    fontSize: normalize(16),
    fontWeight: '700',
    color: '#333',
  },
  menuItemSubtitle: {
    fontSize: normalize(13),
    color: '#777',
    marginTop: 2,
    flexWrap: 'wrap',
  },
  historyMenuButton: {
    marginTop: 30,
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderStyle: 'dashed',
  },
  historyMenuButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0056b3',
  },
  calcContainer: {
    flex: 1,
    backgroundColor: '#f1f3f5',
    padding: 10,
  },
  calcDisplayContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    minHeight: 120,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  calcExpressionText: {
    fontSize: 18,
    color: '#6c757d',
    marginBottom: 5,
  },
  calcDisplayText: {
    fontSize: normalize(36),
    fontWeight: '700',
    color: '#212529',
  },
  calcGrid: {
    flex: 1,
    gap: 10,
  },
  calcRow: {
    flexDirection: 'row',
    gap: 10,
    flex: 1,
  },
  calcButton: {
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    paddingVertical: 12,
  },
  calcButtonText: {
    fontSize: 20,
    fontWeight: '600',
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  todoTextContainer: {
    flex: 1,
  },
  todoText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  timePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  pickerColumn: {
    flex: 1,
    alignItems: 'center',
  },
  pickerLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    fontWeight: '600',
  },
  timeSeparator: {
    fontSize: 24,
    fontWeight: '700',
    marginHorizontal: 10,
    marginTop: 20,
  },
  alarmOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alarmModal: {
    backgroundColor: '#fff',
    width: '85%',
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
  },
  alarmIcon: {
    fontSize: 60,
    marginBottom: 20,
  },
  alarmTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0056b3',
  },
  alarmSubject: {
    fontSize: 18,
    color: '#333',
    marginTop: 10,
    textAlign: 'center',
  },
  alarmTime: {
    fontSize: normalize(44),
    fontWeight: '900',
    color: '#000',
    marginVertical: 20,
  },
  alarmButtonContainer: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 20,
  },
  alarmButton: {
    flex: 1,
    paddingVertical: 18,
    borderRadius: 15,
    alignItems: 'center',
  },
  snoozeBtn: {
    backgroundColor: '#6c757d',
  },
  stopBtn: {
    backgroundColor: '#dc3545',
  },
  countdownContainer: {
    backgroundColor: '#f0f7ff',
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#0056b3',
    borderStyle: 'dashed',
  },
  countdownLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0056b3',
  },
  countdownValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#333',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
});
