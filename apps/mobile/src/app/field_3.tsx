import { Text, View, StyleSheet, Pressable } from "react-native";
import { Link, useLocalSearchParams } from 'expo-router';
import Screen from "../components/Screen";
import NavBar from "@/components/NavBar";
import QuestionInput from "@/components/Switch";
<<<<<<< HEAD
import { useProject } from "@/lib/ProjectContext"; 
=======
import { questions } from "@/mock/mockData"; 
>>>>>>> e72e5735b698d21538c9d176698649507ed86805
import { useDraftAnswer } from "./hooks/useDraftAnswer";


export default function Field_3() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
<<<<<<< HEAD
  const { questions } = useProject();
=======
  const { userId } = useLocalSearchParams<{userId: string}>();

>>>>>>> e72e5735b698d21538c9d176698649507ed86805
  const question = questions
    .filter((q) => q.project_id === projectId)
    .sort((a, b) => a.position - b.position)[2];

<<<<<<< HEAD
    const {draft, setDraft, commit} = useDraftAnswer(question?.id ?? "")
=======
    const {draft, setDraft, commit} = useDraftAnswer(question.id)
>>>>>>> e72e5735b698d21538c9d176698649507ed86805
  
    return (
    <Screen> 
     <NavBar/>
    <View style={styles.container}>
      <View>
            <Text style={styles.description}>{question?.label}</Text>
        
          </View>
          {question && (
              <QuestionInput
                question={question}
                draft={draft}
                setDraft={setDraft}
              />
            )}
    </View>
<<<<<<< HEAD

    <View style={styles.footerRow}>
    <Link href={{ pathname: '/field_2', params: { projectId } }} asChild>
=======
    
       



    <View style={styles.footerRow}>
    <Link href={{ pathname: '/field_2', params: { projectId, userId } }} asChild>
>>>>>>> e72e5735b698d21538c9d176698649507ed86805
        <Pressable>
            <Text style={styles.footerLeft}>
                Back
            </Text>
        </Pressable>
    </Link>
<<<<<<< HEAD
    <Link href={{ pathname: '/field_4', params: { projectId } }} asChild onPress={commit}>
=======
    <Link href={{ pathname: '/field_4', params: { projectId, userId } }} asChild onPress={commit}>
>>>>>>> e72e5735b698d21538c9d176698649507ed86805
        <Pressable>
            <Text style={styles.footerRight}>
                Next
            </Text>
        </Pressable>
    </Link>
    </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 40,
    borderRadius: 10,
    margin: 20,
  },

  description: {
    fontSize: 14,
    lineHeight: 22,
    color: '#CCCCCC',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    top: 100,
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
});
