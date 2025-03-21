import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import AddEmployeeScreen from './src/screens/AddEmployeeScreen';
import EditEmployeeScreen from './src/screens/EditEmployeeScreen';
import {isAuthenticated} from './src/utils/AuthUtils';

const Stack = createStackNavigator();

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);

  // Check for authentication status when app loads
  const checkAuth = async () => {
    try {
      // Check if session expired flag is set
      const sessionExpired = await AsyncStorage.getItem('sessionExpired');
      if (sessionExpired === 'true') {
        // Clear the flag
        await AsyncStorage.removeItem('sessionExpired');
        setUserToken(null);
        return;
      }
      
      // Check if user is authenticated
      const isAuth = await isAuthenticated();
      if (isAuth) {
        const token = await AsyncStorage.getItem('token');
        setUserToken(token);
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Configure Google Sign-In
    GoogleSignin.configure({
      webClientId:
        '816103591299-ufmd0aouuarmq15b167ak1ksr4dt78ak.apps.googleusercontent.com', // Replace with your Web Client ID
      iosClientId:
        '816103591299-ufmd0aouuarmq15b167ak1ksr4dt78ak.apps.googleusercontent.com', // Replace with your iOS Client ID
      offlineAccess: true,
    });
    
    // Check authentication status
    checkAuth();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={userToken ? 'Home' : 'Login'}>
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: 'Employee Management',
            headerLeft: null,
          }}
        />
        <Stack.Screen
          name="AddEmployee"
          component={AddEmployeeScreen}
          options={{title: 'Add Employee'}}
        />
        <Stack.Screen
          name="EditEmployee"
          component={EditEmployeeScreen}
          options={{title: 'Edit Employee'}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
