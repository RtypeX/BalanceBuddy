'use client';

import FastingCalendar from '@/components/FastingCalendar';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";

const FastingCalendarPage = () => {
    const router = useRouter();

    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-2">
            <div className="flex items-center justify-between p-4 w-full max-w-md">
                <h1 className="text-2xl font-semibold">Fasting Calendar</h1>
                <Button variant="secondary" onClick={() => router.push('/home')}>Back to Home</Button>
            </div>
            <div className="w-full max-w-md">
                <FastingCalendar />
            </div>
        </div>
    );
};

export default FastingCalendarPage;
