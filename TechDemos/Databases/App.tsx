import { Button, Column, Host, Row, Spacer, TextInput, useNativeState } from '@expo/ui';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import * as sLite from './db/sqlite';

export default function App() {
  useEffect(() => {sLite.init();}, []);

  const id = useNativeState('');
  const email = useNativeState('');
  const trailName = useNativeState('');

  return (
    <View style={styles.container}>
      <Host matchContents>
        <Column spacing={8}>
          <TextInput 
            value={id}
            accessibilityLabel='User ID'
            autoCapitalize='none'
            autoCorrect={false}
            placeholder='MyUserID'
            returnKeyType='next'/>
          <TextInput
            value={email}
            accessibilityLabel='Email'
            autoCapitalize='none'
            autoCorrect={false}
            keyboardType='email-address'
            placeholder='email@domain.com'
            returnKeyType='next'/>
          <TextInput
            value={trailName}
            accessibilityLabel='Username'
            autoCapitalize='none'
            autoCorrect={false}
            placeholder='MyUserName'
            returnKeyType='done'/>
          
          <Row>
            <Button label='Delete' onPress={() => alert('Deleted')} />
            <Spacer flexible />
            <Button label='Insert' onPress={() => alert('Inserted')} />
            <Spacer flexible />
            <Button label='Update' onPress={() => alert('Updated')} />
            <Spacer flexible />
            <Button label='Refresh' onPress={() => alert('Refreshed')} />
          </Row>
        </Column>
      </Host>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
