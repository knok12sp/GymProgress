import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper'; // Import Button from react-native-paper
import AuthScreen from './AuthScreen';
import LiftingSessionScreen from './LiftingSessionScreen';
import ProfileScreen from './ProfileScreen';
import WorkoutPlanScreen from './WorkoutPlanScreen';
import { supabase } from './supabaseClient';

export default function App() {
  const [user, setUser] = useState(null);
  const [currentScreen, setCurrentScreen] = useState('LiftingSession');

  useEffect(() => {
    // Fetch the current session
    const fetchSession = async () => {
      const { data: sessionData, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error fetching session:', error);
      } else {
        setUser(sessionData.session?.user || null);
      }
    };

    fetchSession();

    // Listen for authentication state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    // Cleanup subscription on component unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (!user) {
    return <AuthScreen setUser={setUser} />;
  }

  return (
    <View style={styles.container}>
      {/* Navigation Buttons */}
      <View style={styles.navContainer}>
        <Button mode="text" onPress={() => setCurrentScreen('LiftingSession')}>Lifting Sessions</Button>
        <Button mode="text" onPress={() => setCurrentScreen('Profile')}>Profile</Button>
        <Button mode="text" onPress={() => setCurrentScreen('WorkoutPlans')}>Workout Plans</Button>
      </View>

      {/* Conditional Rendering of Screens */}
      {currentScreen === 'LiftingSession' && <LiftingSessionScreen />}
      {currentScreen === 'Profile' && <ProfileScreen />}
      {currentScreen === 'WorkoutPlans' && <WorkoutPlanScreen />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
  },
  navContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: '#eee',
  },
});