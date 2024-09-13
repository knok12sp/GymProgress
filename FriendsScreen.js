import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Button, StyleSheet } from 'react-native';
import { supabase } from './supabaseClient';

const FriendsScreen = ({ user }) => {
  const [friends, setFriends] = useState([]);
  const [allUsers, setAllUsers] = useState([]);

  useEffect(() => {
    fetchFriends();
    fetchAllUsers();
  }, []);

  const fetchFriends = async () => {
    const { data, error } = await supabase
      .from('friends')
      .select('*, friend:user_id(*)')
      .eq('user_id', user.id);
    if (data) setFriends(data);
    if (error) console.error('Error fetching friends:', error);
  };

  const fetchAllUsers = async () => {
    const { data, error } = await supabase.from('users').select('*');
    if (data) setAllUsers(data);
    if (error) console.error('Error fetching users:', error);
  };

  const addFriend = async (friendId) => {
    const { error } = await supabase
      .from('friends')
      .insert([{ user_id: user.id, friend_id: friendId }]);
    if (error) console.error('Error adding friend:', error);
    else fetchFriends();
  };

  return (
    <View style={styles.container}>
      <Text>Your Friends:</Text>
      <FlatList
        data={friends}
        keyExtractor={(item) => item.friend.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.friend}>
            <Text>{item.friend.username}</Text>
          </View>
        )}
      />
      <Text>Add Friends:</Text>
      <FlatList
        data={allUsers.filter(u => u.id !== user.id)}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.friend}>
            <Text>{item.username}</Text>
            <Button title="Add Friend" onPress={() => addFriend(item.id)} />
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  friend: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 10 },
});

export default FriendsScreen;