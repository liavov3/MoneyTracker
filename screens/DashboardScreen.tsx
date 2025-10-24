import React, { useMemo } from "react";
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from "react-native";
import { useNavigation, useTheme } from "@react-navigation/native";
import { RootStackParamList } from "../App";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import useExpensesStore from "../store/useExpensesStore";
import ExpenseCard from "../components/ExpenseCard";
import { PieChart, BarChart } from "react-native-chart-kit";

/**
 * Dashboard:
 * - Total spending summary (this month)
 * - Pie chart: distribution by category (this month)
 * - Bar chart: this month vs last month total
 * - Recent expenses list
 * - Floating "+" button to open Add Expense modal
 * - Header button to manage categories
 */
type Nav = NativeStackNavigationProp<RootStackParamList, "Dashboard">;

const chartWidth = Math.min(Dimensions.get("window").width - 24, 640);
const chartConf = {
  backgroundGradientFrom: "#1E1E1E",
  backgroundGradientTo: "#1E1E1E",
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(255,255,255,${opacity})`,
  labelColor: (opacity = 1) => `rgba(189,189,189,${opacity})`,
  barPercentage: 0.6,
};

const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const theme = useTheme();
  const { categories, expenses, thisMonthTotals, lastMonthTotals } = useExpensesStore();

  // Sum totals for "this vs last" month bar
  const thisMonthSum = useMemo(
    () => thisMonthTotals.reduce((acc, t) => acc + (t.total || 0), 0),
    [thisMonthTotals]
  );
  const lastMonthSum = useMemo(
    () => lastMonthTotals.reduce((acc, t) => acc + (t.total || 0), 0),
    [lastMonthTotals]
  );

  // Pie data: filter out zero slices for a clean chart
  const pieData = useMemo(
    () =>
      thisMonthTotals
        .filter((t) => t.total > 0)
        .map((t) => ({
          name: t.categoryName,
          population: t.total,
          color: t.color,
          legendFontColor: "#BDBDBD",
          legendFontSize: 12,
        })),
    [thisMonthTotals]
  );

  // Map recent expenses with category names
  const recent = useMemo(() => expenses.slice(0, 8), [expenses]);
  const categoryMap = useMemo(
    () => new Map(categories.map((c) => [c.id!, c])),
    [categories]
  );

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => navigation.navigate("Categories")} hitSlop={12}>
          <Text style={{ color: theme.colors.primary, fontWeight: "600" }}>Manage</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 12, paddingBottom: 120 }}>
        {/* Total summary */}
        <View
          style={{
            backgroundColor: "#1E1E1E",
            borderRadius: 16,
            padding: 16,
            borderWidth: 1,
            borderColor: "#2A2A2A",
            marginBottom: 12,
          }}
        >
          <Text style={{ color: "#9E9E9E", marginBottom: 6 }}>This Month's Spending</Text>
          <Text style={{ color: "#FFFFFF", fontSize: 28, fontWeight: "800" }}>
            ${thisMonthSum.toFixed(2)}
          </Text>
        </View>

        {/* Pie Chart: Category distribution */}
        <View
          style={{
            backgroundColor: "#1E1E1E",
            borderRadius: 16,
            padding: 12,
            borderWidth: 1,
            borderColor: "#2A2A2A",
            marginBottom: 12,
          }}
        >
          <Text style={{ color: "#FFFFFF", fontWeight: "700", marginBottom: 8 }}>
            Spending by Category
          </Text>
          {pieData.length > 0 ? (
            <PieChart
              data={pieData}
              width={chartWidth}
              height={220}
              accessor={"population"}
              chartConfig={chartConf}
              paddingLeft={"8"}
              absolute
              backgroundColor={"transparent"}
            />
          ) : (
            <Text style={{ color: "#9E9E9E" }}>No spending yet this month.</Text>
          )}
        </View>

        {/* Bar Chart: This vs Last Month */}
        <View
          style={{
            backgroundColor: "#1E1E1E",
            borderRadius: 16,
            padding: 12,
            borderWidth: 1,
            borderColor: "#2A2A2A",
            marginBottom: 12,
          }}
        >
          <Text style={{ color: "#FFFFFF", fontWeight: "700", marginBottom: 8 }}>
            This Month vs Last Month
          </Text>
          <BarChart
            width={chartWidth}
            height={220}
            fromZero
            withInnerLines={false}
            chartConfig={chartConf}
            backgroundColor={"transparent"}
            data={{
              labels: ["This", "Last"],
              datasets: [{ data: [thisMonthSum, lastMonthSum] }],
            }}
            style={{ borderRadius: 12 }}
          />
        </View>

        {/* Recent expenses list */}
        <View
          style={{
            backgroundColor: "#1E1E1E",
            borderRadius: 16,
            padding: 12,
            borderWidth: 1,
            borderColor: "#2A2A2A",
            marginBottom: 12,
          }}
        >
          <Text style={{ color: "#FFFFFF", fontWeight: "700", marginBottom: 8 }}>
            Recent Expenses
          </Text>
          {recent.length === 0 ? (
            <Text style={{ color: "#9E9E9E" }}>No expenses recorded yet.</Text>
          ) : (
            recent.map((e) => (
              <ExpenseCard
                key={e.id}
                expense={e}
                categoryName={categoryMap.get(e.categoryId)?.name ?? "Unknown"}
                accentColor={categoryMap.get(e.categoryId)?.color ?? "#6C63FF"}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* Floating action button: Add Expense */}
      <TouchableOpacity
        onPress={() => navigation.navigate("AddExpense")}
        style={{
          position: "absolute",
          right: 16,
          bottom: 24,
          backgroundColor: "#6C63FF",
          width: 56,
          height: 56,
          borderRadius: 28,
          alignItems: "center",
          justifyContent: "center",
          elevation: 4,
          shadowColor: "#000",
          shadowOpacity: 0.3,
          shadowOffset: { width: 0, height: 6 },
          shadowRadius: 8,
        }}
        activeOpacity={0.8}
      >
        <Text style={{ color: "#FFFFFF", fontSize: 28, marginTop: -2 }}>＋</Text>
      </TouchableOpacity>
    </View>
  );
};

export default DashboardScreen;
