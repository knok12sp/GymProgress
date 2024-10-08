import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import { TextInput, Button, Avatar, ActivityIndicator, Title } from 'react-native-paper';
import { supabase } from './supabaseClient';

const ProfileScreen = ({ user }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [liftStats, setLiftStats] = useState({ totalSessions: 0, totalWeightLifted: 0 });

  // Fetch user profile and stats after component mounts
  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchLiftStats();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (error) throw error;

      setUsername(data.username);
      setEmail(data.email);
    } catch (error) {
      console.error('Error fetching profile:', error.message);
      Alert.alert('Error', 'Failed to fetch profile.');
    } finally {
      setLoading(false);
    }
  };

  const fetchLiftStats = async () => {
    try {
      const { data, error } = await supabase
        .from('lifting_sessions')
        .select('weight, reps');

      if (error) throw error;

      const totalSessions = data.length;
      const totalWeightLifted = data.reduce((sum, session) => sum + (session.weight * session.reps), 0);
      
      setLiftStats({ totalSessions, totalWeightLifted });
    } catch (error) {
      console.error('Error fetching lifting stats:', error.message);
    }
  };

  const updateProfile = async () => {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ username, email })
        .eq('id', user.id);
      
      if (error) throw error;

      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error.message);
      Alert.alert('Error', 'Failed to update profile.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" style={styles.loading} />;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileHeader}>
        <Avatar.Text
          size={100}
          label={username ? username.charAt(0).toUpperCase() : 'U'}
          style={styles.avatar}
        />
        <Title style={styles.username}>{username || 'User'}</Title>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.label}>Username</Text>
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          mode="outlined"
        />
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          mode="outlined"
        />
        <Button
          mode="contained"
          onPress={updateProfile}
          loading={updating}
          style={styles.button}
        >
          {updating ? 'Updating...' : 'Update Profile'}
        </Button>
      </View>

      <View style={styles.statsSection}>
        <Title style={styles.statsTitle}>Lifting Stats</Title>
        <Text style={styles.stat}>Total Sessions: {liftStats.totalSessions}</Text>
        <Text style={styles.stat}>Total Weight Lifted: {liftStats.totalWeightLifted} kg</Text>
        <Button
          mode="outlined"
          onPress={fetchLiftStats}
          style={styles.refreshButton}
        >
          Refresh Stats
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatar: {
    backgroundColor: '#ff6347',
  },
  username: {
    marginTop: 10,
    fontSize: 22,
    color: '#333',
  },
  infoSection: {
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#ff6347',
    paddingVertical: 5,
  },
  statsSection: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 2,
  },
  statsTitle: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: 'center',
  },
  stat: {
    fontSize: 16,
    marginBottom: 5,
    textAlign: 'center',
  },
  refreshButton: {
    marginTop: 10,
    borderColor: '#ff6347',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ProfileScreen;
