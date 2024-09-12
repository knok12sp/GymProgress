import React, { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import * as Permissions from 'expo-permissions';

const NotificationsSetup = () => {
  useEffect(() => {
    const getPermission = async () => {
      const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
      if (status === 'granted') {
        const token = await Notifications.getExpoPushTokenAsync();
        console.log('Expo Push Token:', token);
        // Save token to your database
      }
    };
    getPermission();
  }, []);

  return null; // This component doesn’t render anything
};

export default NotificationsSetup;
