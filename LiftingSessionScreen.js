import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Dimensions, Alert, ScrollView } from 'react-native';
import { TextInput, Button, Card, Title, ActivityIndicator, IconButton, Menu, Divider } from 'react-native-paper';
import { supabase } from './supabaseClient';
import { LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

const LiftingSessionScreen = ({ user }) => {
  const [exercise, setExercise] = useState('');
  const [selectedExercise, setSelectedExercise] = useState('');
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [exerciseList, setExerciseList] = useState([]); // List of exercises
  const [showGraph, setShowGraph] = useState(false); // Toggle for showing graph

  useEffect(() => {
    if (user) {
      fetchSessions();
    } else {
      Alert.alert('Error', 'User is not defined');
    }
  }, [user]);

  const fetchSessions = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const { data, error } = await supabase
        .from('lifting_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) {
        throw error;
      }

      setSessions(data);
      const uniqueExercises = [...new Set(data.map((s) => s.exercise))];
      setExerciseList(uniqueExercises);
    } catch (error) {
      setFetchError('Error fetching sessions');
      Alert.alert('Error', 'Could not fetch sessions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addSession = async () => {
    if (!user) {
      Alert.alert('Error', 'User is not defined');
      return;
    }

    if (!exercise || !weight || !reps) {
      Alert.alert('Validation Error', 'Please fill out all fields.');
      return;
    }

    if (isNaN(weight) || isNaN(reps)) {
      Alert.alert('Validation Error', 'Weight and reps must be numeric values.');
      return;
    }

    setLoading(true);
    setFetchError(null);

    try {
      const sessionData = {
        exercise,
        weight: parseFloat(weight),
        reps: parseInt(reps, 10),
        date: new Date().toISOString(),
        user_id: user.id,
      };

      const { error } = await supabase
        .from('lifting_sessions')
        .insert([sessionData]);

      if (error) {
        throw error;
      }

      setExercise('');
      setWeight('');
      setReps('');
      if (!exerciseList.includes(exercise)) {
        setExerciseList([...exerciseList, exercise]); // Add new exercise to list
      }
      await fetchSessions();
    } catch (error) {
      Alert.alert('Error', 'Could not add session. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const deleteSession = async (id) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('lifting_sessions')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }
      await fetchSessions();
    } catch (error) {
      Alert.alert('Error', 'Could not delete session.');
    } finally {
      setLoading(false);
    }
  };

  const filteredSessions = sessions.filter((s) => s.exercise === selectedExercise);
  const weightData = {
    labels: filteredSessions.map((s) => new Date(s.date).toLocaleDateString()),
    datasets: [{ data: filteredSessions.map((s) => s.weight) }],
  };

  return (
    <ScrollView style={styles.container}>
      <Title style={styles.title}>Add Lifting Session</Title>

      <TextInput
        label="Exercise"
        value={exercise}
        onChangeText={setExercise}
        style={styles.input}
        placeholder="Add or select an exercise"
        placeholderTextColor="#aaa"
      />

      <Menu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        anchor={
          <Button
            mode="outlined"
            onPress={() => setMenuVisible(true)}
            style={styles.pickerButton}
          >
            {selectedExercise || 'Select an Exercise'}
          </Button>
        }
      >
        {exerciseList.map((exercise) => (
          <Menu.Item
            key={exercise}
            onPress={() => {
              setSelectedExercise(exercise);
              setExercise(exercise);
              setMenuVisible(false);
            }}
            title={exercise}
          />
        ))}
      </Menu>

      <TextInput
        label="Weight (kg)"
        value={weight}
        keyboardType="numeric"
        onChangeText={setWeight}
        style={styles.input}
      />
      <TextInput
        label="Reps"
        value={reps}
        keyboardType="numeric"
        onChangeText={setReps}
        style={styles.input}
      />

      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={addSession}
          loading={loading}
          disabled={loading}
          style={styles.button}
        >
          {loading ? 'Adding...' : 'Add Session'}
        </Button>
        <Button
          mode="outlined"
          onPress={() => {
            setExercise('');
            setWeight('');
            setReps('');
          }}
          style={styles.clearButton}
        >
          Clear
        </Button>
      </View>

      <Button
        mode="contained"
        onPress={() => setShowGraph(true)}
        style={styles.graphButton}
        disabled={!selectedExercise || filteredSessions.length === 0}
      >
        Show Progress Graph
      </Button>

      {showGraph && filteredSessions.length > 0 && (
        <LineChart
          data={weightData}
          width={screenWidth - 40}
          height={220}
          chartConfig={{
            backgroundColor: '#222',
            backgroundGradientFrom: '#333',
            backgroundGradientTo: '#111',
            decimalPlaces: 2,
            color: (opacity = 1) => `rgba(255, 99, 132, ${opacity})`, // Updated color
            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            style: { borderRadius: 16 },
            propsForDots: { r: '6', strokeWidth: '2', stroke: '#ff6347' },
          }}
          bezier
          style={styles.chart}
        />
      )}

      <FlatList
        data={filteredSessions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Content>
              <Title>{item.exercise}</Title>
              <Text>
                {item.weight} kg x {item.reps} reps
              </Text>
              <Text>Total: {item.weight * item.reps} kg lifted</Text>
              <Text>{new Date(item.date).toDateString()}</Text>
            </Card.Content>
            <IconButton
              icon="delete"
              onPress={() => deleteSession(item.id)}
              style={styles.deleteButton}
            />
          </Card>
        )}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#111',
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
    color: '#ff6347',
    fontSize: 22,
  },
  input: {
    marginBottom: 15,
    backgroundColor: '#2c2c2c',
    color: '#fff',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  button: {
    flex: 1,
    marginRight: 10,
    backgroundColor: '#ff6347',
  },
  clearButton: {
    flex: 1,
    borderColor: '#ff6347',
  },
  pickerButton: {
    marginVertical: 20,
    borderColor: '#ff6347',
  },
  graphButton: {
    marginBottom: 20,
    backgroundColor: '#ff6347',
  },
  chart: {
    marginVertical: 20,
    borderRadius: 16,
  },
  card: {
    marginVertical: 10,
    backgroundColor: '#2c2c2c',
    color: '#fff',
  },
  deleteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    color: '#ff6347',
  },
});

export default LiftingSessionScreen;
