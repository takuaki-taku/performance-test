import React from 'react';

const ResultList = ({ results }) => {
  if (!results || results.length === 0) {
    return <p>No results to display.</p>;
  }

  return (
    <ul>
      {results.map(result => (
        <li key={result.id}>
          Date: {result.date}, Long Jump - {result.long_jump}, 50m Run - {result.fifty_meter_run}, Spider - {result.spider}, 8-Shape Run - {result.eight_shape_run}, Ball Throw - {result.ball_throw}
        </li>
      ))}
    </ul>
  );
};

export default ResultList;