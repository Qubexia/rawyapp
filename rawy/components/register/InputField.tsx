import React from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
} from "react-native";

export interface InputFieldProps extends TextInputProps {
  label?: string;
  error?: string | null;
  leftIcon?: React.ReactNode;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  error,
  style,
  leftIcon,
  ...rest
}) => {
  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.inputGroup, error ? styles.inputGroupError : null]}>
        {leftIcon ? <View style={styles.leftIcon}>{leftIcon}</View> : null}
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor="#94A3B8"
          {...rest}
        />
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { width: "100%" },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 6,
    marginLeft: 2,
    textTransform: "uppercase",
  },
  inputGroup: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    height: 52,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
    justifyContent: "center",
  },
  inputGroupError: {
    borderColor: "#EF4444",
    backgroundColor: "rgba(239,68,68,0.03)",
  },
  leftIcon: {
    width: 36,
    marginRight: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  input: { fontSize: 15, color: "#000000", padding: 0, flex: 1 },
  errorText: {
    color: "#EF4444",
    marginTop: 6,
    marginLeft: 4,
    fontSize: 12,
    fontWeight: "500",
  },
});

export default InputField;
