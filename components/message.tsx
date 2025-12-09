import { View, Text, Image } from "react-native";
import { useClient } from "../context/client";
import { useEffect, useState } from "react";


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
        <View style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc', width: '100%' }}>
            <Image source={{ uri: profile ? profile.value.avatar : undefined }} style={{ width: 40, height: 40, borderRadius: 20, marginBottom: 5 }} />
            <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>{profile ? profile.value.username : "Loading profile..."}</Text>
            <Text>{resource ? resource.value.body : "Loading " + props.uri}</Text>
        </View>
    )

}


