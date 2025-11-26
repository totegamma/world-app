import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';
import { ClientProvider } from '../context/client';

export default function TabLayout() {
    return (
        <ClientProvider>
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
        </ClientProvider>
    );
}
