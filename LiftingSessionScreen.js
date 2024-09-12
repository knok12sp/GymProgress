import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Dimensions } from 'react-native';
import { TextInput, Button, Card, Title } from 'react-native-paper';
import { supabase } from './supabaseClient';
import { LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

const LiftingSessionScreen = ({ user }) => {
  const [exercise, setExercise] = useState('');
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [sessions, setSessions] = useState([]);

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
    const { error } = await supabase
      .from('lifting_sessions')
      .insert([{ exercise, weight, reps, date: new Date(), user_id: user.id }]);
    if (error) console.error('Error adding session:', error);
    else {
      setExercise('');
      setWeight('');
      setReps('');
      fetchSessions();
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
      <Button mode="contained" onPress={addSession}>
        Add Session
      </Button>
      <LineChart
        data={weightData}
        width={screenWidth}
        height={220}
        chartConfig={{
          backgroundColor: '#e26a00',
          backgroundGradientFrom: '#fb8c00',
          backgroundGradientTo: '#ffa726',
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  input: { marginBottom: 15 },
  chart: { marginVertical: 8, borderRadius: 16 },
  card: { marginVertical: 10 },
});

export default LiftingSessionScreen;
