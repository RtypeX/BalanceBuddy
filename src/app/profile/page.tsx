'use client';

import Profile from '@/components/Profile';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";

const ProfilePage = () => {
    const router = useRouter();

    return (
        <div>
            <div className="flex items-center justify-between p-4">
                <h1 className="text-2xl font-semibold">Profile</h1>
                <Button variant="secondary" onClick={() => router.push('/home')}>Back to Home</Button>
            </div>
            <Profile />
        </div>
    );
};

export default ProfilePage;
