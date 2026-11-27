import { Text, View, StyleSheet, Pressable } from 'react-native';
<<<<<<< HEAD
import { useLocalSearchParams, Link } from 'expo-router';


export default function NavBar() {
    const { projectId } = useLocalSearchParams<{ projectId: string }>();
  
    return (

    <View style={styles.row}>
  
   <Link href={{ pathname: '/project_dscr', params: { projectId } }}>     
      <Pressable>
=======
import { Link } from 'expo-router';


export default function NavBar() {
    return (

    <View style={styles.row}>
    <Link href='/projects' >
    <Pressable>
    <Text style={styles.projects}>Projects</Text>
    </Pressable>
    </Link>
    <Link href='/project_dscr'>
        <Pressable>
>>>>>>> e72e5735b698d21538c9d176698649507ed86805
            <Text style={styles.proj_desc}>Projects Description</Text>
        </Pressable>
    </Link>
    <Link href='/' asChild>
    <Pressable>
    <Text style={styles.logout}>Log Out</Text>
    </Pressable>
    </Link>
    </View>
    );
}

const styles = StyleSheet.create({
  container: {
    padding: 40,
    borderRadius: 10,
    margin: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: "PlaypenSan-Bold",
    marginBottom: 10,
    color: '#CCCCCC',
    textAlign: 'center',
    
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: '#CCCCCC',
  },
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
});