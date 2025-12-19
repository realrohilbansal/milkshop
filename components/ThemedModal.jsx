// components/ThemedModal.jsx
import React from "react";
import { Modal, StyleSheet, TouchableWithoutFeedback, View } from "react-native";
import ThemedText from "./ThemedText";
import ThemedView from "./ThemedView";

export default function ThemedModal({ visible, onClose, children, title }) {
  return (
    <Modal animationType="fade" visible={visible} transparent onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      <ThemedView style={styles.container}>
        {/* Dropdown handle */}
        <View style={styles.handle} />

        {title ? (
          <ThemedText title={true} style={styles.title}>
            {title}
          </ThemedText>
        ) : null}

        <View style={styles.content}>
          {children}
        </View>
      </ThemedView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
  },

  container: {
    position: "absolute",
    left: 16,
    right: 16,
    top: "20%",            // 👈 Reduced modal height by pushing down
    borderRadius: 16,
    paddingTop: 10,
    paddingBottom: 16,
    paddingHorizontal: 16,

    // Softer shadow
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,

    // Dropdown look: floating card
    backgroundColor: "rgba(255,255,255,0.96)",
  },

  handle: {
    width: 38,
    height: 4,
    borderRadius: 3,
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.25)",
    marginBottom: 12,
  },

  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    textAlign: "left",
  },

  content: {
    paddingTop: 4,
    paddingBottom: 6,
  },
});
