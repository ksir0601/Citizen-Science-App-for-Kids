import { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useFormData } from "@/app/context/FormConext";
import { useDraftAnswer } from "@/app/hooks/useDraftAnswer";
import { formatValue } from "@/app/utils/FormatValue";
import QuestionInput, {Question } from "./Switch";

// Only mounted while editing, so its draft starts fresh from context each time
function Editor({ question, onClose }: { question: Question; onClose: () => void }) {
  const { draft, setDraft, commit } = useDraftAnswer(question.id);

  return (
    <View>
      <QuestionInput question={question} draft={draft} setDraft={setDraft} />
      <View style={styles.actions}>
        <Pressable onPress={onClose}>
          <Text style={styles.action}>Cancel</Text>
        </Pressable>
        <Pressable
          onPress={() => {
            commit();      // writes to context (or clears it if empty)
            onClose();
          }}
        >
          <Text style={styles.action}>Save</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function ReviewItem({ question }: { question: Question }) {
  const { data } = useFormData();
  const [editing, setEditing] = useState(false);

  return (
    <View style={styles.item}>
      <Text style={styles.label}>{question.label}</Text>

      {editing ? (
        <Editor question={question} onClose={() => setEditing(false)} />
      ) : (
        <>
          <Text style={styles.value}>{formatValue(data[question.id])}</Text>
          <Pressable onPress={() => setEditing(true)}>
            <Text style={styles.action}>Edit</Text>
          </Pressable>
        </>
      )}
    </View>
  );

}

const styles = StyleSheet.create({
  item: { 
    marginBottom: 20, 
    alignItems: "center" },
  label: { 
    fontSize: 14, 
    color: "#CCCCCC", 
    textDecorationLine: "underline" },
  value: { 
    fontSize: 14, 
    lineHeight: 22, 
    color: "#CCCCCC", 
    textAlign: "center" },
  actions: { 
    flexDirection: "row", 
    justifyContent: "center", 
    gap: 24, 
    marginTop: 8 },
  action: { 
    fontSize: 12, 
    color: "#CCCCCC", 
    opacity: 0.8, 
    marginTop: 4 },
});