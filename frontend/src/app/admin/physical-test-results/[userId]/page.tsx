"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import PhysicalTestResults from '@/components/admin/PhysicalTestResults';
import { useEffect } from 'react';

export default function PhysicalTestResultsPage() {
    const params = useParams();
    const userId = params.userId as string; // UUID文字列として扱う
    
    useEffect(() => {
        if (userId) {
            try {
                localStorage.setItem('userId', userId);
            } catch {}
        }
    }, [userId]);

    return (
        <div>
            <PhysicalTestResults userId={userId} />
        </div>
    );
}
