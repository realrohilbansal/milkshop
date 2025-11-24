// app/(auth)/login.jsx
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Keyboard,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
} from "react-native";

import Spacer from "../../components/Spacer";
import ThemedButton from "../../components/ThemedButton";
import ThemedText from "../../components/ThemedText";
import ThemedTextInput from "../../components/ThemedTextInput";
import ThemedView from "../../components/ThemedView";
import { useUser } from "../../hooks/useUser";

const Login = () => {
  const [phone, setPhone] = useState("");
  const { sendOtp } = useUser();
  const router = useRouter();

  const handleSubmit = async () => {
    const digits = phone.replace(/\D/g, "");

    if (digits.length < 10) {
      Alert.alert("Invalid number", "Enter a valid 10-digit mobile number.");
      return;
    }

    // Basic India formatting: +91xxxxxxxxxx
    let formatted = digits;
    if (!formatted.startsWith("+")) {
      if (formatted.startsWith("91") && formatted.length === 12) {
        formatted = `+${formatted}`;
      } else {
        formatted = `+91${formatted}`;
      }
    }

    try {
      const userId = await sendOtp(formatted);

      router.push({
        pathname: "/verifyOtp",
        params: {
          userId,
          phone: formatted,
        },
      });
    } catch (err) {
      console.log("handleSubmit error:", err);
      Alert.alert("Error", "Could not send OTP. Try again.");
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ThemedView style={styles.container}>
        <Spacer />
        <ThemedText title={true} style={styles.title}>
          Login with Mobile Number
        </ThemedText>

        <Spacer />

        <ThemedTextInput
          style={{ marginBottom: 20, width: "80%" }}
          placeholder="Enter Mobile Number"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          maxLength={10}
        />

        <ThemedButton onPress={handleSubmit}>
          <Text style={{ color: "#f2f2f2" }}>Send OTP</Text>
        </ThemedButton>

        <Spacer height={100} />
      </ThemedView>
    </TouchableWithoutFeedback>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    textAlign: "center",
    fontSize: 18,
    marginBottom: 30,
  },
});
