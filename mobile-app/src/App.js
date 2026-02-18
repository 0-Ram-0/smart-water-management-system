import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {StatusBar} from 'react-native';
import useAuthStore from './store/authStore';
import LoginScreen from './screens/LoginScreen';
import EngineerHomeScreen from './screens/Engineer/EngineerHomeScreen';
import TaskListScreen from './screens/Engineer/TaskListScreen';
import TaskDetailScreen from './screens/Engineer/TaskDetailScreen';
import TaskMapScreen from './screens/Engineer/TaskMapScreen';
import CitizenHomeScreen from './screens/Citizen/CitizenHomeScreen';
import ComplaintScreen from './screens/Citizen/ComplaintScreen';
import BillingScreen from './screens/Citizen/BillingScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const EngineerStack = () => (
  <Stack.Navigator screenOptions={{headerShown: false}}>
    <Stack.Screen name="Home" component={EngineerHomeScreen} />
    <Stack.Screen name="TaskList" component={TaskListScreen} />
    <Stack.Screen name="TaskDetail" component={TaskDetailScreen} />
    <Stack.Screen name="TaskMap" component={TaskMapScreen} />
  </Stack.Navigator>
);

function App() {
  const {isAuthenticated, role, loadUser} = useAuthStore();

  // Initialize auth state from storage
  useEffect(() => {
    loadUser();
  }, []);

  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" />
      <Stack.Navigator
        screenOptions={{headerShown: false}}
        initialRouteName={isAuthenticated && role === 'engineer' 
          ? 'EngineerStack' 
          : isAuthenticated && role === 'citizen'
          ? 'CitizenHome'
          : 'Login'}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="EngineerStack" component={EngineerStack} />
        <Stack.Screen name="CitizenHome" component={CitizenHomeScreen} />
        <Stack.Screen name="Complaint" component={ComplaintScreen} />
        <Stack.Screen name="Billing" component={BillingScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
