"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function PoliceLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        const auth = localStorage.getItem("nyayasetu_auth");
        if (!auth) {
            router.push("/login");
        } else {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setIsAuthorized(true);
        }
    }, [router]);

    if (!isAuthorized) {
        return (
            <div style={{
                height: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                color: "#1e3a8a"
            }}>
                <h2>🔒 Verifying Credentials...</h2>
            </div>
        );
    }

    return <>{children}</>;
}
