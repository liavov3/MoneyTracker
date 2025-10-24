import React, { useMemo, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, ToastAndroid, Platform, Alert } from "react-native";
import useExpensesStore from "../store/useExpensesStore";

/**
 * Utility to generate random hex color for new categories.
 */
const randomHex = () =>
  "#" + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, "0");

/**
 * CategoryManagerScreen:
 * - Lists all categories
 * - Allows adding new category to SQLite
 * - Shows toast feedback on success
 */
const CategoryManagerScreen: React.FC = () => {
  const { categories, addCategory, loadInitialData } = useExpensesStore();

  const [name, setName] = useState<string>("");
  const [color, setColor] = useState<string>(randomHex());
  const [loading, setLoading] = useState<boolean>(false);

  const canAdd = useMemo(() => name.trim().length >= 2, [name]);

  /**
   * Adds a new category:
   * - Saves to DB
   * - Refreshes categories
   * - Clears form
   * - Shows success toast
   */
  const handleAdd = async () => {
    if (!canAdd) return;
    try {
      setLoading(true);
      await addCategory({ name: name.trim(), color });
      // Refresh categories from DB
      await loadInitialData();
      // Clear inputs
      setName("");
      setColor(randomHex());
      // Show success feedback
      if (Platform.OS === "android") {
        ToastAndroid.show("Category added!", ToastAndroid.SHORT);
      } else {
        Alert.alert("Success", "Category added successfully!");
      }
    } catch (err) {
      console.error("Failed to add category:", err);
      Alert.alert("Error", "Failed to add category. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 12 }}>
      {/* Add Category Section */}
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
          Add Category
        </Text>

        <Text style={{ color: "#9E9E9E", marginBottom: 8 }}>
          Enter a short name and color for this category.
        </Text>

        {/* Name input */}
        <Text style={{ color: "#FFFFFF", marginBottom: 6 }}>Name</Text>
        <TextInput
          placeholder="e.g. Groceries"
          placeholderTextColor="#666"
          value={name}
          onChangeText={setName}
          style={{
            backgroundColor: "#1E1E1E",
            borderRadius: 12,
            paddingHorizontal: 12,
            paddingVertical: 12,
            color: "#fff",
            borderWidth: 1,
            borderColor: "#2A2A2A",
            marginBottom: 12,
          }}
        />

        {/* Color input */}
        <Text style={{ color: "#FFFFFF", marginBottom: 6 }}>Color</Text>
        <View
          style={{
            flexDirection: "row",
            gap: 12,
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <View
            style={{
              width: 28,
              height: 28,
              borderRadius: 14,
              backgroundColor: color,
              borderWidth: 1,
              borderColor: "#2A2A2A",
            }}
          />
          <TextInput
            placeholder="#00BFA6"
            placeholderTextColor="#666"
            value={color}
            onChangeText={setColor}
            autoCapitalize="none"
            style={{
              flex: 1,
              backgroundColor: "#1E1E1E",
              borderRadius: 12,
              paddingHorizontal: 12,
              paddingVertical: 12,
              color: "#fff",
              borderWidth: 1,
              borderColor: "#2A2A2A",
            }}
          />
          <TouchableOpacity
            onPress={() => setColor(randomHex())}
            style={{
              paddingVertical: 12,
              paddingHorizontal: 16,
              backgroundColor: "#2A2A2A",
              borderRadius: 12,
            }}
          >
            <Text style={{ color: "#FFFFFF" }}>Random</Text>
          </TouchableOpacity>
        </View>

        {/* Add button */}
        <TouchableOpacity
          onPress={handleAdd}
          disabled={!canAdd || loading}
          style={{
            backgroundColor: canAdd && !loading ? "#00BFA6" : "#3A3A3A",
            paddingVertical: 14,
            borderRadius: 12,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#FFFFFF", fontWeight: "700" }}>
            {loading ? "Adding..." : "Add"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Existing Categories */}
      <View
        style={{
          backgroundColor: "#1E1E1E",
          borderRadius: 16,
          padding: 12,
          borderWidth: 1,
          borderColor: "#2A2A2A",
          flex: 1,
        }}
      >
        <Text style={{ color: "#FFFFFF", fontWeight: "700", marginBottom: 8 }}>
          Existing Categories
        </Text>
        <FlatList
          data={categories}
          keyExtractor={(item) => String(item.id)}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          renderItem={({ item }) => (
            <View
              style={{
                padding: 12,
                backgroundColor: "#161616",
                borderRadius: 12,
                borderWidth: 1,
                borderColor: "#2A2A2A",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <View
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 9,
                    backgroundColor: item.color,
                    borderWidth: 1,
                    borderColor: "#2A2A2A",
                  }}
                />
                <Text style={{ color: "#FFFFFF", fontWeight: "600" }}>
                  {item.name}
                </Text>
              </View>
              <Text style={{ color: "#9E9E9E" }}>{item.color}</Text>
            </View>
          )}
          ListEmptyComponent={
            <Text style={{ color: "#9E9E9E" }}>No categories found.</Text>
          }
        />
      </View>
    </View>
  );
};

export default CategoryManagerScreen;
