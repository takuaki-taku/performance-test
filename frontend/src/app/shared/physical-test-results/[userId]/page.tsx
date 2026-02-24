'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import PhysicalTestResults from '@/components/admin/PhysicalTestResults';

export default function SharedPhysicalTestResultsPage() {
    const params = useParams();
    const userId = params.userId as string;
    
    return (
        <div style={{ padding: '20px', backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
            <PhysicalTestResults userId={userId} />
        </div>
    );
}
