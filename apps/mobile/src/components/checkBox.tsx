
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  value: "Yes" | "No" | "";
  onChange: (v: "Yes" | "No" | "") => void;
  question?: string;
};

function Option({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <View style={[styles.box, selected && styles.boxChecked]}>
        {selected ? <Text style={styles.check}>x</Text> : null}
      </View>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

export default function CheckBox({ value, onChange, question }: Props) {
  return (
    <View style={styles.container}>

      <Option
        label="Yes"
        selected={value === "Yes"}
        onPress={() => onChange(value === "Yes" ? "" : "Yes")}
      />
      <Option
        label="No"
        selected={value === "No"}
        onPress={() => onChange(value === "No" ? "" : "No")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  question: {
    fontSize: 20,
    color: "#111",
    marginBottom: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  box: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#111",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  boxChecked: {
    backgroundColor: "#81B29A",
  },
  check: {
    color: "#111",
    fontSize: 18,
    lineHeight: 22,
    fontWeight: "bold",
  },
  label: {
    fontSize: 14,
    fontFamily: 'PlaypenSan',
    color: '#CCCCCC'
  },
});

