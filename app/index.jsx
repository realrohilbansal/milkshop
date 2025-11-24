import { Link } from 'expo-router'
import { StyleSheet } from 'react-native'

import Spacer from "../components/Spacer"
import ThemedText from "../components/ThemedText"
import ThemedView from "../components/ThemedView"

const Home = () => {
  return (
    <ThemedView style={styles.container}>
      {/* <ThemedLogo /> */}

      <ThemedText style={styles.title} title={true}>Milkoo</ThemedText>

      <ThemedText style={{ marginTop: 10 }}>
        The Number 1
      </ThemedText>

      <ThemedText style={{ marginBottom: 10 }}>
        Milk Sales Management App
      </ThemedText>

      <Spacer />

      <Link href="/login" style={styles.link}>
        <ThemedText>Login</ThemedText>
      </Link>

      <Link href="/profile" style={styles.link}>
        <ThemedText>Profile</ThemedText>
      </Link>

    </ThemedView>
  )
}

export default Home

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  img: {
    marginVertical: 20
  },
  title: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  link: {
    marginVertical: 10,
    borderBottomWidth: 1
  },
})