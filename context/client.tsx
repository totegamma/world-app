import 'react-native-get-random-values'
import { createContext, useContext, useState, useEffect, ReactNode, useMemo } from "react";
import * as SecureStore from 'expo-secure-store';
import { Platform } from "react-native";
import { Api, GenerateIdentity, Identity, InMemoryKVS, MasterKeyAuthProvider } from '@concrnt/clientv2';
import AsyncStorage from '@react-native-async-storage/async-storage';


type ClientContextValue = {
    ccid: string;
    host: string | undefined;
    api: Api,
    initializing: boolean;
};

const ClientContext = createContext<ClientContextValue | undefined>(undefined);

type ClientProviderProps = {
    children: ReactNode;
};

class Empty {}

export const ClientProvider = (props: ClientProviderProps): ReactNode => {

    const [initializing, setInitializing] = useState<boolean>(true);
    const [host, setHost] = useState<string>();
    const [api, setApi] = useState<Api | undefined>(undefined);

    useEffect(() => {
        let unmounted = false;
        AsyncStorage.getItem('host').then((storedHost) => {
            if (unmounted) return;
            if (storedHost){
                setHost(storedHost);
            } else {
                setInitializing(false);
            }
        })
        return () => {
            unmounted = true;
        }
    }, []);

    useEffect(() => {

        if (!host) return;
        let init = async () => {
            let identity: Identity
            if (Platform.OS !== 'web') { // expo
                let result = await SecureStore.getItemAsync("identity");
                if (result) {
                    let parsed: Identity = JSON.parse(result);
                    identity = parsed;
                } else {
                    let newIdentity = GenerateIdentity();
                    await SecureStore.setItemAsync("identity", JSON.stringify(newIdentity));
                    identity = newIdentity;
                }
            } else { // web
                let result = localStorage.getItem("identity");
                if (result) {
                    let parsed: Identity = JSON.parse(result);
                    identity = parsed;
                } else {
                    let newIdentity = GenerateIdentity();
                    localStorage.setItem("identity", JSON.stringify(newIdentity));
                    identity = newIdentity;
                }
            }

            const authProvider = new MasterKeyAuthProvider(identity.privateKey, host);
            const cacheEngine = new InMemoryKVS();

            const api = new Api(authProvider, cacheEngine)
            setApi(api);
            setInitializing(false);

        };
        init();

    }, [host]);

    useEffect(() => {
        if (!api) return;

        let check = async () => {
            let timeline = await api.getResource(Empty, `cc://${api.authProvider.getCCID()}/world.concrnt.t-home`)
                .then((res) => {
                    if (res === null) {
                        const document = {
                            key: "world.concrnt.t-home",
                            author: api.authProvider.getCCID(),
                            schema: "https://schema.concrnt.world/t/empty.json",
                            contentType: "application/chunkline+json",
                            value: {},
                            createdAt: new Date(),
                        }
                        api.commit(document);
                        return document;
                    }
                    return res;
                })
                .catch((err) => {
                    console.error("Error fetching timeline:", err);
                    return null;
                })
            console.log("Fetched timeline:", timeline);
        }

        check();
    }, [api]);

    const value = useMemo(() => ({
        api: api!,
        ccid: api?.authProvider.getCCID()!,
        host,
        initializing,
    }), [api, host, initializing]);

    return (
        <ClientContext.Provider value={value}>
            {props.children}
        </ClientContext.Provider>
    );
};

export const useClient = () => {
    const ctx = useContext(ClientContext);
    if (!ctx) throw new Error("useClient must be used within AuthProvider");
    return ctx;
};
