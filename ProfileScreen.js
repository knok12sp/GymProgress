import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TextInput, Button } from 'react-native-paper'; // Import from react-native-paper
import { supabase } from './supabaseClient';

const ProfileScreen = ({ user }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    // Fetch user profile
    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (data) {
        setUsername(data.username);
        setEmail(data.email);
      } else if (error) {
        console.error('Error fetching profile:', error);
      }
    };
    fetchProfile();
  }, [user]);

  const updateProfile = async () => {
    const { error } = await supabase
      .from('profiles')
      .update({ username, email })
      .eq('id', user.id);
    if (error) {
      console.error('Error updating profile:', error);
    } else {
      alert('Profile updated successfully');
    }
  };

  return (
    <View style={styles.container}>
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
      <Button mode="contained" onPress={updateProfile} style={styles.button}>
        Update Profile
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  label: { fontSize: 16, marginBottom: 5 },
  input: { marginBottom: 15 },
  button: { marginTop: 10 },
});

export default ProfileScreen;
