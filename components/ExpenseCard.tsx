import React from "react";
import { View, Text } from "react-native";
import { Expense } from "../services/ExpenseService";

/**
 * Small card to render a single expense line.
 * - Shows category name (provided by parent), amount, date, and optional notes.
 */
interface ExpenseCardProps {
  expense: Expense;
  categoryName: string;
  accentColor?: string;
}

const ExpenseCard: React.FC<ExpenseCardProps> = ({ expense, categoryName, accentColor = "#6C63FF" }) => {
  const date = new Date(expense.date);
  const pretty = date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <View
      style={{
        backgroundColor: "#1E1E1E",
        borderRadius: 14,
        padding: 12,
        marginVertical: 6,
        borderWidth: 1,
        borderColor: "#2A2A2A",
      }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
        <Text style={{ color: "#FFFFFF", fontWeight: "600" }}>{categoryName}</Text>
        <Text style={{ color: accentColor, fontWeight: "700" }}>${expense.amount.toFixed(2)}</Text>
      </View>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text style={{ color: "#9E9E9E" }}>{pretty}</Text>
        {expense.notes ? <Text style={{ color: "#BDBDBD" }} numberOfLines={1}>{expense.notes}</Text> : null}
      </View>
    </View>
  );
};

export default ExpenseCard;
