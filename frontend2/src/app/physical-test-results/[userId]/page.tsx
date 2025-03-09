"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import PhysicalTestResults from '@/app/PhysicalTestResults';

export default function PhysicalTestResultsPage() {
    const params = useParams();
    const userId = params.userId;

    return (
        <div>
            <PhysicalTestResults userId={Number(userId)} />
        </div>
    );
}
