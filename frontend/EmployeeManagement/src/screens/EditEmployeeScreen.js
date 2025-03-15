import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Input, Button, Text } from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const EditEmployeeScreen = ({ route, navigation }) => {
  const { employee } = route.params;
  const [formData, setFormData] = useState({
    name: employee.name,
    email: employee.email,
    position: employee.position,
    department: employee.department,
    phone: employee.phone || '',
    hire_date: employee.hire_date || '',
  });
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.put(`http://localhost:3000/employees/${employee.id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigation.goBack();
    } catch (err) {
      setError('Failed to update employee');
    }
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <ScrollView style={styles.container}>
      <Text h4 style={styles.title}>Edit Employee</Text>
      
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
          title="Update Employee"
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

export default EditEmployeeScreen;
