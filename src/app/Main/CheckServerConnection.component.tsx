import React, { useEffect, useState } from "react";
import { MainLayoutComponent } from "./Main-Layout.component";

export function CheckServerConnectionComponent(): JSX.Element {
    const [loading, setLoading] = useState(true);
    const [isConnected, setIsConnected] = useState(true);

    const isAvailable = async (): Promise<void> => {
        try {
            const response = await fetch("/v1");
            if (response.ok) {
                setIsConnected(true);
            } else {
                setIsConnected(false);
            }
        } catch {
            setIsConnected(false);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        isAvailable();
    });

    if (loading) {
        return <p> </p>;
    }

    return <MainLayoutComponent isConnected={isConnected} />;
}
