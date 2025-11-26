import { View, Text, StyleSheet, Button } from 'react-native';
import { useClient } from '../context/client';

export default function Tab() {

    const client = useClient();

    return (
        <View style={styles.container}>
            <Text>Your CCID: {client.ccid}</Text>
            <Button title="Refresh CCID" onPress={() => client.updateIdentity?.()} />
        </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
