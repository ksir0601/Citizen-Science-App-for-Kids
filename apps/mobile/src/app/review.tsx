import { Text, View, StyleSheet, Pressable } from "react-native";
import { router, Link, useLocalSearchParams } from "expo-router";
import Screen from "../components/Screen";
import NavBar from "@/components/NavBar";
import EditableField from "@/components/reviewEdit";
import { useProject } from "@/lib/ProjectContext";
import * as api from "@/lib/api";
import { useState } from "react";
import { useFormData } from "@/app/context/FormConext"

export default function Review() {
  const { projectId } = useLocalSearchParams<{projectId: string }>();
  const {data, resetData } = useFormData()
  const { questions, nickname } = useProject();
  const [submitError, setSubmitError] = useState("");


  const projectQuestions = questions
    .filter((q) => q.project_id === projectId)
    .sort((a, b) => a.position - b.position);

  const handleSubmit = async () => {
    setSubmitError("");
    const { error } = await api.addObservation(projectId, nickname, data);
      if (error) {
        console.log("addObservation failed:", error.message);
        setSubmitError(" Oops, your entry didn't save. Please try again!");
        return;
      }
    resetData()
    router.replace({pathname: "/project_dscr", params: { projectId }})
  }

 
  return (
    <Screen>
      <NavBar />
      <View>
        <Text style={styles.title}>Review your data!</Text>
      </View>

      <View>
     
        {projectQuestions.map((q) => (
          <EditableField key={q.id} question={q} />
        ))}
      </View>

      {submitError ? <Text style={styles.error}>{submitError}</Text> : null}
      <View style={styles.footerRow}>
        <Link href={{ pathname: "/project_dscr", params: {projectId} }} asChild>
          <Pressable>
            <Text style={styles.footerLeft}>Back</Text>
          </Pressable>
        </Link>
        <Pressable onPress={handleSubmit}>

          <Text style={styles.footerRight}>Submit!</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({

  title: {
    fontSize: 16,
    fontFamily: "PlaypenSan-Bold",
    marginBottom: 10,
    color: '#CCCCCC',
    textAlign: 'center',
    
  },
 footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  footerLeft:{
    fontSize: 14,
    lineHeight: 22,
    color: '#CCCCCC',
    paddingRight: 75,
  },
  footerRight:{
    fontSize: 14,
    lineHeight: 22,
    color: '#CCCCCC',
    paddingLeft: 75,
    },
  error: {                                                              // changed (this style)
    color: "#E07A5F",
    fontSize: 14,
    textAlign: "center",
    marginTop: 6,
  },
  list: {
    flex: 1,
},
  listContent: {
    paddingBottom: 16,
},
});