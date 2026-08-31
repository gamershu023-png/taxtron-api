import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Text, StyleSheet, View } from 'react-native';

import { HomeScreen } from './screens/HomeScreen';
import { AIScreen } from './screens/AIScreen';
import { ScanScreen } from './screens/ScanScreen';
import { ToolsScreen } from './screens/ToolsScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { ErrorBoundary } from './components/ErrorBoundary';
import { colors } from './theme';

export type BottomTabParamList = {
  Home: undefined;
  AI: undefined;
  Scan: undefined;
  Tools: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<BottomTabParamList>();

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  const glyphs: Record<string, string> = {
    Home: '⬡',
    AI: '◈',
    Scan: '◳',
    Tools: '⊞',
    Profile: '◉',
  };
  return (
    <Text style={[styles.tabIcon, { color: focused ? colors.primary : colors.textMuted }]}>
      {glyphs[label] || '●'}
    </Text>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <NavigationContainer>
          <StatusBar style="light" />
          <Tab.Navigator
            screenOptions={{
              headerShown: true,
              headerStyle: {
                backgroundColor: colors.background,
                borderBottomColor: colors.borderLight,
                borderBottomWidth: 1,
              },
              headerTintColor: colors.textMain,
              headerTitleStyle: {
                fontWeight: '700',
                fontSize: 16,
              },
              headerTitleAlign: 'center',
              tabBarStyle: {
                backgroundColor: colors.backgroundElevated,
                borderTopColor: colors.borderLight,
                borderTopWidth: 1,
                height: 60,
                paddingBottom: 4,
              },
              tabBarActiveTintColor: colors.primary,
              tabBarInactiveTintColor: colors.textMuted,
              tabBarLabelStyle: {
                fontSize: 11,
                fontWeight: '500',
              },
            }}
          >
            <Tab.Screen
              name="Home"
              component={HomeScreen}
              options={{ title: 'Home', tabBarIcon: ({ focused }) => <TabIcon label="Home" focused={focused} /> }}
            />
            <Tab.Screen
              name="AI"
              component={AIScreen}
              options={{ title: 'Taxtron AI', tabBarIcon: ({ focused }) => <TabIcon label="AI" focused={focused} /> }}
            />
            <Tab.Screen
              name="Scan"
              component={ScanScreen}
              options={{ title: 'Scan', tabBarIcon: ({ focused }) => <TabIcon label="Scan" focused={focused} /> }}
            />
            <Tab.Screen
              name="Tools"
              component={ToolsScreen}
              options={{ title: 'Tools', tabBarIcon: ({ focused }) => <TabIcon label="Tools" focused={focused} /> }}
            />
            <Tab.Screen
              name="Profile"
              component={ProfileScreen}
              options={{ title: 'Profile', tabBarIcon: ({ focused }) => <TabIcon label="Profile" focused={focused} /> }}
            />
          </Tab.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  tabIcon: {
    fontSize: 22,
    fontWeight: '400',
  },
});
