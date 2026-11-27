import { Text, View, StyleSheet, Pressable } from "react-native";
import { router, Link, useLocalSearchParams } from "expo-router";
import Screen from "../components/Screen";
import NavBar from "@/components/NavBar";
import EditableField from "@/components/reviewEdit";
<<<<<<< HEAD
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

 
=======
import { questions, kids } from "@/mock/mockData";
import * as api from "@/mock/mockApi";
import { useFormData } from "@/app/context/FormConext";
// Add ConfettiCannon to sumbit wait for 3 seconds.
// import ConfettiCannon from "react-native-confetti-cannon";

export default function Review() {

 
  const { projectId } = useLocalSearchParams<{projectId: string }>();
  const { userId } = useLocalSearchParams<{userId: string}>();
  const nickname = kids.find((u) => u.id === userId);

  const {data, resetData } = useFormData();

  const projectQuestions = questions
    .filter((q) => q.project_id === projectId)
    .sort((a, b) => a.position - b.position);

  const handleSubmit = async () => {
    await api.addObservation(projectId, nickname, data);
    resetData()
    router.replace({pathname: "/project_dscr", params: { projectId, userId }})
  }

 

>>>>>>> e72e5735b698d21538c9d176698649507ed86805
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

<<<<<<< HEAD
      {submitError ? <Text style={styles.error}>{submitError}</Text> : null}
      <View style={styles.footerRow}>
        <Link href={{ pathname: "/project_dscr", params: {projectId} }} asChild>
=======
      <View style={styles.footerRow}>
        <Link href="/project_dscr" asChild>
>>>>>>> e72e5735b698d21538c9d176698649507ed86805
          <Pressable>
            <Text style={styles.footerLeft}>Back</Text>
          </Pressable>
        </Link>
        <Pressable onPress={handleSubmit}>
<<<<<<< HEAD

=======
>>>>>>> e72e5735b698d21538c9d176698649507ed86805
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
<<<<<<< HEAD
  error: {                                                              // changed (this style)
    color: "#E07A5F",
    fontSize: 14,
    textAlign: "center",
    marginTop: 6,
  },
=======
>>>>>>> e72e5735b698d21538c9d176698649507ed86805
  list: {
    flex: 1,
},
  listContent: {
    paddingBottom: 16,
},
});