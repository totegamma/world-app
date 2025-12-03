import { Text, StyleSheet, Button } from 'react-native';
import { useClient } from '../context/client';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Tab() {

    const client = useClient();

    return (
        <SafeAreaView style={styles.container}>
            <Text>Your CCID: {client.identity?.CCID}</Text>
            <Text>Registration</Text>
            <Button title="register" onPress={() => client.register?.()} />
            <Button title="Logout" onPress={() => client.logout?.()} />
        </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        alignItems: 'flex-start',
        flexDirection: 'column',
        gap: 10,
    },
});
