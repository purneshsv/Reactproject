import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Input, Button, Text } from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_URL = 'http://localhost:3001';

const AddEmployeeScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    position: '',
    department: '',
    phone: '',
    hire_date: '',
  });
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.post(`${API_URL}/employees`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigation.goBack();
    } catch (err) {
      setError('Failed to add employee');
    }
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <ScrollView style={styles.container}>
      <Text h4 style={styles.title}>Add New Employee</Text>
      
      <Input
        placeholder="Name"
        value={formData.name}
        onChangeText={(value) => updateField('name', value)}
      />
      
      <Input
        placeholder="Email"
        value={formData.email}
        onChangeText={(value) => updateField('email', value)}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <Input
        placeholder="Position"
        value={formData.position}
        onChangeText={(value) => updateField('position', value)}
      />
      
      <Input
        placeholder="Department"
        value={formData.department}
        onChangeText={(value) => updateField('department', value)}
      />
      
      <Input
        placeholder="Phone"
        value={formData.phone}
        onChangeText={(value) => updateField('phone', value)}
        keyboardType="phone-pad"
      />
      
      <Input
        placeholder="Hire Date (YYYY-MM-DD)"
        value={formData.hire_date}
        onChangeText={(value) => updateField('hire_date', value)}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}
      
      <View style={styles.buttonContainer}>
        <Button
          title="Add Employee"
          onPress={handleSubmit}
          containerStyle={styles.button}
        />
        <Button
          title="Cancel"
          onPress={() => navigation.goBack()}
          type="outline"
          containerStyle={styles.button}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    width: '45%',
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
});

export default AddEmployeeScreen;
