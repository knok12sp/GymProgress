import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Dimensions, Alert } from 'react-native';
import { TextInput, Button, Card, Title, ActivityIndicator } from 'react-native-paper';
import { supabase } from './supabaseClient';
import { LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

const LiftingSessionScreen = ({ user }) => {
  const [exercise, setExercise] = useState('');
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    console.log('User:', user);
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
      console.log('Fetching sessions for user ID:', user.id);
      const { data, error } = await supabase
        .from('lifting_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) {
        throw error;
      }

      console.log('Sessions fetched:', data);
      setSessions(data);
    } catch (error) {
      console.error('Error fetching sessions:', error.message);
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

      console.log('Adding session:', sessionData);
      const { error } = await supabase
        .from('lifting_sessions')
        .insert([sessionData]);

      if (error) {
        throw error;
      }

      console.log('Session added successfully');
      setExercise('');
      setWeight('');
      setReps('');
      await fetchSessions();
    } catch (error) {
      console.error('Error adding session:', error.message);
      Alert.alert('Error', 'Could not add session. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const weightData = {
    labels: sessions.map(s => new Date(s.date).toLocaleDateString()),
    datasets: [{ data: sessions.map(s => s.weight) }],
  };

  return (
    <View style={styles.container}>
      <Title>Add Lifting Session</Title>

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
      <Button
        mode="contained"
        onPress={addSession}
        loading={loading}
        disabled={loading}
        style={styles.button}
      >
        {loading ? 'Adding...' : 'Add Session'}
      </Button>

      {loading && !fetchError ? (
        <ActivityIndicator size="large" color="#6200ee" style={styles.loadingIndicator} />
      ) : (
        <>
          {fetchError && <Text style={styles.errorText}>{fetchError}</Text>}

          {sessions.length === 0 && !loading && !fetchError && (
            <Text>No sessions available.</Text>
          )}

          {sessions.length > 0 && (
            <>
              <LineChart
                data={weightData}
                width={screenWidth - 40} // Adjust width to fit within padding
                height={220}
                chartConfig={{
                  backgroundColor: '#1e2923',
                  backgroundGradientFrom: '#1e2923',
                  backgroundGradientTo: '#08130d',
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
                data={sessions}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <Card style={styles.card}>
                    <Card.Content>
                      <Title>{item.exercise}</Title>
                      <Text>{item.weight} kg x {item.reps} reps</Text>
                      <Text>{new Date(item.date).toDateString()}</Text>
                    </Card.Content>
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
    backgroundColor: '#f5f5f5' 
  },
  input: { 
    marginBottom: 15 
  },
  button: {
    marginBottom: 20,
  },
  chart: { 
    marginVertical: 20, 
    borderRadius: 16 
  },
  card: { 
    marginVertical: 10 
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
