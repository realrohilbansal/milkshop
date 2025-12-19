import { Text, useColorScheme } from "react-native";
import { Colors } from "../constants/theme";

const ThemedText = ({ style, title = false, ...props }) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;

  const textColor = title ? theme.title : theme.text;

  return (
    <Text
      style={[
        {
          color: textColor,
          fontFamily: "System", // allows multilingual fallback
          includeFontPadding: true,
          textAlignVertical: "center",
        },
        style,
      ]}
      numberOfLines={props.numberOfLines}
      allowFontScaling={true}
      {...props}
    />
  );
};

export default ThemedText;
