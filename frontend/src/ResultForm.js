import React, { useState } from 'react';
import axios from 'axios';

const ResultForm = ({ userId }) => {
  const [date, setDate] = useState(''); // Dateの状態を追加
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
        date: date, // Dateを追加
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
    <form onSubmit={handleSubmit}>
      <div>
        <label>Date:</label> {/* Dateの入力フィールドを追加 */}
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>
      <div>
        < label>Long Jump:</label >
        <input type="number" value={longJump} onChange={(e) => setLongJump(e.target.value)} />
      </div>
      <div>
        < label>50m Run:</label >
        <input type="number" value={fiftyMeterRun} onChange={(e) => setFiftyMeterRun(e.target.value)} />
      </div>
      <div>
        <label>Spider:</label>
        <input type="number" value={spider} onChange={(e) => setSpider(e.target.value)} />
      </div>
      <div>
        < label>8-Shape Run:</label >
        <input type="number" value={eightShapeRun} onChange={(e) => setEightShapeRun(e.target.value)} />
      </div>
      <div>
        < label>Ball Throw:</label >
        <input type="number" value={ballThrow} onChange={(e) => setBallThrow(e.target.value)} />
      </div>
      <button type="submit">Create Result</button>
    </form>
  );
};

export default ResultForm;