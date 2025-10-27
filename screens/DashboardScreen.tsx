import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
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
  const { categories, expenses, addExpense } = useExpensesStore();
  const { width } = useWindowDimensions();

  // Quick add popup
  const [quickAddVisible, setQuickAddVisible] = useState(false);
  const [detectedAmount, setDetectedAmount] = useState(0);

  const simulatePayment = () => {
    const amt = 12.99;
    setDetectedAmount(amt);
    setQuickAddVisible(true);
  };

  const handleSelectCategory = async (cat: {
    id: number;
    name: string;
    color: string;
  }) => {
    if (!cat) return;
    await addExpense({
      amount: detectedAmount,
      category_id: cat.id,
      date: new Date().toISOString(),
      notes: "Quick add (simulated payment)",
    });
    setQuickAddVisible(false);
  };

  // Filter current and previous month expenses
  const now = new Date();
  const thisMonthExpenses = expenses.filter((e) => {
    const d = new Date(e.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const lastMonthExpenses = expenses.filter((e) => {
    const d = new Date(e.date);
    const lastMonth = new Date();
    lastMonth.setMonth(now.getMonth() - 1);
    return d.getMonth() === lastMonth.getMonth() && d.getFullYear() === lastMonth.getFullYear();
  });

  const thisMonthTotal = thisMonthExpenses.reduce((acc, e) => acc + (e.amount || 0), 0);
  const lastMonthTotal = lastMonthExpenses.reduce((acc, e) => acc + (e.amount || 0), 0);

  const chartWidth = Math.min(width - 24, 520);
  const chartConfig = {
    backgroundColor: "#1E1E1E",
    backgroundGradientFrom: "#1E1E1E",
    backgroundGradientTo: "#1E1E1E",
    decimalPlaces: 2,
    color: (opacity = 1) => `rgba(255,255,255,${opacity})`,
    labelColor: () => "#BDBDBD",
    style: { borderRadius: 16 },
    barPercentage: 0.5,
  };

  // Pie chart data (by category)
  const categoryTotals = useMemo(() => {
    return categories.map((cat) => {
      const total = thisMonthExpenses
        .filter((e) => e.category_id === cat.id)
        .reduce((sum, e) => sum + e.amount, 0);
      return { name: cat.name, color: cat.color, total };
    });
  }, [categories, thisMonthExpenses]);

  const totalSpending = categoryTotals.reduce((acc, c) => acc + c.total, 0);

  const pieData = categoryTotals
    .filter((c) => c.total > 0)
    .map((c) => ({
      name: c.name,
      population: c.total,
      color: c.color,
      legendFontColor: "#BDBDBD",
      legendFontSize: 12,
    }));

  const legendItems = categoryTotals
    .filter((c) => c.total > 0)
    .map((c) => ({
      name: c.name,
      percent: ((c.total / (totalSpending || 1)) * 100).toFixed(1),
      color: c.color,
    }));

  const isWide = width > 600;

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{
          padding: 12,
          paddingBottom: 120,
        }}
      >
        {/* Header row */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <Text
            style={{
              color: "#FFFFFF",
              fontSize: 22,
              fontWeight: "700",
            }}
          >
            Money Saver
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("Categories")}
            style={{
              backgroundColor: "#6C63FF",
              paddingVertical: 8,
              paddingHorizontal: 16,
              borderRadius: 12,
            }}
          >
            <Text style={{ color: "#FFFFFF", fontWeight: "700" }}>Manage</Text>
          </TouchableOpacity>
        </View>

        {/* Spending Summary */}
        <Text
          style={{
            color: "#FFFFFF",
            fontSize: 16,
            fontWeight: "700",
            marginBottom: 8,
          }}
        >
          This Month vs Last Month
        </Text>
        <BarChart
          data={{
            labels: ["This Month", "Last Month"],
            datasets: [
              {
                data: [thisMonthTotal || 0, lastMonthTotal || 0],
              },
            ],
          }}
          width={chartWidth}
          height={220}
          chartConfig={chartConfig}
          style={{ borderRadius: 16, marginBottom: 20 }}
          fromZero
          showValuesOnTopOfBars
        />

        {/* Pie Chart */}
        <Text
          style={{
            color: "#FFFFFF",
            fontSize: 16,
            fontWeight: "700",
            marginBottom: 8,
          }}
        >
          Spending by Category
        </Text>

        {pieData.length > 0 ? (
          <>
            <PieChart
              data={pieData}
              width={chartWidth}
              height={220}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="16"
              absolute
            />
            <View style={{ marginTop: 12 }}>
              {legendItems.map((item, i) => (
                <View
                  key={i}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 6,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <View
                      style={{
                        width: 14,
                        height: 14,
                        borderRadius: 7,
                        backgroundColor: item.color,
                      }}
                    />
                    <Text style={{ color: "#FFFFFF" }}>{item.name}</Text>
                  </View>
                  <Text style={{ color: "#BDBDBD" }}>{item.percent}%</Text>
                </View>
              ))}
            </View>
          </>
        ) : (
          <Text style={{ color: "#9E9E9E" }}>No data yet for this month.</Text>
        )}

        {/* Recent Expenses */}
        <View style={{ marginTop: 20 }}>
          <Text
            style={{
              color: "#FFFFFF",
              fontWeight: "700",
              marginBottom: 8,
            }}
          >
            Recent Expenses
          </Text>
          {expenses.length === 0 ? (
            <Text style={{ color: "#9E9E9E" }}>No expenses yet.</Text>
          ) : (
            expenses.slice(0, 5).map((e) => {
              const cat = categories.find((c) => c.id === e.category_id);
              return (
                <ExpenseCard
                  key={e.id}
                  expense={e}
                  categoryName={cat?.name ?? "Unknown"}
                  accentColor={cat?.color ?? "#6C63FF"}
                />
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Floating Button */}
      <TouchableOpacity
        onPress={() => navigation.navigate("AddExpense")}
        style={{
          position: "absolute",
          right: 20,
          bottom: 30,
          backgroundColor: "#6C63FF",
          borderRadius: 50,
          width: 60,
          height: 60,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ color: "#FFFFFF", fontSize: 26, fontWeight: "bold" }}>+</Text>
      </TouchableOpacity>

      {/* Quick Add Popup */}
      <QuickAddPopup
        visible={quickAddVisible}
        amount={detectedAmount}
        categories={categories}
        onSelectCategory={handleSelectCategory as unknown as (category: any) => void}
        onClose={() => setQuickAddVisible(false)}
      />
    </View>
  );
};

export default DashboardScreen;
