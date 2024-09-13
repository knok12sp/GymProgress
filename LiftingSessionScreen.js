import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Dimensions, Alert } from 'react-native';
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
    <View style={styles.container}>
      <Title style={styles.title}>Add Lifting Session</Title>

      <TextInput
        label="Exercise"
        value={exercise}
        onChangeText={setExercise}
        style={styles.input}
      />
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

      <Title style={styles.title}>Select Exercise to View Progress</Title>
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
        {[...new Set(sessions.map((s) => s.exercise))].map((exercise) => (
          <Menu.Item
            key={exercise}
            onPress={() => {
              setSelectedExercise(exercise);
              setMenuVisible(false);
            }}
            title={exercise}
          />
        ))}
      </Menu>

      {loading && !fetchError ? (
        <ActivityIndicator size="large" color="#6200ee" style={styles.loadingIndicator} />
      ) : (
        <>
          {fetchError && <Text style={styles.errorText}>{fetchError}</Text>}

          {filteredSessions.length === 0 && !loading && !fetchError && selectedExercise && (
            <Text>No sessions available for {selectedExercise}.</Text>
          )}

          {filteredSessions.length > 0 && selectedExercise && (
            <>
              <LineChart
                data={weightData}
                width={screenWidth - 40}
                height={220}
                chartConfig={{
                  backgroundColor: '#2c3e50',
                  backgroundGradientFrom: '#34495e',
                  backgroundGradientTo: '#2c3e50',
                  decimalPlaces: 2,
                  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  style: { borderRadius: 16 },
                  propsForDots: { r: '6', strokeWidth: '2', stroke: '#ffa726' },
                }}
                bezier
                style={styles.chart}
              />

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
            </>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    marginBottom: 15,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    marginRight: 10,
  },
  clearButton: {
    flex: 1,
  },
  pickerButton: {
    marginVertical: 20,
  },
  chart: {
    marginVertical: 20,
    borderRadius: 16,
  },
  card: {
    marginVertical: 10,
  },
  deleteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  loadingIndicator: {
    marginVertical: 20,
  },
  errorText: {
    color: 'red',
    marginVertical: 10,
  },
});

export default LiftingSessionScreen;
