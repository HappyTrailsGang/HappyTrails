import { NativeTabs } from 'expo-router/unstable-native-tabs';

/* NativeTabs.Trigger name property must match the filename
of the route it leads to.
*/
/* NativeTabs.Trigger.Icon Options
iOS: https://github.com/andrewtavis/sf-symbols-online
 - "SF (San Francisco) Symbols"
Android: https://fonts.google.com/icons
 - "MD (Material Design) Icons"
Custom images:
 - src={require('path/to/image')}
*/
export default function TabLayout() {
    return(<NativeTabs>
        <NativeTabs.Trigger name="index">
            <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
            <NativeTabs.Trigger.Icon sf="house.fill" md="home" />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="social">
            <NativeTabs.Trigger.Label>Social</NativeTabs.Trigger.Label>
            <NativeTabs.Trigger.Icon sf="person.2.square.stack.fill" md="groups" />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="compose">
            <NativeTabs.Trigger.Label>Compose</NativeTabs.Trigger.Label>
            <NativeTabs.Trigger.Icon sf="square.and.pencil" md="edit_square" />
        </NativeTabs.Trigger>
    </NativeTabs>);
}