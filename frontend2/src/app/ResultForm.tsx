"use client";

import React, { useState } from 'react';
import axios from 'axios';
import { Form, Button } from 'react-bootstrap';

interface ResultFormProps {
    userId: number | null;
}

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
            await axios.post('http://localhost:8000/user_results/', {
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
            <Form.Group className="mb-3">
                <Form.Label>Date:</Form.Label>
                <Form.Control
                    type="date"
                    value={date}
                    onChange={(e) => setDate((e.target as HTMLInputElement).value)}
                />
            </Form.Group>
            <Form.Group className="mb-3">
                <Form.Label>Long Jump:</Form.Label>
                <Form.Control
                    type="number"
                    value={longJump}
                    onChange={(e) => setLongJump((e.target as HTMLInputElement).value)}
                />
            </Form.Group>
            <Form.Group className="mb-3">
                <Form.Label>50m Run:</Form.Label>
                <Form.Control
                    type="number"
                    value={fiftyMeterRun}
                    onChange={(e) => setFiftyMeterRun((e.target as HTMLInputElement).value)}
                />
            </Form.Group>
            <Form.Group className="mb-3">
                <Form.Label>Spider:</Form.Label>
                <Form.Control
                    type="number"
                    value={spider}
                    onChange={(e) => setSpider((e.target as HTMLInputElement).value)}
                />
            </Form.Group>
            <Form.Group className="mb-3">
                <Form.Label>8-Shape Run:</Form.Label>
                <Form.Control
                    type="number"
                    value={eightShapeRun}
                    onChange={(e) => setEightShapeRun((e.target as HTMLInputElement).value)}
                />
            </Form.Group>
            <Form.Group className="mb-3">
                <Form.Label>Ball Throw:</Form.Label>
                <Form.Control
                    type="number"
                    value={ballThrow}
                    onChange={(e) => setBallThrow((e.target as HTMLInputElement).value)}
                />
            </Form.Group>
            <Button variant="primary" type="submit">
                Create Result
            </Button>
        </Form>
    );
};

export default ResultForm;