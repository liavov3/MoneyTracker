import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer, DefaultTheme, DarkTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import DashboardScreen from "./screens/DashboardScreen";
import CategoryManagerScreen from "./screens/CategoryManagerScreen";
import AddExpenseScreen from "./screens/AddExpenseScreen";
import { initializeDatabase } from "./db/database";
import useExpensesStore from "./store/useExpensesStore";

/**
 * Root stack param list for type-safe navigation.
 */
export type RootStackParamList = {
  Dashboard: undefined;
  Categories: undefined;
  AddExpense: undefined; // This screen is presented as a modal
};

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * App entry point.
 * - Initializes SQLite database.
 * - Loads categories & expenses into Zustand store.
 * - Sets up React Navigation with a dark, modern theme.
 */
export default function App() {
  const loadInitialData = useExpensesStore((s) => s.loadInitialData);

  useEffect(() => {
    (async () => {
      await initializeDatabase();
      await loadInitialData();
    })();
  }, []);

  const moneySaverDarkTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: "#121212",
      card: "#1E1E1E",
      text: "#FFFFFF",
      primary: "#6C63FF",
      border: "#2A2A2A",
      notification: "#00BFA6",
    },
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer theme={moneySaverDarkTheme}>
          <StatusBar style="light" />
          <Stack.Navigator
            initialRouteName="Dashboard"
            screenOptions={{
              headerStyle: { backgroundColor: "#1E1E1E" },
              headerTintColor: "#fff",
              contentStyle: { backgroundColor: "#121212" },
            }}
          >
            <Stack.Screen
              name="Dashboard"
              component={DashboardScreen}
              options={{ title: "Money Saver" }}
            />
            <Stack.Screen
              name="Categories"
              component={CategoryManagerScreen}
              options={{ title: "Categories" }}
            />
            {/* Modal presentation for Add Expense */}
            <Stack.Screen
              name="AddExpense"
              component={AddExpenseScreen}
              options={{ title: "Add Expense", presentation: "modal" }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
