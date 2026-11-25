import { Tabs } from 'expo-router';
import { CloudProvider, createCloudStorage } from '../cloud';

// Created once at module scope so the session survives re-renders and tab switches.
const cloudStorage = createCloudStorage();

export default function RootLayout() {
  return (
    <CloudProvider storage={cloudStorage}>
      <Tabs>
        <Tabs.Screen name="index" options={{ title: 'Home' }} />
        <Tabs.Screen name="cloudConnection" options={{ title: 'Connect to Cloud' }} />
        <Tabs.Screen name="imageDemo" options={{ title: 'Photos' }} />
      </Tabs>
    </CloudProvider>
  );
}
