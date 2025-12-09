import { Text, StyleSheet, Button, View, TextInput } from 'react-native';
import { useClient } from '../context/client';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';

export default function Tab() {

    const client = useClient();

    const [usename, setUsername] = useState<string>("");
    const [icon, setIcon] = useState<string>("");

    return (
        <SafeAreaView style={styles.container}>
            <Text>Your CCID: {client.ccid}</Text>
            <View>
                <Text>Profile</Text>
                <Text>Username</Text>
                <TextInput
                    style={{
                        height: 40,
                        borderColor: 'gray',
                        borderWidth: 1,
                        width: 200,
                        marginBottom: 10,
                        paddingLeft: 10,
                    }}
                    onChangeText={text => setUsername(text)}
                    value={usename}
                    placeholder="Enter your username"
                />
                <Text>Icon URL</Text>
                <TextInput
                    style={{
                        height: 40,
                        borderColor: 'gray',
                        borderWidth: 1,
                        width: 200,
                        marginBottom: 10,
                        paddingLeft: 10,
                    }}
                    onChangeText={text => setIcon(text)}
                    value={icon}
                    placeholder="Enter icon URL"
                />
                <Button
                    title="Save Profile"
                    onPress={async () => {
                        const document = {
                            key: 'world.concrnt.profile',
                            schema: "https://schema.concrnt.world/p/main.json",
                            value: {
                                username: usename,
                                avatar: icon,
                            },
                            author: client.ccid,
                            createdAt: new Date(),
                        };
                        client.api.commit(document).then(() => {
                            console.log("Profile updated");
                        })
                    }}
                />
            </View>

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
