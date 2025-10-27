import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
} from "react-native";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { useNavigation } from "@react-navigation/native";
import useExpensesStore from "../store/useExpensesStore";

/**
 * AddExpenseScreen:
 * Allows user to add a new expense with amount, category, date, and notes.
 * - Uses KeyboardAvoidingView to keep inputs visible
 * - Uses Zustand store to insert into SQLite and refresh data
 */
const AddExpenseScreen: React.FC = () => {
  const navigation = useNavigation();
  const { categories, addExpense } = useExpensesStore();

  const [amount, setAmount] = useState<string>("");
  const [categoryId, setCategoryId] = useState<number | undefined>(categories[0]?.id);
  const [date, setDate] = useState<Date>(new Date());
  const [showDate, setShowDate] = useState<boolean>(Platform.OS === "ios");
  const [notes, setNotes] = useState<string>("");

  const canSave = useMemo(
    () =>
      !!categoryId &&
      !isNaN(Number(amount)) &&
      Number(amount) > 0,
    [categoryId, amount]
  );

  const onChangeDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (selectedDate) setDate(selectedDate);
    if (Platform.OS !== "ios") setShowDate(false);
  };

  const handleSave = async () => {
    try {
      await addExpense({
        amount: parseFloat(amount),
        category_id: categoryId!, // ✅ Correct field name for DB
        date: date.toISOString(),
        notes: notes.trim() || undefined,
      });
      navigation.goBack();
    } catch (err) {
      console.error("Failed to save expense:", err);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          style={{ flex: 1, backgroundColor: "#121212" }}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        >
          {/* Title */}
          <Text
            style={{
              color: "#FFFFFF",
              fontSize: 22,
              fontWeight: "700",
              marginBottom: 16,
            }}
          >
            Add Expense
          </Text>

          {/* Amount */}
          <Text style={{ color: "#9E9E9E", marginBottom: 6 }}>Amount</Text>
          <TextInput
            placeholder="Enter amount"
            placeholderTextColor="#666"
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
            style={{
              backgroundColor: "#1E1E1E",
              borderRadius: 12,
              paddingHorizontal: 12,
              paddingVertical: 12,
              color: "#fff",
              borderWidth: 1,
              borderColor: "#2A2A2A",
              marginBottom: 16,
            }}
          />

          {/* Category */}
          <Text style={{ color: "#9E9E9E", marginBottom: 6 }}>Category</Text>
          <View
            style={{
              backgroundColor: "#1E1E1E",
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "#2A2A2A",
              marginBottom: 16,
            }}
          >
            <Picker
              selectedValue={categoryId}
              onValueChange={(value) => setCategoryId(Number(value))}
              dropdownIconColor="#fff"
              style={{ color: "#fff" }}
            >
              {categories.map((c) => (
                <Picker.Item key={c.id} label={c.name} value={c.id} color={c.color} />
              ))}
            </Picker>
          </View>

          {/* Date */}
          <Text style={{ color: "#9E9E9E", marginBottom: 6 }}>Date</Text>
          {Platform.OS === "ios" ? (
            <DateTimePicker value={date} mode="date" onChange={onChangeDate} />
          ) : (
            <TouchableOpacity
              onPress={() => setShowDate(true)}
              style={{
                backgroundColor: "#1E1E1E",
                borderRadius: 12,
                paddingHorizontal: 12,
                paddingVertical: 14,
                borderWidth: 1,
                borderColor: "#2A2A2A",
                marginBottom: 16,
              }}
            >
              <Text style={{ color: "#fff" }}>{date.toDateString()}</Text>
            </TouchableOpacity>
          )}
          {showDate && Platform.OS !== "ios" && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={onChangeDate}
            />
          )}

          {/* Notes */}
          <Text style={{ color: "#9E9E9E", marginBottom: 6 }}>Notes</Text>
          <TextInput
            placeholder="Optional note"
            placeholderTextColor="#666"
            value={notes}
            onChangeText={setNotes}
            multiline
            style={{
              backgroundColor: "#1E1E1E",
              borderRadius: 12,
              paddingHorizontal: 12,
              paddingVertical: 12,
              color: "#fff",
              borderWidth: 1,
              borderColor: "#2A2A2A",
              marginBottom: 24,
            }}
          />

          {/* Save Button */}
          <TouchableOpacity
            onPress={handleSave}
            disabled={!canSave}
            style={{
              backgroundColor: canSave ? "#6C63FF" : "#3A3A3A",
              paddingVertical: 16,
              borderRadius: 12,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "700" }}>Save Expense</Text>
          </TouchableOpacity>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default AddExpenseScreen;
