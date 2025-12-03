import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';
import { ClientProvider } from '../context/client';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function TabLayout() {
    return (
        <ClientProvider>
            <SafeAreaProvider>
                <NativeTabs>
                    <NativeTabs.Trigger name="index">
                        <Label>Home</Label>
                        <Icon sf="house.fill" drawable="custom_android_drawable" />
                    </NativeTabs.Trigger>
                    <NativeTabs.Trigger name="settings">
                        <Icon sf="gear" drawable="custom_settings_drawable" />
                        <Label>Settings</Label>
                    </NativeTabs.Trigger>
                </NativeTabs>
            </SafeAreaProvider>
        </ClientProvider>
    );
}
