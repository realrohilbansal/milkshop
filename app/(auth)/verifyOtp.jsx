// app/(auth)/verifyOtp.jsx
import { useLocalSearchParams, useRouter } from "expo-router";
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

const VerifyOtp = () => {
  const { userId, phone } = useLocalSearchParams();
  const [otp, setOtp] = useState("");
  const { verifyOtp } = useUser();
  const router = useRouter();

  const handleVerify = async () => {
    if (!otp || otp.length < 4) {
      Alert.alert("Invalid code", "Enter the code you received via SMS.");
      return;
    }

    try {
      await verifyOtp(String(userId), otp);
      // At this point, user is set in context
      router.replace("/"); // your home/index route
    } catch (err) {
      console.log("handleVerify error:", err);
      Alert.alert("Verification failed", "Wrong or expired code. Try again.");
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ThemedView style={styles.container}>
        <Spacer />
        <ThemedText title={true} style={styles.title}>
          Enter OTP
        </ThemedText>

        <ThemedText style={styles.subtitle}>
          Code sent to {phone}
        </ThemedText>

        <Spacer />

        <ThemedTextInput
          style={{ marginBottom: 20, width: "60%", textAlign: "center" }}
          placeholder="123456"
          value={otp}
          onChangeText={setOtp}
          keyboardType="number-pad"
          maxLength={6}
        />

        <ThemedButton onPress={handleVerify}>
          <Text style={{ color: "#f2f2f2" }}>Verify</Text>
        </ThemedButton>

        <Spacer height={100} />
      </ThemedView>
    </TouchableWithoutFeedback>
  );
};

export default VerifyOtp;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    textAlign: "center",
    fontSize: 18,
    marginBottom: 10,
  },
  subtitle: {
    textAlign: "center",
    fontSize: 14,
    marginBottom: 30,
  },
});
