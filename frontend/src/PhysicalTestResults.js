import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Container, Table } from 'react-bootstrap'; // Bootstrapのコンポーネントをインポート

function PhysicalTestResults() {
    const { userId } = useParams();
    const [results, setResults] = useState([]);
    const [userName, setUserName] = useState('');
    const [averageMaxData, setAverageMaxData] = useState(null); // AverageMaxData用のstateを追加

    useEffect(() => {
        const fetchUserResults = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/users/${userId}`);
                setResults(response.data.results);
                setUserName(response.data.name);

                // ユーザーの grade を取得
                const userGrade = response.data.grade;

                // grade に基づいて AverageMaxData を取得
                if (userGrade) {
                    // URLエンコードを避けるためにテンプレートリテラルを使用
                    const averageMaxDataResponse = await axios.get(`http://localhost:8000/average_max_data/grade/${encodeURIComponent(userGrade)}`);
                    setAverageMaxData(averageMaxDataResponse.data);
                } else {
                    setAverageMaxData(null);
                }

            } catch (error) {
                console.error(error);
                alert('Failed to fetch results.');
            }
        };

        fetchUserResults();
    }, [userId]);

    return (
        <Container>
            <h1>{userName}さんの体力テスト結果</h1>
            {results && results.length > 0 ? (
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>日付</th>
                            <th>立ち幅跳び</th>
                            <th>50m走</th>
                            <th>スパイダー</th>
                            <th>8の字走</th>
                            <th>ボール投げ</th>
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
                            </tr>
                        ))}
                    </tbody>
                </Table>
            ) : (
                <p>結果がありません</p>
            )}

            {/* AverageMaxDataの表示 */}
            <h2>平均/最大データ</h2>
            {averageMaxData ? (
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>タイプ</th>
                            <th>立ち幅跳び</th>
                            <th>50m走</th>
                            <th>スパイダー</th>
                            <th>8の字走</th>
                            <th>ボール投げ</th>
                            <th>合計スコア</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>{averageMaxData.type}</td>
                            <td>{averageMaxData.long_jump}</td>
                            <td>{averageMaxData.fifty_meter_run}</td>
                            <td>{averageMaxData.spider}</td>
                            <td>{averageMaxData.eight_shape_run}</td>
                            <td>{averageMaxData.ball_throw}</td>
                            <td>{averageMaxData.total_score}</td>
                        </tr>
                    </tbody>
                </Table>
            ) : (
                <p>平均/最大データがありません</p>
            )}
        </Container>
    );
}

export default PhysicalTestResults;