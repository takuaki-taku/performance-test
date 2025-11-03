"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import PhysicalTestResults from '@/app/PhysicalTestResults';
import { useEffect } from 'react';

export default function PhysicalTestResultsPage() {
    const params = useParams();
    const userId = params.userId;
    
    useEffect(() => {
        const idNum = Number(userId);
        if (!Number.isNaN(idNum)) {
            try {
                localStorage.setItem('userId', String(idNum));
            } catch {}
        }
    }, [userId]);

    return (
        <div>
            <PhysicalTestResults userId={Number(userId)} />
        </div>
    );
}
