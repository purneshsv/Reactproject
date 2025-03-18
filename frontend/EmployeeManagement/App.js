import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import AddEmployeeScreen from './src/screens/AddEmployeeScreen';
import EditEmployeeScreen from './src/screens/EditEmployeeScreen';

const Stack = createStackNavigator();

const App = () => {
  useEffect(() => {
    // Configure Google Sign-In
    GoogleSignin.configure({
      webClientId:
        '816103591299-ufmd0aouuarmq15b167ak1ksr4dt78ak.apps.googleusercontent.com', // Replace with your Web Client ID
      iosClientId:
        '816103591299-ufmd0aouuarmq15b167ak1ksr4dt78ak.apps.googleusercontent.com', // Replace with your iOS Client ID
      offlineAccess: true,
    });
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
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
