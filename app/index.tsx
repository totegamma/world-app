import { View, Text, StyleSheet, Button } from 'react-native';
import { useClient } from '../context/client';

export default function Tab() {

    const client = useClient();

    return (
        <View style={styles.container}>
            <Text>CCID: {client.identity?.CCID}</Text>
            <Text>Registration</Text>
            <Button title="register" onPress={() => client.register?.()} />
        </View>
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
