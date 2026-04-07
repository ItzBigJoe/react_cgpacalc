import React, { useEffect, useMemo, useState } from 'react';
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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';

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

export default function App() {
  const [schoolCategory, setSchoolCategory] = useState('university');
  const [courses, setCourses] = useState(INITIAL_COURSES);
  const [result, setResult] = useState(null);
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [history, setHistory] = useState([]);
  const [historyVisible, setHistoryVisible] = useState(false);
  const [sortBy, setSortBy] = useState('date');
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    async function loadHistory() {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) setHistory(JSON.parse(stored));
      } catch (error) {
        console.warn('Failed to load history', error);
      }
    }
    loadHistory();
  }, []);

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
    setResult(null);
    setShowSavePrompt(false);
    setShowNamePrompt(false);
    setSaveName('');
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
    const formattedResult = `CGPA: ${cgpa.toFixed(2)}\n${message}\n\n"${quote}"`;

    setResult({ cgpa: cgpa.toFixed(2), message, quote, text: formattedResult });
    setShowSavePrompt(true);
  };

  const saveHistoryRecord = async () => {
    if (!saveName.trim()) {
      Alert.alert('Missing name', 'Enter a name to save the record.');
      return;
    }

    const record = {
      name: saveName.trim(),
      result: result?.text || '',
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
      setHistory(updatedHistory);
      setShowNamePrompt(false);
      setShowSavePrompt(false);
      setSaveName('');
      Alert.alert('Saved', 'Record saved successfully.');
      handleReset();
    } catch (error) {
      Alert.alert('Save failed', 'Unable to save your record.');
      console.warn(error);
    }
  };

  const handleOpenHistory = () => {
    setHistoryVisible(true);
    setSearchText('');
    setSortBy('date');
  };

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
    setSchoolCategory(record.schooltype === '1' ? 'polytechnic' : 'university');
    setCourses(
      record.courses.map(course => ({
        code: course.code ?? '',
        unit: String(course.unit),
        grade: String(course.grade),
      })),
    );
    setHistoryVisible(false);
    setResult(null);
    setShowSavePrompt(false);
    setShowNamePrompt(false);
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
            <TouchableOpacity style={styles.historyButton} onPress={handleOpenHistory}>
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
              <View key={`${index}-${course.code}`} style={styles.courseRow}>
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

          {result && (
            <View style={styles.resultCard}>
              <Text style={styles.resultTitle}>Result</Text>
              <Text style={styles.resultText}>{result.text}</Text>
            </View>
          )}

          <View style={styles.bottomRow}>
            <TouchableOpacity style={[styles.actionButton, styles.resetButton]} onPress={handleReset}>
              <Text style={styles.buttonText}>Reset</Text>
            </TouchableOpacity>
          </View>

          <Modal visible={showSavePrompt} transparent animationType="fade">
            <View style={styles.modalOverlay}>
              <View style={styles.modalBox}>
                <Text style={styles.modalTitle}>Do you want to save your CGPA record?</Text>
                <View style={styles.modalButtonRow}>
                  <TouchableOpacity
                    style={styles.modalButton}
                    onPress={() => {
                      setShowSavePrompt(false);
                      setShowNamePrompt(true);
                    }}
                  >
                    <Text style={styles.modalButtonText}>Yes</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalButtonSecondary]}
                    onPress={() => {
                      setShowSavePrompt(false);
                      handleReset();
                    }}
                  >
                    <Text style={styles.modalButtonText}>No</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

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
                <TouchableOpacity style={styles.modalButton} onPress={saveHistoryRecord}>
                  <Text style={styles.modalButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          <Modal visible={historyVisible} animationType="slide">
            <SafeAreaView style={styles.historyContainer}>
              <View style={styles.historyHeader}>
                <Text style={styles.historyTitle}>Saved CGPA History</Text>
                <TouchableOpacity onPress={() => setHistoryVisible(false)}>
                  <Text style={styles.closeText}>Close</Text>
                </TouchableOpacity>
              </View>
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
          </Modal>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
  },
  title: {
    fontSize: 28,
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
    height: 48,
  },
  pickerItem: {
    height: 48,
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
});
