import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { RootStackParamList } from "../App";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import useExpensesStore from "../store/useExpensesStore";
import { updateExpense, deleteExpense } from "../services/ExpenseService";

type EditExpenseScreenRouteProp = RouteProp<RootStackParamList, "EditExpense">;
type Nav = NativeStackNavigationProp<RootStackParamList, "EditExpense">;

const EditExpenseScreen: React.FC = () => {
  const route = useRoute<EditExpenseScreenRouteProp>();
  const navigation = useNavigation<Nav>();
  const { expense } = route.params;
  const { categories, loadInitialData } = useExpensesStore();

  const [amount, setAmount] = useState(String(expense.amount));
  const [selectedCategory, setSelectedCategory] = useState(expense.categoryId);
  const [date, setDate] = useState(expense.date.split("T")[0]);
  const [time, setTime] = useState(
    expense.date.split("T")[1]?.substring(0, 5) ?? "12:00"
  );
  const [notes, setNotes] = useState(expense.notes || "");

  const handleSave = async () => {
    const updatedDate = `${date}T${time}:00`;
    await updateExpense(expense.id, {
      amount: parseFloat(amount),
      categoryId: selectedCategory,
      date: updatedDate,
      notes,
    });
    await loadInitialData();
    navigation.goBack();
  };

  const handleDelete = async () => {
    Alert.alert("Delete Expense", "Are you sure you want to delete this expense?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteExpense(expense.id);
          await loadInitialData();
          navigation.goBack();
        },
      },
    ]);
  };

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: "#0D0D0D",
        padding: 16,
      }}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      <Text
        style={{
          color: "#FFFFFF",
          fontSize: 22,
          fontWeight: "800",
          marginBottom: 20,
        }}
      >
        Edit Expense
      </Text>

      {/* Amount */}
      <Text style={{ color: "#BDBDBD", marginBottom: 6 }}>Amount</Text>
      <TextInput
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        style={{
          backgroundColor: "#1E1E1E",
          color: "#FFFFFF",
          borderRadius: 10,
          padding: 10,
          marginBottom: 14,
          borderWidth: 1,
          borderColor: "#2A2A2A",
        }}
      />

      {/* Category */}
      <Text style={{ color: "#BDBDBD", marginBottom: 6 }}>Category</Text>
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 10,
          marginBottom: 14,
        }}
      >
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            onPress={() => setSelectedCategory(cat.id)}
            activeOpacity={0.8}
            style={{
              backgroundColor:
                selectedCategory === cat.id ? "#6C63FF" : "#1E1E1E",
              borderRadius: 12,
              paddingVertical: 10,
              paddingHorizontal: 14,
              borderWidth: 1,
              borderColor:
                selectedCategory === cat.id ? "#6C63FF" : "#2A2A2A",
            }}
          >
            <Text style={{ color: "#FFFFFF", fontWeight: "600" }}>
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Date */}
      <Text style={{ color: "#BDBDBD", marginBottom: 6 }}>Date</Text>
      <TextInput
        value={date}
        onChangeText={setDate}
        placeholder="YYYY-MM-DD"
        style={{
          backgroundColor: "#1E1E1E",
          color: "#FFFFFF",
          borderRadius: 10,
          padding: 10,
          marginBottom: 14,
          borderWidth: 1,
          borderColor: "#2A2A2A",
        }}
      />

      {/* Time */}
      <Text style={{ color: "#BDBDBD", marginBottom: 6 }}>Time</Text>
      <TextInput
        value={time}
        onChangeText={setTime}
        placeholder="HH:MM"
        style={{
          backgroundColor: "#1E1E1E",
          color: "#FFFFFF",
          borderRadius: 10,
          padding: 10,
          marginBottom: 14,
          borderWidth: 1,
          borderColor: "#2A2A2A",
        }}
      />

      {/* Notes */}
      <Text style={{ color: "#BDBDBD", marginBottom: 6 }}>Note</Text>
      <TextInput
        value={notes}
        onChangeText={setNotes}
        placeholder="Enter note..."
        multiline
        style={{
          backgroundColor: "#1E1E1E",
          color: "#FFFFFF",
          borderRadius: 10,
          padding: 10,
          minHeight: 80,
          textAlignVertical: "top",
          borderWidth: 1,
          borderColor: "#2A2A2A",
          marginBottom: 24,
        }}
      />

      {/* Buttons */}
      <TouchableOpacity
        onPress={handleSave}
        activeOpacity={0.85}
        style={{
          backgroundColor: "#6C63FF",
          borderRadius: 12,
          paddingVertical: 14,
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 16 }}>
          Save
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleDelete}
        activeOpacity={0.85}
        style={{
          backgroundColor: "#E53935",
          borderRadius: 12,
          paddingVertical: 14,
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 16 }}>
          Delete
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={{
          paddingVertical: 12,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#BDBDBD", fontWeight: "600", fontSize: 15 }}>
          Cancel
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default EditExpenseScreen;
