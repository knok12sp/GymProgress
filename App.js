import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Provider as PaperProvider, Button } from 'react-native-paper'; 
import AuthScreen from './AuthScreen';
import LiftingSessionScreen from './LiftingSessionScreen';
import ProfileScreen from './ProfileScreen';
import { supabase } from './supabaseClient';

export default function App() {
  const [user, setUser] = useState(null);
  const [currentScreen, setCurrentScreen] = useState('LiftingSession');
  const [loading, setLoading] = useState(true); // Loading state

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data: sessionData, error } = await supabase.auth.getSession();
        if (error) throw error;

        setUser(sessionData?.session?.user || null);
      } catch (error) {
        Alert.alert('Error', 'Failed to fetch session data.');
      } finally {
        setLoading(false); // Stop loading after fetching session
      }
    };

    fetchSession();

    // Listen for authentication state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      subscription.unsubscribe(); // Cleanup subscription on unmount
    };
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ff6347" />
      </View>
    );
  }

  if (!user) {
    return <AuthScreen setUser={setUser} />;
  }

  return (
    <PaperProvider>
      <View style={styles.container}>
        {/* Navigation Buttons */}
        <View style={styles.navContainer}>
          <Button
            mode={currentScreen === 'LiftingSession' ? 'contained' : 'text'}
            onPress={() => setCurrentScreen('LiftingSession')}
            style={[
              styles.navButton,
              currentScreen === 'LiftingSession' && styles.activeNavButton,
            ]}
          >
            Lifting Sessions
          </Button>
          <Button
            mode={currentScreen === 'Profile' ? 'contained' : 'text'}
            onPress={() => setCurrentScreen('Profile')}
            style={[
              styles.navButton,
              currentScreen === 'Profile' && styles.activeNavButton,
            ]}
          >
            Profile
          </Button>
        </View>

        {/* Conditional Rendering of Screens */}
        {currentScreen === 'LiftingSession' && <LiftingSessionScreen user={user} />}
        {currentScreen === 'Profile' && <ProfileScreen user={user} />}
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111', // Dark background matching other screens
  },
  navContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: '#222', // Slightly lighter dark background for contrast
  },
  navButton: {
    color: 'black', // Accent color
  },
  activeNavButton: {
    backgroundColor: '#ff6347', // Active button matches the accent color used elsewhere
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111', // Dark background while loading
  },
});
