import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from "react";
import { GenerateIdentity, Identity } from '../lib/crypto';
import { Text } from "react-native";
import { affiliate } from "../lib/client";
import * as SecureStore from 'expo-secure-store';


type ClientContextValue = {
    identity?: Identity,
    register?: () => void,
    logout?: () => void,
};

const ClientContext = createContext<ClientContextValue | undefined>(undefined);

type ClientProviderProps = {
    children: ReactNode;
};

export const ClientProvider = (props: ClientProviderProps): ReactNode => {

    const [identity, setIdentity] = useState<Identity>();

    useEffect(() => {
        let init = async () => {
            let result = await SecureStore.getItemAsync("subkey");
            if (result) {
                let parsed: Identity = JSON.parse(result);
                setIdentity(parsed);
            } else {
                let newIdentity = GenerateIdentity();
                setIdentity(newIdentity);
                await SecureStore.setItemAsync("subkey", JSON.stringify(newIdentity));
            }
        };
        init();
    }, []);

    const register = useCallback(() => {
        if (!identity) return;
        affiliate(identity, 'cc2.tunnel.anthrotech.dev');
    }, [identity]);

    const logout = useCallback(async () => {
        SecureStore.deleteItemAsync("subkey").then(() => {
            setIdentity(undefined);
        })
    }, []);

    const value = useMemo(() => ({
        identity,
        register,
        logout
    }), [identity, register, logout]);

    if (!identity) {
        return <Text>Loading...</Text>;
    }

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
