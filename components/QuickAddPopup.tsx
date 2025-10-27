// components/QuickAddPopup.tsx
import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Easing,
  BackHandler,
  Pressable,
  ScrollView,
} from "react-native";
import { Category } from "../services/ExpenseService";

export interface QuickAddPopupProps {
  /** Whether the sheet is visible */
  visible: boolean;
  /** Detected amount to show & save */
  amount: number;
  /** Category list (from SQLite via your store) */
  categories: Category[];
  /** Called when user taps a category to save */
  onSelectCategory: (category: Category) => void;
  /** Called when the popup should close (backdrop tap / back press) */
  onClose: () => void;
}

/**
 * QuickAddPopup
 * - A lightweight bottom sheet that slides up
 * - Shows detected amount and category buttons
 * - Uses RN Animated; no native modules required
 * - Dark-theme friendly defaults to match your app
 */
const QuickAddPopup: React.FC<QuickAddPopupProps> = ({
  visible,
  amount,
  categories,
  onSelectCategory,
  onClose,
}) => {
  const translateY = useRef(new Animated.Value(400)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Handle Android back button while open
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (visible) {
        onClose();
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [visible, onClose]);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 240,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 400,
          duration: 180,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 160,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, translateY, backdropOpacity]);

  if (!visible && (backdropOpacity as any)._value === 0) {
    // Keep rendering to animate out, but if fully hidden and not visible, don't show anything
  }

  return (
    <>
      {/* Backdrop */}
      <Pressable
        onPress={onClose}
        pointerEvents={visible ? "auto" : "none"}
        style={{
          position: "absolute",
          inset: 0,
        }}
      >
        <Animated.View
          style={{
            flex: 1,
            backgroundColor: "#000000AA",
            opacity: backdropOpacity,
          }}
        />
      </Pressable>

      {/* Bottom sheet */}
      <Animated.View
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          transform: [{ translateY }],
        }}
      >
        <View
          style={{
            backgroundColor: "#121212",
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            borderWidth: 1,
            borderColor: "#2A2A2A",
            padding: 16,
          }}
        >
          <View
            style={{
              height: 4,
              width: 42,
              borderRadius: 2,
              backgroundColor: "#2A2A2A",
              alignSelf: "center",
              marginBottom: 12,
            }}
          />
          <Text
            style={{
              color: "#BDBDBD",
              fontSize: 13,
              marginBottom: 4,
            }}
          >
            Detected payment
          </Text>
          <Text
            style={{
              color: "#FFFFFF",
              fontSize: 24,
              fontWeight: "800",
              marginBottom: 12,
            }}
          >
            ${amount.toFixed(2)}
          </Text>

          <Text
            style={{
              color: "#FFFFFF",
              fontWeight: "700",
              marginBottom: 8,
            }}
          >
            Choose a category
          </Text>

          {/* Categories grid */}
          <ScrollView
            contentContainerStyle={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 10,
              paddingBottom: 8,
            }}
            showsVerticalScrollIndicator={false}
          >
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                onPress={() => onSelectCategory(cat)}
                activeOpacity={0.8}
                style={{
                  backgroundColor: "#1E1E1E",
                  borderRadius: 14,
                  paddingVertical: 12,
                  paddingHorizontal: 14,
                  borderWidth: 1,
                  borderColor: "#2A2A2A",
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: cat.color,
                    marginRight: 10,
                  }}
                />
                <Text style={{ color: "#FFFFFF", fontWeight: "700" }}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Cancel */}
          <TouchableOpacity
            onPress={onClose}
            activeOpacity={0.8}
            style={{
              marginTop: 6,
              backgroundColor: "#2A2A2A",
              paddingVertical: 12,
              borderRadius: 12,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#FFFFFF", fontWeight: "700" }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </>
  );
};

export default QuickAddPopup;
