import { View, Text, Image, Pressable } from "react-native";
import { useClient } from "../context/client";
import { useEffect, useState } from "react";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export interface MessageCellProps {
    uri: string;
}

interface MarkdownSchema {
    body: string
}

interface ProfileSchema {
    username: string
    avatar: string
}

class Record<T> {
    value: T = {} as T
}


export const MessageCell = (props: MessageCellProps) => {

    const client = useClient();
    const [resource, setResource] = useState<Record<MarkdownSchema>>();
    const [profile, setProfile] = useState<Record<ProfileSchema>>();

    useEffect(() => {
        client.api.getResource<Record<MarkdownSchema>>(Record<MarkdownSchema>, props.uri).then(res => {
            setResource(res);
        })

        const parsed = new URL(props.uri);
        const owner = parsed.hostname;
        const profileUri = `cc://${owner}/world.concrnt.profile`;

        client.api.getResource<Record<ProfileSchema>>(Record<ProfileSchema>, profileUri).then(res => {
            setProfile(res);
        }).catch(err => {
            console.log("Failed to load profile for ", owner, err);
        })

    }, [client, props.uri]);

    return (
        <View 
            style={{ 
                width: '100%',
                flexDirection: 'row',
                gap: 10,
            }}
        >
            <Image
                source={{
                    uri: profile ? profile.value.avatar : undefined
                }}
                style={{
                    width: 40,
                    height: 40,
                    borderRadius: 5
                }}
            />
            <View
                style={{ 
                    flex: 1,
                    display: 'flex',
                }}
            >
                <Text style={{ fontWeight: 'bold'}}>
                    {profile ? profile.value.username : "Loading profile..."}
                </Text>
                <Text>
                    {resource ? resource.value.body : "Loading " + props.uri}
                </Text>
                <Text style={{ color: 'gray', fontSize: 12, marginTop: 3 }}>
                    {props.uri}
                </Text>
                <View
                    style={{
                        flexDirection: 'row',
                        gap: 15,
                        marginTop: 5,
                    }}
                >
                    <Pressable
                        onPress={() => {
                            const parsed = new URL(props.uri);
                            const owner = parsed.hostname;

                            const document = {
                                schema: "https://schema.concrnt.world/a/like.json",
                                value: {},
                                author: client.ccid,
                                owner: owner,
                                associate: props.uri,
                                createdAt: new Date(),
                            }
                            client.api.commit(document).then(() => {
                                console.log("Liked!")
                            })
                        }}
                    >
                        <MaterialIcons name="star-border" size={20} color="gray" />
                    </Pressable>
                </View>
            </View>
        </View>
    )

}


