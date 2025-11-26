import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from "react";
import { GenerateIdentity, Identity } from '../lib/crypto';
import { Text } from "react-native";


type ClientContextValue = {
    ccid: string
    updateIdentity?: () => void
};

const ClientContext = createContext<ClientContextValue | undefined>(undefined);

type ClientProviderProps = {
    children: ReactNode;
};

export const ClientProvider = (props: ClientProviderProps): ReactNode => {

    const [identity, setIdentity] = useState<Identity>();

    const updateIdentity = useCallback(() => {
        setIdentity(GenerateIdentity());
    }, []);


    useEffect(() => {
        updateIdentity();
    }, []);

    const value = useMemo(() => ({
        ccid: identity?.CCID ?? '',
        updateIdentity
    }), [identity, updateIdentity]);

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
