import Screen from '../components/Screen';
import ScreenTitle from '../components/ScreenTitle';
import { Text, View, StyleSheet, Pressable } from 'react-native';
import { Link } from 'expo-router';

export default function Projects() {
  return (
    <Screen>
      <View>
        <Link href='/' asChild>
          <Pressable>
            <Text style={styles.logout}>Log Out</Text>
          </Pressable>
        </Link>
      </View>
      <ScreenTitle>Citizen Science Jr</ScreenTitle>
      <View>
        <Text style={styles.container}>
          My Projects
        </Text>
      </View>
      <View>
        <Link href='/project_dscr' asChild>
        <Pressable>
        <Text style={styles.project_list}>
           - Schoolyard Bug Count
        </Text>
        </Pressable>
        </Link>
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  container:{
    fontSize: 16,
    fontFamily: 'PlaypenSan-SemiBold',
    color: '#CCCCCC',
    marginRight: 200,
    paddingTop: 20,
  },
  project_list: {
    fontSize: 14,
    fontFamily: 'PlaypenSan-SemiBold',
    color: '#CCCCCC',
    marginRight: 100,
    paddingTop: 20,
  },

  logout:{
    fontSize: 14,
    fontFamily: 'PlaypenSan-SemiBold',
    paddingTop: 5,
    marginLeft: 250,
    color: '#CCCCCC'
  },
})