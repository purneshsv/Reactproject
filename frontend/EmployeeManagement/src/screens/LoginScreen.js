import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {Input, Button, Text, Icon} from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import * as Animatable from 'react-native-animatable';
import COLORS from '../theme/colors';

const API_URL = 'http://localhost:3001';

const LoginScreen = ({navigation}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [secureTextEntry, setSecureTextEntry] = useState(true);

  // Configure Google Sign-In on component mount
  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        '816103591299-ufmd0aouuarmq15b167ak1ksr4dt78ak.apps.googleusercontent.com',
      iosClientId:
        '816103591299-ufmd0aouuarmq15b167ak1ksr4dt78ak.apps.googleusercontent.com',
      offlineAccess: true,
      scopes: ['profile', 'email'],
      forceCodeForRefreshToken: true,
    });
  }, []);

  // Handle manual login (Username & Password)
  const handleLogin = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      if (!username || !password) {
        setError('Please enter both username and password');
        setIsLoading(false);
        return;
      }
      
      const response = await axios.post(`${API_URL}/login`, {
        username,
        password,
      });

      const {token} = response.data;
      await AsyncStorage.setItem('token', token);
      console.log(' Login successful. Token stored.');
      setIsLoading(false);
      navigation.replace('Home');
    } catch (err) {
      console.error(' Login failed:', err);
      setError('Invalid credentials');
      setIsLoading(false);
    }
  };

  // Handle Google Sign-In
  const handleGoogleLogin = async () => {
    try {
      console.log(' Checking Google Play Services...');
      await GoogleSignin.hasPlayServices();

      console.log(' Initiating Google Sign-In...');
      const userInfo = await GoogleSignin.signIn();
      console.log(
        ' Google Sign-In Success:',
        JSON.stringify(userInfo, null, 2),
      );

      if (!userInfo) {
        console.error(' No userInfo received from Google Sign-In.');
        setError('Google Sign-In failed: No user info.');
        return;
      }

      const {idToken} = userInfo;
      console.log(' Extracted ID Token:', idToken);

      if (!idToken) {
        console.error(' No ID Token received from Google Sign-In.');
        setError('Google Sign-In failed: No ID token received.');
        return;
      }

      console.log(' Sending ID Token to backend:', idToken);

      // Send Google ID token to backend for verification
      const response = await axios.post(`${API_URL}/auth/google`, {
        token: idToken,
      });

      console.log(' Received JWT from backend:', response.data);

      // Store the received token
      await AsyncStorage.setItem('token', response.data.token);
      console.log(' JWT stored successfully, navigating to Home...');
      navigation.replace('Home');
    } catch (error) {
      console.error(' Google Sign-In Error:', error);

      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        setError('Google Sign-In cancelled');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        setError('Google Sign-In already in progress');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        setError('Google Play Services not available');
      } else {
        setError(`Google Sign-In failed: ${error.message}`);
      }
    }
  };

  const toggleSecureTextEntry = () => {
    setSecureTextEntry(!secureTextEntry);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      <View style={styles.background} />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidView}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Animatable.View 
            animation="fadeIn" 
            duration={1500} 
            style={styles.logoContainer}>
            <Animatable.Text 
              animation="pulse" 
              iterationCount="infinite" 
              duration={3000}
              style={styles.companyName}>
              MG HEALTH TECH
            </Animatable.Text>
            <Animatable.Text 
              animation="fadeIn" 
              delay={500}
              style={styles.tagline}>
              Employee Management System
            </Animatable.Text>
          </Animatable.View>

          <Animatable.View 
            animation="fadeInUpBig"
            duration={1000}
            delay={300}
            style={styles.formContainer}>
            
            <Text style={styles.welcomeText}>Welcome</Text>
            
            <Animatable.View 
              animation="fadeInLeft" 
              delay={600}
              style={styles.inputContainer}>
              <Input
                placeholder="Username"
                leftIcon={
                  <Icon name="person" type="ionicon" color={COLORS.textLight} size={20} />
                }
                onChangeText={setUsername}
                value={username}
                inputStyle={styles.inputText}
                inputContainerStyle={styles.inputField}
                placeholderTextColor={COLORS.textLight}
                autoCapitalize="none"
              />
            </Animatable.View>
            
            <Animatable.View 
              animation="fadeInLeft" 
              delay={800}
              style={styles.inputContainer}>
              <Input
                placeholder="Password"
                leftIcon={
                  <Icon name="lock-closed" type="ionicon" color={COLORS.textLight} size={20} />
                }
                rightIcon={
                  <TouchableOpacity onPress={toggleSecureTextEntry}>
                    <Icon 
                      name={secureTextEntry ? 'eye-off' : 'eye'} 
                      type="ionicon" 
                      color={COLORS.textLight} 
                      size={20} 
                    />
                  </TouchableOpacity>
                }
                secureTextEntry={secureTextEntry}
                onChangeText={setPassword}
                value={password}
                inputStyle={styles.inputText}
                inputContainerStyle={styles.inputField}
                placeholderTextColor={COLORS.textLight}
                autoCapitalize="none"
              />
            </Animatable.View>

            {error ? (
              <Animatable.Text 
                animation="shake" 
                style={styles.error}>
                {error}
              </Animatable.Text>
            ) : null}

            <Animatable.View 
              animation="fadeInUp" 
              delay={1000}
              style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.loginButton}
                onPress={handleLogin}
                disabled={isLoading}>
                {isLoading ? (
                  <Text style={styles.buttonText}>Logging in...</Text>
                ) : (
                  <Text style={styles.buttonText}>Login</Text>
                )}
              </TouchableOpacity>
            </Animatable.View>

            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.divider} />
            </View>

            <TouchableOpacity
              style={styles.googleButton}
              onPress={handleGoogleLogin}>
              <Icon
                name="logo-google"
                type="ionicon"
                color="#FFFFFF"
                size={20}
                style={styles.googleIcon}
              />
              <Text style={styles.googleButtonText}>Sign in with Google</Text>
            </TouchableOpacity>
          </Animatable.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: COLORS.background,
  },
  keyboardAvoidView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  companyName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.primary,
    letterSpacing: 2,
    textShadowColor: 'rgba(0, 161, 154, 0.3)',
    textShadowOffset: {width: 0, height: 0},
    textShadowRadius: 10,
  },
  tagline: {
    fontSize: 16,
    color: COLORS.secondary,
    marginTop: 5,
  },
  formContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 15,
    padding: 20,
    shadowColor: COLORS.shadow,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 10,
  },
  inputField: {
    backgroundColor: COLORS.backgroundDark,
    borderRadius: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 0,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputText: {
    color: COLORS.text,
    fontSize: 16,
    paddingLeft: 5,
  },
  buttonContainer: {
    marginTop: 10,
  },
  loginButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    marginTop: 10,
  },
  buttonText: {
    color: COLORS.textWhite,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.divider,
  },
  dividerText: {
    color: COLORS.textLight,
    paddingHorizontal: 10,
    fontSize: 14,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.secondary,
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  googleIcon: {
    marginRight: 10,
  },
  googleButtonText: {
    color: COLORS.textWhite,
    fontSize: 16,
    fontWeight: '500',
  },
  error: {
    color: COLORS.error,
    textAlign: 'center',
    marginTop: 5,
    marginBottom: 10,
  },
});

export default LoginScreen;
