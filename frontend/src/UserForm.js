import React, { useState } from 'react';
import axios from 'axios';

const UserForm = () => {
  const [name, setName] = useState('');
  const [grade, setGrade] = useState('');
  const [error, setError] = useState(''); // エラーメッセージの状態を追加

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !grade) {
      setError('Name and Grade are required.'); // エラーメッセージを設定
      return; // 送信を中止
    }

    setError(''); // エラーメッセージをクリア

    try {
      await axios.post('http://localhost:8000/users/', { name, grade });
      setName('');
      setGrade('');
      alert('User created successfully!');
    } catch (error) {
      console.error(error);
      alert('Failed to create user.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div style={{ color: 'red' }}>{error}</div>} {/* エラーメッセージを表示 */}
      <div>
        <label>Name:</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div>
        <label>Grade:</label>
        <input type="text" value={grade} onChange={(e) => setGrade(e.target.value)} />
      </div>
      <button type="submit">Create User</button>
    </form>
  );
};

export default UserForm;