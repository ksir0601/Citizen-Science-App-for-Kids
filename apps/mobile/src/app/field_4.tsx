import { Text, View, StyleSheet, Pressable } from "react-native";
import { Link, useLocalSearchParams } from 'expo-router';
import Screen from "../components/Screen";
import NavBar from "@/components/NavBar";
import QuestionInput from "@/components/Switch";
<<<<<<< HEAD
import { useProject } from "@/lib/ProjectContext"; 
import { useDraftAnswer } from "./hooks/useDraftAnswer";


export default function Field_4() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const { questions } = useProject();
=======
import { questions } from "@/mock/mockData"; 
import { useDraftAnswer } from "./hooks/useDraftAnswer";


export default function Field_3() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const { userId } = useLocalSearchParams<{userId: string}>();

>>>>>>> e72e5735b698d21538c9d176698649507ed86805
  const question = questions
    .filter((q) => q.project_id === projectId)
    .sort((a, b) => a.position - b.position)[3];

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
    <Link href={{ pathname: '/field_3', params: { projectId } }} asChild onPress={commit}>
=======



    <View style={styles.footerRow}>
    <Link href={{ pathname: '/field_3', params: { projectId, userId } }} asChild>
>>>>>>> e72e5735b698d21538c9d176698649507ed86805
        <Pressable>
            <Text style={styles.footerLeft}>
                Back
            </Text>
        </Pressable>
    </Link>
<<<<<<< HEAD
    <Link href={{ pathname: '/review', params: { projectId } }} asChild onPress={commit}>
=======
    <Link href={{ pathname: '/optional', params: { projectId, userId } }} asChild onPress={commit}>
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
<<<<<<< HEAD

=======
    dscr_head: {
    fontSize: 14,
    lineHeight: 22,
    color: '#CCCCCC',
    textDecorationLine: "underline",
    },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
    logout:{
    fontSize: 14,
    fontFamily: 'PlaypenSan-SemiBold',
    paddingTop: 5,
    marginLeft: 50,
    color: '#CCCCCC'
  },
      proj_desc:{
    fontSize: 14,
    fontFamily: 'PlaypenSan-SemiBold',
    paddingTop: 10,
    textAlign: 'center',
    color: '#CCCCCC'
  },
    projects:{
    fontSize: 14,
    fontFamily: 'PlaypenSan-SemiBold',
    paddingTop: 5,
    marginRight: 50,
    color: '#CCCCCC'
  },
    entry: {
    fontSize: 14,
    lineHeight: 22,
    color: '#CCCCCC',
    textAlign: 'center',
  },
  footerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
>>>>>>> e72e5735b698d21538c9d176698649507ed86805
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
<<<<<<< HEAD
=======

    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    cell: {
        width: '33.33%',
        padding: 8,
    },
    cellStyle: {
        aspectRatio: 1,
        backgroundColor: "#81B29A",
        borderRadius: 12,
    }
>>>>>>> e72e5735b698d21538c9d176698649507ed86805
});
