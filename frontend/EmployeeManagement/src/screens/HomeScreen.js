import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, Alert } from 'react-native';
import { Button, ListItem, Icon, Text } from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_URL = 'http://localhost:3001';

const HomeScreen = ({ navigation }) => {
  const [employees, setEmployees] = useState([]);

  const fetchEmployees = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`${API_URL}/employees`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmployees(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch employees');
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    navigation.replace('Login');
  };

  const handleDelete = async (id) => {
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.delete(`${API_URL}/employees/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchEmployees();
    } catch (error) {
      Alert.alert('Error', 'Failed to delete employee');
    }
  };

  const renderItem = ({ item }) => (
    <ListItem bottomDivider>
      <ListItem.Content>
        <ListItem.Title>{item.name}</ListItem.Title>
        <ListItem.Subtitle>{item.position} - {item.department}</ListItem.Subtitle>
      </ListItem.Content>
      <Icon
        name="edit"
        type="material"
        onPress={() => navigation.navigate('EditEmployee', { employee: item })}
      />
      <Icon
        name="delete"
        type="material"
        color="red"
        onPress={() => {
          Alert.alert(
            'Delete Employee',
            'Are you sure you want to delete this employee?',
            [
              { text: 'Cancel' },
              { text: 'Delete', onPress: () => handleDelete(item.id) }
            ]
          );
        }}
      />
    </ListItem>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text h4>Employee List</Text>
        <Button
          title="Add Employee"
          onPress={() => navigation.navigate('AddEmployee')}
          containerStyle={styles.addButton}
        />
      </View>
      <FlatList
        data={employees}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
      />
      <Button
        title="Logout"
        onPress={handleLogout}
        containerStyle={styles.logoutButton}
        type="outline"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  addButton: {
    width: 120,
  },
  logoutButton: {
    marginTop: 20,
  },
});

export default HomeScreen;
