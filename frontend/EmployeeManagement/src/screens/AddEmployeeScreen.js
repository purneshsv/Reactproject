import React, {useState, useCallback} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import {Input, Button, Text, Icon} from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import * as Animatable from 'react-native-animatable';
import COLORS from '../theme/colors';
import {authAxios} from '../utils/AuthUtils';
import styles from '../styles/AddEmployeeScreenStyles';

const API_URL = 'http://127.0.0.1:5001/api';

const AddEmployeeScreen = ({navigation}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    position: '',
    department: '',
    phone: '',
    hire_date: '',
    salary: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const updateField = useCallback((field, value) => {
    setFormData(prev => ({...prev, [field]: value}));
  }, []);

  const handleSubmit = async () => {
    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.position.trim() ||
      !formData.department.trim()
    ) {
      setError('Please fill in all required fields.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      // Format the salary as a number if it exists
      const formattedData = {
        ...formData,
        salary: formData.salary ? parseFloat(formData.salary) : null,
        hire_date: formData.hire_date || null
      };
      
      console.log('Sending employee data:', formattedData);
      
      // Use authAxios which automatically includes the token
      await authAxios.post('/employees', formattedData);

      navigation.goBack();
    } catch (err) {
      console.error('Error adding employee:', err.response?.data || err.message);
      if (err.response?.status === 401) {
        Alert.alert('Session Expired', 'Please log in again', [
          {text: 'OK', onPress: () => navigation.replace('Login')},
        ]);
      } else {
        setError('Failed to add employee: ' + (err.response?.data?.message || err.message));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <ScrollView style={styles.container}>
        <Animatable.View
          animation="fadeInDown"
          duration={1000}
          style={styles.header}>
          <Text h4 style={styles.title}>
            Add New Employee
          </Text>
          <Text style={styles.subtitle}>MG Health Tech</Text>
        </Animatable.View>

        <Animatable.View animation="fadeIn" delay={300} duration={800}>
          <Input
            placeholder="Name"
            value={formData.name}
            onChangeText={value => updateField('name', value)}
            leftIcon={
              <Icon
                name="person"
                type="material"
                color={COLORS.primary}
                size={20}
              />
            }
            inputContainerStyle={styles.inputContainer}
            inputStyle={styles.inputText}
            placeholderTextColor={COLORS.textLight}
            autoCapitalize="words"
          />
          <Input
            placeholder="Email"
            value={formData.email}
            onChangeText={value => updateField('email', value)}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon={
              <Icon
                name="email"
                type="material"
                color={COLORS.primary}
                size={20}
              />
            }
            inputContainerStyle={styles.inputContainer}
            inputStyle={styles.inputText}
            placeholderTextColor={COLORS.textLight}
          />
          <Input
            placeholder="Position"
            value={formData.position}
            onChangeText={value => updateField('position', value)}
            leftIcon={
              <Icon
                name="work"
                type="material"
                color={COLORS.primary}
                size={20}
              />
            }
            inputContainerStyle={styles.inputContainer}
            inputStyle={styles.inputText}
            placeholderTextColor={COLORS.textLight}
          />
          <Input
            placeholder="Department"
            value={formData.department}
            onChangeText={value => updateField('department', value)}
            leftIcon={
              <Icon
                name="business"
                type="material"
                color={COLORS.primary}
                size={20}
              />
            }
            inputContainerStyle={styles.inputContainer}
            inputStyle={styles.inputText}
            placeholderTextColor={COLORS.textLight}
          />
          <Input
            placeholder="Phone"
            value={formData.phone}
            onChangeText={value => updateField('phone', value)}
            keyboardType="phone-pad"
            leftIcon={
              <Icon
                name="phone"
                type="material"
                color={COLORS.primary}
                size={20}
              />
            }
            inputContainerStyle={styles.inputContainer}
            inputStyle={styles.inputText}
            placeholderTextColor={COLORS.textLight}
          />
          <Input
            placeholder="Hire Date (YYYY-MM-DD)"
            value={formData.hire_date}
            onChangeText={value => updateField('hire_date', value)}
            leftIcon={
              <Icon
                name="event"
                type="material"
                color={COLORS.primary}
                size={20}
              />
            }
            inputContainerStyle={styles.inputContainer}
            inputStyle={styles.inputText}
            placeholderTextColor={COLORS.textLight}
          />
          <Input
            placeholder="Salary"
            value={formData.salary}
            onChangeText={value => updateField('salary', value)}
            keyboardType="numeric"
            leftIcon={
              <Icon
                name="attach-money"
                type="material"
                color={COLORS.primary}
                size={20}
              />
            }
            inputContainerStyle={styles.inputContainer}
            inputStyle={styles.inputText}
            placeholderTextColor={COLORS.textLight}
          />

          {error ? (
            <Animatable.View animation="shake" style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </Animatable.View>
          ) : null}

          <View style={styles.buttonContainer}>
            <Button
              title={loading ? 'Adding...' : 'Add Employee'}
              onPress={handleSubmit}
              disabled={loading}
              containerStyle={styles.buttonPrimary}
              buttonStyle={{
                backgroundColor: COLORS.primary,
                borderRadius: 10,
                paddingVertical: 12,
              }}
              titleStyle={{fontWeight: 'bold'}}
              disabledStyle={{backgroundColor: COLORS.primaryLight}}
              loading={loading}
              loadingProps={{color: COLORS.textWhite}}
            />
            <Button
              title="Cancel"
              onPress={() => navigation.goBack()}
              type="outline"
              containerStyle={styles.buttonSecondary}
              buttonStyle={{
                borderColor: COLORS.primary,
                borderWidth: 1,
                borderRadius: 10,
                paddingVertical: 12,
              }}
              titleStyle={{color: COLORS.primary, fontWeight: 'bold'}}
            />
          </View>
        </Animatable.View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AddEmployeeScreen;
