'use client';

import ProgressTracker from '@/components/ProgressTracker';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";

const ProgressTrackerPage = () => {
    const router = useRouter();

    return (
        <div>
            <div className="flex items-center justify-between p-4">
                <h1 className="text-2xl font-semibold">Progress Tracker</h1>
                <Button variant="secondary" onClick={() => router.push('/home')}>Back to Home</Button>
            </div>
            <ProgressTracker />
        </div>
    );
};

export default ProgressTrackerPage;
