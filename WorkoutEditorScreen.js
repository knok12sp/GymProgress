import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Dimensions, Alert } from 'react-native';
import { TextInput, Button, Card, Title } from 'react-native-paper';
import { supabase } from './supabaseClient';
import { LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

const LiftingSessionScreen = ({ user }) => {
  const [exercise, setExercise] = useState('');
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    const { data, error } = await supabase
      .from('lifting_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });
    if (error) console.error('Error fetching sessions:', error);
    else setSessions(data);
  };

  const addSession = async () => {
    if (!exercise || !weight || !reps) {
      Alert.alert('Missing Fields', 'Please fill out all the fields.');
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from('lifting_sessions')
      .insert([{ exercise, weight, reps, date: new Date(), user_id: user.id }]);

    setLoading(false);

    if (error) {
      console.error('Error adding session:', error);
      Alert.alert('Error', 'Could not add session. Please try again.');
    } else {
      setExercise('');
      setWeight('');
      setReps('');
      fetchSessions();
      Alert.alert('Success', 'Lifting session added!');
    }
  };

  const weightData = {
    labels: sessions.map(s => new Date(s.date).toLocaleDateString()),
    datasets: [{ data: sessions.map(s => s.weight) }],
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
      <Button
        mode="contained"
        onPress={addSession}
        disabled={!exercise || !weight || !reps || loading}
        loading={loading}
        style={styles.button}
      >
        Add Session
      </Button>

      <LineChart
        data={weightData}
        width={screenWidth - 40}  // Make the chart fit inside padding
        height={220}
        chartConfig={{
          backgroundColor: '#1e2923',
          backgroundGradientFrom: '#1e2923',
          backgroundGradientTo: '#08130d',
          decimalPlaces: 1,
          color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
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
              <Title style={styles.cardTitle}>{item.exercise}</Title>
              <Text style={styles.cardText}>
                {item.weight} kg x {item.reps} reps
              </Text>
              <Text style={styles.cardDate}>
                {new Date(item.date).toDateString()}
              </Text>
            </Card.Content>
          </Card>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    marginBottom: 15,
    backgroundColor: 'white',
  },
  button: {
    marginBottom: 20,
  },
  chart: {
    marginVertical: 20,
    borderRadius: 16,
  },
  card: {
    marginVertical: 10,
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardText: {
    fontSize: 16,
    marginTop: 4,
    color: '#333',
  },
  cardDate: {
    fontSize: 14,
    marginTop: 8,
    color: '#888',
  },
});

export default LiftingSessionScreen;
