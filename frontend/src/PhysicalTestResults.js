import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Container, Table } from 'react-bootstrap';
import moment from 'moment'; // moment.js をインポート
import 'moment/locale/ja'; // 日本語ロケールをインポート

moment.locale('ja'); // 日本語ロケールを設定

function PhysicalTestResults() {
    const { userId } = useParams();
    const [results, setResults] = useState([]);
    const [userName, setUserName] = useState('');
    const [averageMaxData, setAverageMaxData] = useState(null);

    useEffect(() => {
        const fetchUserResults = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/users/${userId}`);
                setResults(response.data.results);
                setUserName(response.data.name);

                const userGrade = response.data.grade;

                if (userGrade) {
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
                                <td>{moment(result.date).format('YYYY年MM月DD日')}</td> {/* 日付をフォーマット */}
                                < td>{result.long_jump} m</td >
                                < td>{result.fifty_meter_run} 秒</td >
                                < td>{result.spider} 秒</td >
                                < td>{result.eight_shape_run} 回</td >
                                < td>{result.ball_throw} m</td >
                            </tr>
                        ))}
                    </tbody>
                </Table>
            ) : (
                <p>結果がありません</p>
            )}

            <h2>2023年度の全国大会平均/最大データ</h2>
            {averageMaxData && averageMaxData.length > 0 ? (
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
                        {averageMaxData.map((data) => (
                            <tr key={data.id}>
                                <td>{data.type}</td>
                                < td>{data.long_jump} m</td >
                                < td>{data.fifty_meter_run} 秒</td >
                                < td>{data.spider} 秒</td >
                                < td>{data.eight_shape_run} 回</td >
                                < td>{data.ball_throw} m</td >
                                <td>{data.total_score}点</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            ) : (
                <p>平均/最大データがありません</p>
            )}
        </Container>
    );
}

export default PhysicalTestResults;