import React, { useState, useEffect } from 'react';
import UserForm from './UserForm';
import UserList from './UserList';
import ResultForm from './ResultForm';
import ResultList from './ResultList';
import axios from 'axios';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PhysicalTestResults from './PhysicalTestResults'; // PhysicalTestResultsコンポーネントをインポート

function App() {
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUserName, setSelectedUserName] = useState(null); // 名前を保持する新しいstate
  const [userResults, setUserResults] = useState(null); // 初期値を null に変更


  useEffect(() => {
    const fetchUserResults = async () => {
      if (selectedUserId) {
        try {
          const response = await axios.get(`http://localhost:8000/users/${selectedUserId}`);
          console.log("API Response:", response.data); // データの確認
          setUserResults(response.data.results);
          setSelectedUserName(response.data.name); // ユーザー名を設定
        } catch (error) {
          console.error(error);
          setUserResults([]); // エラーが発生した場合も空の配列を設定
          setSelectedUserName(null); // エラーが発生した場合、ユーザー名をnullに設定
        }
      } else {
        setUserResults([]); // selectedUserId が null の場合も null を設定
        setSelectedUserName(null); // selectedUserId が null の場合も null を設定
      }
    };
    fetchUserResults();
  }, [selectedUserId]);

  const handleUserSelect = (userId) => {
    setSelectedUserId(userId);
  };

  const handleResultDeleted = (deletedResultId) => {
    setUserResults(prevResults => prevResults.filter(result => result.id !== deletedResultId));
  };


  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/physical-test-results/:userId" element={<PhysicalTestResults />} /> {/* /physical-test-results/:userIdへのルート */}
          <Route path="/" element={
            <div>
            <h1>Create User</h1>
            <UserForm />
            <h1>User List</h1>
            <UserList onUserSelect={handleUserSelect} />
              {selectedUserId && (
                <div>
                  <h2>Add Result for User {selectedUserName}</h2>
                  <ResultForm userId={selectedUserId} />
                  
                  <h2>Results: {selectedUserName}</h2>
                  {selectedUserId && ( // selectedUserId が null でない場合に ResultList をレンダリング
                  <ResultList results={userResults}
                      userId={selectedUserId}
                      onResultDeleted={handleResultDeleted}/>
                  )}
                </div>
              )}
              </div>
            }/>
        </Routes>
      </div>
    </Router>
  );
}

export default App;