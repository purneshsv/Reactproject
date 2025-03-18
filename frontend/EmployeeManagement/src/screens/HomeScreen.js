import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Alert,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  RefreshControl,
  ScrollView,
} from 'react-native';
import {
  Button,
  Icon,
  Text,
  SearchBar,
  Chip,
  Overlay,
} from 'react-native-elements';
import MGLogo from '../components/MGLogo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {useFocusEffect} from '@react-navigation/native';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import * as Animatable from 'react-native-animatable';
import COLORS from '../theme/colors';

import {Linking} from 'react-native';
import styles from '../styles/HomeScreenStyles.js';
import {authAxios, removeToken} from '../utils/AuthUtils';

const API_URL = 'http://127.0.0.1:5001/api';

const HomeScreen = ({navigation}) => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [showDepartmentFilter, setShowDepartmentFilter] = useState(false);

  // Handle session expiration
  const handleSessionExpired = async (message = 'Session Expired') => {
    try {
      // Clear token
      await removeToken();
      // Set session expired flag for App.js to detect
      await AsyncStorage.setItem('sessionExpired', 'true');
      // Show alert and navigate to login
      Alert.alert('Session Expired', message, [
        {text: 'OK', onPress: () => navigation.replace('Login')},
      ]);
    } catch (error) {
      console.error('Error handling session expiration:', error);
      // Fallback direct navigation
      navigation.replace('Login');
    }
  };

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        // Handle missing token by redirecting to login
        await handleSessionExpired('No token found');
        return;
      }

      // Use our authAxios instance which handles token automatically
      const response = await authAxios.get(`/employees`);

      const processedEmployees = response.data.map(emp => ({
        ...emp,
        id: emp.id
          ? emp.id.toString()
          : `emp-${emp.name}-${Math.random().toString(36).substr(2, 9)}`,
      }));

      setEmployees(processedEmployees);
      setFilteredEmployees(processedEmployees);

      // Extract unique departments
      const uniqueDepartments = [
        ...new Set(processedEmployees.map(emp => emp.department)),
      ];
      setDepartments(uniqueDepartments.sort());

      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error('Error fetching employees:', error);
      
      if (error.response && error.response.status === 401) {
        await handleSessionExpired('Your session has expired');
      } else {
        Alert.alert('Error', 'Failed to load employees. Please try again.');
      }
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchEmployees();
    setRefreshing(false);
  }, []);



  useFocusEffect(
    useCallback(() => {
      fetchEmployees();
      return () => {};
    }, []),
  );

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    // Apply both search and department filters
    let filtered = employees;

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        emp =>
          emp.name.toLowerCase().includes(searchLower) ||
          emp.position.toLowerCase().includes(searchLower) ||
          emp.department.toLowerCase().includes(searchLower),
      );
    }

    // Apply department filter
    if (selectedDepartment) {
      filtered = filtered.filter(emp => emp.department === selectedDepartment);
    }

    setFilteredEmployees(filtered);
  }, [search, employees, selectedDepartment]);

  const handleLogout = async () => {
    try {
      // Always remove the token
      await AsyncStorage.removeItem('token');

      // Try to check Google Sign-In status, but don't let it fail the logout
      try {
        const isSignedIn = await GoogleSignin.isSignedIn();
        if (isSignedIn) {
          await GoogleSignin.revokeAccess();
          await GoogleSignin.signOut();
        }
      } catch (googleError) {
        // Continue with logout even if Google Sign-In operations fail
      }

      // Always navigate back to login screen
      navigation.replace('Login');
    } catch (error) {
      Alert.alert('Error', 'Logout failed');
    }
  };

  const handleDelete = useCallback(async id => {
    try {
      // Optimistically update UI first
      setEmployees(prev => prev.filter(emp => emp.id !== id));
      setFilteredEmployees(prev => prev.filter(emp => emp.id !== id));

      // Use authAxios which automatically includes the token
      await authAxios.delete(`/employees/${id}`);
      
      // Refresh the list to ensure data consistency
      fetchEmployees();
    } catch (error) {
      console.error('Error deleting employee:', error.response?.data || error.message);
      
      if (error.response?.status === 401) {
        await handleSessionExpired('Your session has expired');
      } else {
        Alert.alert('Error', 'Failed to delete employee: ' + (error.response?.data?.message || error.message));
        // Refresh the list to ensure data consistency
        fetchEmployees();
      }
    }
  }, [fetchEmployees, handleSessionExpired]);

  const handleDepartmentSelect = department => {
    setSelectedDepartment(
      department === selectedDepartment ? null : department,
    );
    setShowDepartmentFilter(false);
  };

  const toggleDepartmentFilter = () => {
    setShowDepartmentFilter(!showDepartmentFilter);
  };

  const renderItem = ({item, index}) => (
    <Animatable.View
      animation="fadeInUp"
      delay={index * 100}
      duration={800}
      style={styles.employeeItem}
      key={`employee-${item.id}-${index}`}>
      <View style={styles.employeeInfo}>
        <Text style={styles.employeeName}>{item.name}</Text>
        <Text style={styles.employeeDetails}>
          {item.position} • {item.department}
        </Text>
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.iconButton, styles.editButton]}
          onPress={() => navigation.navigate('EditEmployee', {employee: item})}>
          <Icon name="edit" type="material" color="#fff" size={20} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.iconButton, styles.deleteButton]}
          onPress={() => {
            Alert.alert(
              'Delete Employee',
              'Are you sure you want to delete this employee?',
              [
                {text: 'Cancel', style: 'cancel'},
                {
                  text: 'Delete',
                  onPress: () => handleDelete(item.id),
                  style: 'destructive',
                },
              ],
            );
          }}>
          <Icon name="delete" type="material" color="#fff" size={20} />
        </TouchableOpacity>
      </View>
    </Animatable.View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <View style={styles.container}>
        <Animatable.View
          animation="fadeInDown"
          duration={1000}
          style={styles.header}>
          <View style={styles.titleContainer}>
            <MGLogo size="medium" />
            <View style={styles.subtitleContainer}>
              <Text style={styles.subtitle}>Employee Management System</Text>
              <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}>
                <Icon name="logout" type="material" color="#ffffff" size={18} />
              </TouchableOpacity>
            </View>
          </View>
        </Animatable.View>

        <Animatable.View animation="fadeIn" delay={300} duration={1000}>
          <SearchBar
            placeholder="Search employees..."
            onChangeText={setSearch}
            value={search}
            containerStyle={styles.searchContainer}
            inputContainerStyle={styles.searchInputContainer}
            inputStyle={styles.searchInput}
            round
            lightTheme
          />
        </Animatable.View>

        <View style={styles.filterContainer}>
          <View style={styles.filterLabelContainer}>
            <Text style={styles.filterLabel}>Filter:</Text>
            {selectedDepartment && (
              <Chip
                title={selectedDepartment}
                icon={{
                  name: 'close',
                  type: 'material',
                  size: 16,
                  color: COLORS.textWhite,
                }}
                onPress={() => setSelectedDepartment(null)}
                buttonStyle={styles.activeFilterChip}
                titleStyle={styles.activeFilterChipText}
              />
            )}
          </View>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={toggleDepartmentFilter}>
            <Icon
              name="filter-list"
              type="material"
              color={COLORS.primary}
              size={24}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.listHeaderContainer}>
          <Text style={styles.listHeader}>Employee List</Text>
          <Animatable.View
            animation="pulse"
            iterationCount="infinite"
            duration={2000}>
            <TouchableOpacity
              style={styles.addButtonContainer}
              onPress={() => navigation.navigate('AddEmployee')}>
              <Icon
                name="add"
                type="material"
                color={COLORS.textWhite}
                size={24}
              />
            </TouchableOpacity>
          </Animatable.View>
        </View>

        {filteredEmployees.length === 0 ? (
          <Animatable.View
            animation="fadeIn"
            delay={500}
            style={styles.emptyContainer}>
            <Icon
              name="people"
              type="material"
              color={COLORS.textLight}
              size={80}
            />
            <Text h4 style={styles.emptyText}>
              No employees found
            </Text>
            <Text style={styles.emptySubText}>
              {employees.length > 0
                ? 'Try a different search term or filter'
                : 'Add your first employee to get started'}
            </Text>
          </Animatable.View>
        ) : (
          <FlatList
            data={filteredEmployees}
            renderItem={renderItem}
            keyExtractor={(item, index) =>
              `employee-list-item-${item.id}-${index}`
            }
            extraData={filteredEmployees}
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={COLORS.primary}
                colors={[COLORS.primary]}
              />
            }
          />
        )}
      </View>

      <Overlay
        isVisible={showDepartmentFilter}
        onBackdropPress={toggleDepartmentFilter}
        overlayStyle={styles.overlay}>
        <Text style={styles.overlayTitle}>Filter by Department</Text>
        <ScrollView style={styles.departmentList}>
          <TouchableOpacity
            style={[
              styles.departmentItem,
              !selectedDepartment && styles.selectedDepartment,
            ]}
            onPress={() => handleDepartmentSelect(null)}>
            <Text
              style={[
                styles.departmentText,
                !selectedDepartment && styles.selectedDepartmentText,
              ]}>
              All Departments
            </Text>
            {!selectedDepartment && (
              <Icon
                name="check"
                type="material"
                color={COLORS.primary}
                size={20}
              />
            )}
          </TouchableOpacity>
          {departments.map(department => (
            <TouchableOpacity
              key={department}
              style={[
                styles.departmentItem,
                selectedDepartment === department && styles.selectedDepartment,
              ]}
              onPress={() => handleDepartmentSelect(department)}>
              <Text
                style={[
                  styles.departmentText,
                  selectedDepartment === department &&
                    styles.selectedDepartmentText,
                ]}>
                {department}
              </Text>
              {selectedDepartment === department && (
                <Icon
                  name="check"
                  type="material"
                  color={COLORS.primary}
                  size={20}
                />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Overlay>
    </SafeAreaView>
  );
};

export default HomeScreen;
