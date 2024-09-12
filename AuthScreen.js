// AuthScreen.js
import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { TextInput, Button, Title } from 'react-native-paper';
import { supabase } from './supabaseClient';

export default function AuthScreen({ setUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);

  const handleAuth = async () => {
    if (isLogin) {
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (!error) setUser(data.user);
    } else {
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
      });
      if (!error) setUser(data.user);
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

      <Button onPress={() => setIsLogin(!isLogin)}>
        {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Login'}
      </Button>
    </View>
  );
}
