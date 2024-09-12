import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Button, TextInput } from 'react-native-paper'; // Import Button and TextInput from react-native-paper
import { supabase } from './supabaseClient';

const WorkoutPlanScreen = ({ user }) => {
  const [planName, setPlanName] = useState('');
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch workout plans
    const fetchPlans = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('workout_plans')
        .select('*')
        .eq('user_id', user.id);
      if (data) setPlans(data);
      if (error) console.error('Error fetching plans:', error);
      setLoading(false);
    };
    fetchPlans();
  }, [user]);

  const addPlan = async () => {
    if (!planName.trim()) {
      alert('Plan name cannot be empty');
      return;
    }
    
    setLoading(true);
    const { error } = await supabase
      .from('workout_plans')
      .insert([{ name: planName, user_id: user.id }]);
    if (error) console.error('Error adding plan:', error);
    else {
      setPlanName('');
      const { data } = await supabase
        .from('workout_plans')
        .select('*')
        .eq('user_id', user.id);
      if (data) setPlans(data);
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <TextInput
        label="Plan Name"
        value={planName}
        onChangeText={setPlanName}
        style={styles.input}
        mode="outlined"
      />
      <Button mode="contained" onPress={addPlan} loading={loading}>
        Add Plan
      </Button>
      {loading ? (
        <Text>Loading...</Text>
      ) : (
        <FlatList
          data={plans}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.plan}>
              <Text>{item.name}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  input: { marginBottom: 15 },
  plan: { padding: 15, borderBottomWidth: 1, borderColor: '#ddd' },
});

export default WorkoutPlanScreen;
