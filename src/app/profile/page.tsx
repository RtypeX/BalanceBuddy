'use client';

import Profile from '@/components/Profile';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";

const ProfilePage = () => {
    const router = useRouter();

    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-2">
            <div className="flex items-center justify-between p-4 w-full max-w-md">
                <h1 className="text-2xl font-semibold">Profile</h1>
                <Button variant="secondary" onClick={() => router.push('/home')}>Back to Home</Button>
            </div>
            <div className="w-full max-w-md">
                <Profile />
            </div>
        </div>
    );
};

export default ProfilePage;
