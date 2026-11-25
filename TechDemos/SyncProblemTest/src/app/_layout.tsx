import { Tabs } from 'expo-router';

export default function RootLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="cloudConnection" options={{ title: 'Connect to Cloud' }} />
      <Tabs.Screen name="imageDemo" options={{ title: 'Photos' }} />
    </Tabs>
  );
}
