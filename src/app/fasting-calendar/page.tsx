'use client';

import FastingCalendar from '@/components/FastingCalendar';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";

const FastingCalendarPage = () => {
    const router = useRouter();

    return (
        <div>
            <div className="flex items-center justify-between p-4">
                <h1 className="text-2xl font-semibold">Fasting Calendar</h1>
                <Button variant="secondary" onClick={() => router.push('/home')}>Back to Home</Button>
            </div>
            <FastingCalendar />
        </div>
    );
};

export default FastingCalendarPage;
