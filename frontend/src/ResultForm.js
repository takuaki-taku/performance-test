import React, { useState } from 'react';
import axios from 'axios';
import { Form, Button } from 'react-bootstrap';

const ResultForm = ({ userId }) => {
  const [date, setDate] = useState('');
  const [longJump, setLongJump] = useState('');
  const [fiftyMeterRun, setFiftyMeterRun] = useState('');
  const [spider, setSpider] = useState('');
  const [eightShapeRun, setEightShapeRun] = useState('');
  const [ballThrow, setBallThrow] = useState('');

  const handleSubmit = async (e) => {
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
    } catch (error) {
      console.error(error);
      alert('Failed to create result.');
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-3">
        <Form.Label>Date:</Form.Label>
        <Form.Control
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Long Jump:</Form.Label>
        <Form.Control
          type="number"
          value={longJump}
          onChange={(e) => setLongJump(e.target.value)}
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>50m Run:</Form.Label>
        <Form.Control
          type="number"
          value={fiftyMeterRun}
          onChange={(e) => setFiftyMeterRun(e.target.value)}
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Spider:</Form.Label>
        <Form.Control
          type="number"
          value={spider}
          onChange={(e) => setSpider(e.target.value)}
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>8-Shape Run:</Form.Label>
        <Form.Control
          type="number"
          value={eightShapeRun}
          onChange={(e) => setEightShapeRun(e.target.value)}
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Ball Throw:</Form.Label>
        <Form.Control
          type="number"
          value={ballThrow}
          onChange={(e) => setBallThrow(e.target.value)}
        />
      </Form.Group>
      <Button variant="primary" type="submit">
        Create Result
      </Button>
    </Form>
  );
};

export default ResultForm;