import { Platform, StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>HappyTrails Sync Demo</Text>
      <Text style={styles.body}>
        Use the Connect to Cloud tab to sign in with Google and upload a photo to Drive.
      </Text>
      <Text style={styles.caption}>Running on {Platform.OS}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  body: {
    textAlign: 'center',
  },
  caption: {
    color: 'gray',
  },
});
