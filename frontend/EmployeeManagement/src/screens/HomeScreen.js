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
import {Button, Icon, Text, SearchBar, Chip, Overlay} from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {useFocusEffect} from '@react-navigation/native';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import * as Animatable from 'react-native-animatable';
import COLORS from '../theme/colors';

const API_URL = 'http://localhost:3001';

const HomeScreen = ({navigation}) => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [showDepartmentFilter, setShowDepartmentFilter] = useState(false);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('No token found');

      const response = await axios.get(`${API_URL}/employees`, {
        headers: {Authorization: `Bearer ${token}`},
      });

      const processedEmployees = response.data.map(emp => ({
        ...emp,
        id: emp.id
          ? emp.id.toString()
          : `emp-${emp.name}-${Math.random().toString(36).substr(2, 9)}`,
      }));

      setEmployees(processedEmployees);
      setFilteredEmployees(processedEmployees);
      
      // Extract unique departments
      const uniqueDepartments = [...new Set(processedEmployees.map(emp => emp.department))];
      setDepartments(uniqueDepartments.sort());
      
      setLoading(false);
    } catch (error) {
      setLoading(false);
      Alert.alert('Session Expired', 'Please log in again', [
        {text: 'OK', onPress: () => navigation.replace('Login')},
      ]);
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
        console.log('Google sign out error (non-critical):', googleError);
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
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('No token found');

      setEmployees(prev => prev.filter(emp => emp.id !== id));
      setFilteredEmployees(prev => prev.filter(emp => emp.id !== id));

      await axios.delete(`${API_URL}/employees/${id}`, {
        headers: {Authorization: `Bearer ${token}`},
      });

      fetchEmployees();
    } catch (error) {
      Alert.alert('Error', 'Failed to delete employee');
      fetchEmployees();
    }
  }, []);

  const handleDepartmentSelect = (department) => {
    setSelectedDepartment(department === selectedDepartment ? null : department);
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
                  style: 'destructive'
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
        <Animatable.View animation="fadeInDown" duration={1000} style={styles.header}>
          <View style={styles.titleContainer}>
            <Text h4 style={styles.title}>MG HEALTH TECH</Text>
            <Text style={styles.subtitle}>Employee Management System</Text>
          </View>
          <TouchableOpacity
            style={styles.logoutIconButton}
            onPress={handleLogout}>
            <Icon name="logout" type="material" color={COLORS.textWhite} size={24} />
          </TouchableOpacity>
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
            <Icon name="filter-list" type="material" color={COLORS.primary} size={24} />
          </TouchableOpacity>
        </View>

        <View style={styles.listHeaderContainer}>
          <Text style={styles.listHeader}>Employee List</Text>
          <Animatable.View animation="pulse" iterationCount="infinite" duration={2000}>
            <TouchableOpacity
              style={styles.addButtonContainer}
              onPress={() => navigation.navigate('AddEmployee')}>
              <Icon name="add" type="material" color={COLORS.textWhite} size={24} />
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
            <Text style={[
              styles.departmentText,
              !selectedDepartment && styles.selectedDepartmentText,
            ]}>All Departments</Text>
            {!selectedDepartment && (
              <Icon name="check" type="material" color={COLORS.primary} size={20} />
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
              <Text style={[
                styles.departmentText,
                selectedDepartment === department && styles.selectedDepartmentText,
              ]}>{department}</Text>
              {selectedDepartment === department && (
                <Icon name="check" type="material" color={COLORS.primary} size={20} />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Overlay>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 10,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    color: COLORS.primary,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    marginBottom: 4,
    textShadowColor: 'rgba(0, 161, 154, 0.3)',
    textShadowOffset: {width: 0, height: 0},
    textShadowRadius: 5,
  },
  subtitle: {
    color: COLORS.secondary,
    fontSize: 14,
  },
  searchContainer: {
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    borderBottomWidth: 0,
    paddingHorizontal: 0,
    marginBottom: 10,
  },
  searchInputContainer: {
    backgroundColor: COLORS.backgroundDark,
    borderRadius: 10,
    height: 40,
  },
  searchInput: {
    color: COLORS.text,
    fontSize: 14,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  filterLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  filterLabel: {
    color: COLORS.secondary,
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 10,
  },
  filterButton: {
    padding: 5,
  },
  activeFilterChip: {
    backgroundColor: COLORS.primary,
    marginRight: 5,
  },
  activeFilterChipText: {
    color: COLORS.textWhite,
    fontSize: 12,
  },
  listHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  listHeader: {
    color: COLORS.secondary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  addButtonContainer: {
    backgroundColor: COLORS.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  listContent: {
    paddingBottom: 20,
  },
  employeeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: COLORS.card,
    borderRadius: 10,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
    shadowColor: COLORS.shadow,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  employeeInfo: {
    flex: 1,
  },
  employeeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  employeeDetails: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  editButton: {
    backgroundColor: COLORS.primary,
  },
  deleteButton: {
    backgroundColor: COLORS.error,
  },
  separator: {
    height: 0,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 50,
  },
  emptyText: {
    color: COLORS.secondary,
    marginTop: 20,
    textAlign: 'center',
  },
  emptySubText: {
    color: COLORS.textLight,
    marginTop: 10,
    textAlign: 'center',
    fontSize: 14,
  },
  logoutIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    width: '80%',
    maxHeight: '70%',
    borderRadius: 10,
    padding: 20,
  },
  overlayTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 15,
    textAlign: 'center',
  },
  departmentList: {
    maxHeight: 300,
  },
  departmentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  selectedDepartment: {
    backgroundColor: 'rgba(0, 161, 154, 0.1)',
  },
  departmentText: {
    fontSize: 16,
    color: COLORS.text,
  },
  selectedDepartmentText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
