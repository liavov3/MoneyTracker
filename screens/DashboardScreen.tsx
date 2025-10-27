// screens/DashboardScreen.tsx
import React, { useMemo, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../App";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import useExpensesStore from "../store/useExpensesStore";
import ExpenseCard from "../components/ExpenseCard";
import { PieChart, BarChart } from "react-native-chart-kit";
import QuickAddPopup from "../components/QuickAddPopup";

type Nav = NativeStackNavigationProp<RootStackParamList, "Dashboard">;

const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { categories, expenses, thisMonthTotals, lastMonthTotals, addExpense } = useExpensesStore();

  // Bottom quick-add popup state
  const [quickAddVisible, setQuickAddVisible] = useState<boolean>(false);
  const [detectedAmount, setDetectedAmount] = useState<number>(0);

  // Simulate detection via button
  const simulatePayment = () => {
    // For demo, pick a nice-looking amount. You can randomize if you prefer.
    const amt = 12.99;
    setDetectedAmount(amt);
    setQuickAddVisible(true);
  };

  // Save an expense immediately when a category is chosen
  const handleSelectCategory = async (cat: { id?: number; name: string; color: string }) => {
    if (!cat.id) return;
    await addExpense({
      amount: detectedAmount,
      categoryId: cat.id,
      date: new Date().toISOString(),
      notes: "Quick add (simulated payment)",
    });
    setQuickAddVisible(false);
  };

  // Totals
  const thisMonthSum = useMemo(
    () => thisMonthTotals.reduce((acc, t) => acc + (t.total || 0), 0),
    [thisMonthTotals]
  );
  const lastMonthSum = useMemo(
    () => lastMonthTotals.reduce((acc, t) => acc + (t.total || 0), 0),
    [lastMonthTotals]
  );

  // Charts
  const chartWidth = Math.min(Dimensions.get("window").width - 24, 520);
  const chartConf = {
    backgroundColor: "#1E1E1E",
    backgroundGradientFrom: "#1E1E1E",
    backgroundGradientTo: "#1E1E1E",
    decimalPlaces: 2,
    color: (opacity = 1) => `rgba(255,255,255,${opacity})`,
    labelColor: () => "#BDBDBD",
    propsForLabels: {
      fontSize: 10,
    },
    style: { borderRadius: 16 },
    barPercentage: 0.5,
  };

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

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 12, paddingBottom: 120 }}>
        {/* Header */}
        <View
          style={{
            backgroundColor: "#0D0D0D",
            borderRadius: 16,
            padding: 16,
            borderWidth: 1,
            borderColor: "#2A2A2A",
            marginBottom: 12,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View>
            <Text style={{ color: "#9E9E9E" }}>Welcome back</Text>
            <Text style={{ color: "#FFFFFF", fontSize: 20, fontWeight: "800" }}>Money Saver</Text>
          </View>

          {/* Simulate payment button */}
          <TouchableOpacity
            onPress={simulatePayment}
            activeOpacity={0.85}
            style={{
              backgroundColor: "#6C63FF",
              paddingVertical: 10,
              paddingHorizontal: 14,
              borderRadius: 12,
            }}
          >
            <Text style={{ color: "#FFFFFF", fontWeight: "700" }}>Simulate Payment</Text>
          </TouchableOpacity>
        </View>

        {/* Monthly summary */}
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

        {/* Pie chart */}
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
          <Text style={{ color: "#FFFFFF", fontWeight: "700", marginBottom: 8 }}>This Month by Category</Text>
          {pieData.length > 0 ? (
            <PieChart
              width={chartWidth}
              height={220}
              data={pieData as any}
              accessor="population"
              backgroundColor="transparent"
              chartConfig={chartConf}
              hasLegend={false}
              paddingLeft="0"
              center={[0, 0]}
            />
          ) : (
            <Text style={{ color: "#9E9E9E" }}>No spending yet this month.</Text>
          )}
        </View>

        {/* Bar: this vs last */}
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
            yAxisLabel=""
            yAxisSuffix=""
            data={{
              labels: ["This", "Last"],
              datasets: [{ data: [thisMonthSum, lastMonthSum] }],
            }}
            style={{ borderRadius: 16 }}
          />
        </View>

        {/* Recent expenses */}
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
          {expenses.length === 0 ? (
            <Text style={{ color: "#9E9E9E" }}>No expenses yet.</Text>
          ) : (
            expenses.slice(0, 10).map((e) => {
              const cat = categories.find((c) => c.id === e.categoryId);
              return (
                <ExpenseCard
                  key={e.id ?? `${e.date}-${e.amount}`}
                  expense={e}
                  categoryName={cat?.name ?? "Unknown"}
                  accentColor={cat?.color ?? "#6C63FF"}
                />
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Add Expense FAB (unchanged) */}
      <TouchableOpacity
        onPress={() => navigation.navigate("AddExpense")}
        style={{
          position: "absolute",
          bottom: 24,
          right: 18,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: "#6C63FF",
          alignItems: "center",
          justifyContent: "center",
          elevation: 6,
          shadowColor: "#000",
          shadowOpacity: 0.3,
          shadowOffset: { width: 0, height: 6 },
          shadowRadius: 8,
        }}
        activeOpacity={0.8}
      >
        <Text style={{ color: "#FFFFFF", fontSize: 28, marginTop: -2 }}>＋</Text>
      </TouchableOpacity>

      {/* Quick Add Popup */}
      <QuickAddPopup
        visible={quickAddVisible}
        amount={detectedAmount}
        categories={categories}
        onSelectCategory={handleSelectCategory}
        onClose={() => setQuickAddVisible(false)}
      />
    </View>
  );
};

export default DashboardScreen;
