import React, { useMemo, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Platform } from "react-native";
import { useNavigation } from "@react-navigation/native";
import DateTimePicker, { Event as DTEvent } from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import useExpensesStore from "../store/useExpensesStore";

/**
 * Modal screen to create a new expense.
 * Fields:
 *  - amount (number)
 *  - category (dropdown)
 *  - date (picker)
 *  - notes (string)
 */
const AddExpenseScreen: React.FC = () => {
  const navigation = useNavigation();
  const { categories, addExpense } = useExpensesStore();

  const [amount, setAmount] = useState<string>("");
  const [categoryId, setCategoryId] = useState<number | undefined>(categories[0]?.id);
  const [date, setDate] = useState<Date>(new Date());
  const [showDate, setShowDate] = useState<boolean>(Platform.OS === "ios"); // On iOS show inline
  const [notes, setNotes] = useState<string>("");

  const canSave = useMemo(
    () => !!categoryId && !!amount && !isNaN(Number(amount)) && Number(amount) > 0,
    [categoryId, amount]
  );

  const onChangeDate = (_: DTEvent, selected?: Date) => {
    if (selected) setDate(selected);
    if (Platform.OS !== "ios") setShowDate(false);
  };

  const handleSave = async () => {
    if (!canSave || !categoryId) return;
    await addExpense({
      amount: Number(amount),
      categoryId,
      date: date.toISOString(),
      notes: notes.trim() || undefined,
    });
    navigation.goBack();
  };

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: "#121212" }}>
      {/* Amount */}
      <View style={{ marginBottom: 12 }}>
        <Text style={{ color: "#FFFFFF", marginBottom: 6 }}>Amount</Text>
        <TextInput
          placeholder="e.g. 23.50"
          placeholderTextColor="#666"
          keyboardType="decimal-pad"
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
          }}
        />
      </View>

      {/* Category */}
      <View style={{ marginBottom: 12 }}>
        <Text style={{ color: "#FFFFFF", marginBottom: 6 }}>Category</Text>
        <View
          style={{
            borderRadius: 12,
            overflow: "hidden",
            borderWidth: 1,
            borderColor: "#2A2A2A",
            backgroundColor: "#1E1E1E",
          }}
        >
          <Picker
            selectedValue={categoryId}
            onValueChange={(v) => setCategoryId(v)}
            dropdownIconColor="#BDBDBD"
            style={{ color: "#fff" }}
          >
            {categories.map((c) => (
              <Picker.Item key={c.id} label={c.name} value={c.id} color="#fff" />
            ))}
          </Picker>
        </View>
      </View>

      {/* Date */}
      <View style={{ marginBottom: 12 }}>
        <Text style={{ color: "#FFFFFF", marginBottom: 6 }}>Date</Text>
        {Platform.OS !== "ios" ? (
          <TouchableOpacity
            onPress={() => setShowDate(true)}
            style={{
              backgroundColor: "#1E1E1E",
              borderRadius: 12,
              paddingHorizontal: 12,
              paddingVertical: 12,
              borderWidth: 1,
              borderColor: "#2A2A2A",
            }}
          >
            <Text style={{ color: "#fff" }}>
              {date.toLocaleString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </TouchableOpacity>
        ) : null}
        {showDate && (
          <DateTimePicker
            value={date}
            mode="datetime"
            onChange={onChangeDate}
            textColor="#fff"
            themeVariant="dark"
          />
        )}
      </View>

      {/* Notes */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ color: "#FFFFFF", marginBottom: 6 }}>Notes</Text>
        <TextInput
          placeholder="Optional note (e.g., Lunch with friends)"
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
            minHeight: 80,
            borderWidth: 1,
            borderColor: "#2A2A2A",
          }}
        />
      </View>

      {/* Actions */}
      <View style={{ flexDirection: "row", gap: 12 }}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{
            flex: 1,
            backgroundColor: "#2A2A2A",
            paddingVertical: 14,
            borderRadius: 12,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#FFFFFF", fontWeight: "600" }}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleSave}
          disabled={!canSave}
          style={{
            flex: 1,
            backgroundColor: canSave ? "#6C63FF" : "#3A3A3A",
            paddingVertical: 14,
            borderRadius: 12,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#FFFFFF", fontWeight: "700" }}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AddExpenseScreen;
