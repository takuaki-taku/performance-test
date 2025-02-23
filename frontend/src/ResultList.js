import React from 'react';
import { Table, Button } from 'react-bootstrap';
import axios from 'axios';

const ResultList = ({ results, userId, onResultDeleted }) => { // onResultDeleted を追加
  const handleDelete = async (resultId) => {
    if (window.confirm('本当にこの結果を削除しますか？')) {
      try {
        await axios.delete(`http://localhost:8000/user_results/${resultId}`);
        alert('Result deleted successfully!');
        onResultDeleted(resultId);
      } catch (error) {
        console.error(error);
        alert('Failed to delete result.');
      }
    }
  };

  if (!results || results.length === 0) {
    return <p>No results found.</p>;
  }

  return (
    <Table striped bordered hover>
      <thead>
        <tr>
          <th>Date</th>
          <th>Long Jump</th>
          <th>50m Run</th>
          <th>Spider</th>
          <th>8-Shape Run</th>
          <th>Ball Throw</th>
        </tr>
      </thead>
      <tbody>
        {results.map((result) => (
          <tr key={result.id}>
            <td>{result.date}</td>
            <td>{result.long_jump}</td>
            <td>{result.fifty_meter_run}</td>
            <td>{result.spider}</td>
            <td>{result.eight_shape_run}</td>
            <td>{result.ball_throw}</td>
            <td>
              <Button variant="danger" onClick={() => handleDelete(result.id)}>
                Delete
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default ResultList;