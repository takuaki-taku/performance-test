import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserList = ({ onUserSelect }) => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:8000/users/');
        setUsers(response.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchUsers();
  }, []);

  return (
    <ul>
      {users.map(user => (
        <li key={user.id} onClick={() => onUserSelect(user.id)}>
          {user.name} (Grade: {user.grade})
        </li>
      ))}
    </ul>
  );
};

export default UserList;