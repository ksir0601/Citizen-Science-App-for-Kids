import NavBar from "@/components/NavBar";
import QuestionInput from "@/components/Switch";
import { useProject } from "@/lib/ProjectContext";
import { Link, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from "react-native";
import Screen from "../components/Screen";
import { useDraftAnswer } from "./hooks/useDraftAnswer";


export default function Field_4() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const { questions } = useProject();
  const question = questions
    .filter((q) => q.project_id === projectId)
    .sort((a, b) => a.position - b.position)[3];

    const {draft, setDraft, commit} = useDraftAnswer(question?.id ?? "")
 
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
    
       

    <View style={styles.footerRow}>
    <Link href={{ pathname: '/field_3', params: { projectId } }} asChild onPress={commit}>
        <Pressable>
            <Text style={styles.footerLeft}>
                Back
            </Text>
        </Pressable>
    </Link>
    <Link href={{ pathname: '/review', params: { projectId } }} asChild onPress={commit}>
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
