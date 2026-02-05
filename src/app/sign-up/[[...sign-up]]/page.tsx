import { SignUp } from "@clerk/nextjs";

export default function Page() {
    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f3f4f6' }}>
            <SignUp />
        </div>
    );
}
