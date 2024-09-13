import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { TextInput, Button, Title } from 'react-native-paper';
import { supabase } from './supabaseClient';

export default function AuthScreen({ setUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState(null); // To handle error messages

  const handleAuth = async () => {
    try {
      let result;
      if (isLogin) {
        result = await supabase.auth.signInWithPassword({
          email,
          password,
        });
      } else {
        result = await supabase.auth.signUp({
          email,
          password,
        });
      }

      if (result.error) {
        console.error('Auth error:', result.error); // Debugging statement
        setError(result.error.message);
      } else {
        console.log('Auth result:', result); // Debugging statement
        setUser(result.data.user);
      }
    } catch (error) {
      console.error('Error in handleAuth:', error); // Debugging statement
      setError('An error occurred during authentication');
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Title>{isLogin ? 'Login' : 'Sign Up'}</Title>

      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        style={{ marginBottom: 10 }}
      />
      <TextInput
        label="Password"
        value={password}
        secureTextEntry
        onChangeText={setPassword}
        style={{ marginBottom: 20 }}
      />
      <Button mode="contained" onPress={handleAuth}>
        {isLogin ? 'Login' : 'Sign Up'}
      </Button>
      {error && <Text style={{ color: 'red' }}>{error}</Text>} {/* Display errors */}
      <Button onPress={() => setIsLogin(!isLogin)}>
        {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Login'}
      </Button>
    </View>
  );
}
