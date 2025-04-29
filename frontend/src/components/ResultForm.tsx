/* eslint-disable @typescript-eslint/ban-ts-comment */

"use client";

import React, { useState } from 'react';
import axios from 'axios';
import { Form, Button } from 'react-bootstrap';

interface ResultFormProps {
    userId: number | null;
}

// フォームフィールド用の小さなサブコンポーネント
interface InputGroupProps {
    label: string
    type: string
    value: string
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}
const InputGroup: React.FC<InputGroupProps> = ({ label, type, value, onChange }) => (
    <Form.Group className="mb-3">
        <Form.Label>{label}</Form.Label>
        <Form.Control type={type} value={value} onChange={onChange} />
    </Form.Group>
)

const ResultForm: React.FC<ResultFormProps> = ({ userId }) => {
    const [date, setDate] = useState<string>('');
    const [longJump, setLongJump] = useState<string>('');
    const [fiftyMeterRun, setFiftyMeterRun] = useState<string>('');
    const [spider, setSpider] = useState<string>('');
    const [eightShapeRun, setEightShapeRun] = useState<string>('');
    const [ballThrow, setBallThrow] = useState<string>('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
            await axios.post(`${apiBase}/user_results/`, {
                user_id: userId,
                date: date,
                long_jump: parseFloat(longJump),
                fifty_meter_run: parseFloat(fiftyMeterRun),
                spider: parseFloat(spider),
                eight_shape_run: parseFloat(eightShapeRun),
                ball_throw: parseFloat(ballThrow),
            });
            alert('Result created successfully!');
        } catch (error: unknown) {
            console.error(error);
            alert('Failed to create result.');
        }
    };

    if (!userId) {
        return <p>ユーザーが選択されていません</p>;
    }

    return (
        <Form onSubmit={handleSubmit}>
            <InputGroup label="Date:" type="date" value={date} onChange={e => setDate(e.target.value)} />
            <InputGroup label="Long Jump:" type="number" value={longJump} onChange={e => setLongJump(e.target.value)} />
            <InputGroup label="50m Run:" type="number" value={fiftyMeterRun} onChange={e => setFiftyMeterRun(e.target.value)} />
            <InputGroup label="Spider:" type="number" value={spider} onChange={e => setSpider(e.target.value)} />
            <InputGroup label="8-Shape Run:" type="number" value={eightShapeRun} onChange={e => setEightShapeRun(e.target.value)} />
            <InputGroup label="Ball Throw:" type="number" value={ballThrow} onChange={e => setBallThrow(e.target.value)} />
            <button className="btn btn-primary" type="submit">Create Result</button>
        </Form>
    );
};

export default ResultForm;