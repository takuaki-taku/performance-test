import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Container, Table } from 'react-bootstrap';
import moment from 'moment';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import 'moment/locale/ja';

moment.locale('ja');

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

function PhysicalTestResults() {
    const { userId } = useParams();
    const [results, setResults] = useState([]);
    const [userName, setUserName] = useState('');
    const [averageMaxData, setAverageMaxData] = useState(null);
    const [chartData, setChartData] = useState(null);
    const [nationalDataGrade, setNationalDataGrade] = useState(''); // Add this line
    const [averageData, setAverageData] = useState(null);
    const [maxData, setMaxData] = useState(null);


    useEffect(() => {
        const fetchUserResults = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/users/${userId}`);
                // Sort results by date in descending order (newest first)
                const sortedResults = response.data.results.sort((a, b) => new Date(b.date) - new Date(a.date));
                setResults(sortedResults);
                setUserName(response.data.name);

                const userGrade = response.data.grade;

                if (userGrade) {
                    const averageMaxDataResponse = await axios.get(`http://localhost:8000/average_max_data/grade/${encodeURIComponent(userGrade)}`);
                    setAverageMaxData(averageMaxDataResponse.data);
                    setNationalDataGrade(userGrade);
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

    useEffect(() => {
        if (results && results.length > 0 && averageMaxData && averageMaxData.length > 0) {
            console.log('averageMaxData:', averageMaxData);

            const labels = results.map(result => moment(result.date).format('YYYY年MM月DD日'));

            // ユーザーのグレードでフィルタリング
            const filteredAverageMaxData = averageMaxData.filter(item => item.grade === nationalDataGrade);
            console.log('filteredAverageMaxData:', filteredAverageMaxData);

            // 全国大会の平均値と最大値を取得
            const average = filteredAverageMaxData.find(item => item.type === '平均値');
            const max = filteredAverageMaxData.find(item => item.type === '最高値');
            console.log('average:', average); // Add this line
            console.log('max:', max); // Add this line

            setAverageData(average);
            setMaxData(max);

            const longJumpData = results.map(result => result.long_jump);
            const fiftyMeterRunData = results.map(result => result.fifty_meter_run);
            const spiderData = results.map(result => result.spider);
            const eightShapeRunData = results.map(result => result.eight_shape_run);
            const ballThrowData = results.map(result => result.ball_throw);

            setChartData({
                labels: labels,
                datasets: [
                    {
                        label: '立ち幅跳び (m)',
                        data: longJumpData,
                        backgroundColor: 'rgba(255, 99, 132, 0.5)',
                    },
                    {
                        label: '50m走 (秒)',
                        data: fiftyMeterRunData,
                        backgroundColor: 'rgba(54, 162, 235, 0.5)',
                    },
                    {
                        label: 'スパイダー (回)',
                        data: spiderData,
                        backgroundColor: 'rgba(255, 206, 86, 0.5)',
                    },
                    {
                        label: '8の字走 (秒)',
                        data: eightShapeRunData,
                        backgroundColor: 'rgba(75, 192, 192, 0.5)',
                    },
                    {
                        label: 'ボール投げ (m)',
                        data: ballThrowData,
                        backgroundColor: 'rgba(153, 102, 255, 0.5)',
                    },
                ],
            });
        } else {
            setChartData(null);
            setAverageData(null);
            setMaxData(null);
        }
    }, [results, averageMaxData, nationalDataGrade]);

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: '体力テスト結果',
            },
            tooltip: {
                callbacks: {
                    label: (context) => {
                        console.log('averageData:', averageData);
                        console.log('maxData:', maxData);
                        const datasetIndex = context.datasetIndex;
                        const dataIndex = context.dataIndex;
                        const value = context.dataset.data[dataIndex];
        
                        let diffFromAverage = 0;
                        let diffFromMax = 0;
        
                        if (averageData && maxData) {
                            switch (datasetIndex) {
                                case 0: // 立ち幅跳び
                                    diffFromAverage = value - averageData.long_jump;
                                    diffFromMax = value - maxData.long_jump;
                                    break;
                                case 1: // 50m走
                                    diffFromAverage = value - averageData.fifty_meter_run;
                                    diffFromMax = value - maxData.fifty_meter_run;
                                    break;
                                case 2: // スパイダー
                                    diffFromAverage = value - averageData.spider;
                                    diffFromMax = value - maxData.spider;
                                    break;
                                case 3: // 8の字走
                                    diffFromAverage = value - averageData.eight_shape_run;
                                    diffFromMax = value - maxData.eight_shape_run;
                                    break;
                                case 4: // ボール投げ
                                    diffFromAverage = value - averageData.ball_throw;
                                    diffFromMax = value - maxData.ball_throw;
                                    break;
                                default:
                                    break;
                            }
                        }

                        const diffFromAverageText = `平均との差: ${diffFromAverage.toFixed(2)}`;
                        const diffFromMaxText = `最大との差: ${diffFromMax.toFixed(2)}`;

                        return `${context.dataset.label}: ${value}\n${diffFromAverageText}\n${diffFromMaxText}`;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true, // Y軸の最小値を0に設定
            },
        },
    };

    return (
        <Container>
            <h1>{userName}さんの体力テスト結果</h1>

            {chartData && (
                <Bar options={chartOptions} data={chartData} />
            )}

            <h2>個人の結果</h2>
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
                                <td>{moment(result.date).format('YYYY年MM月DD日')}</td>
                                < td>{result.long_jump} m</td>
                                < td>{result.fifty_meter_run} 秒</td>
                                < td>{result.spider} 秒</td>
                                < td>{result.eight_shape_run} 回</td>
                                < td>{result.ball_throw} m</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            ) : (
                <p>結果がありません</p>
            )}
            <h2>
                {nationalDataGrade ? `${nationalDataGrade}の2023年度全国大会平均/最大データ` : '2023年度全国大会平均/最大データ'}
            </h2>
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
                    </tr>
                    </thead>
                    <tbody>
                        {averageMaxData.map((data) => (
                            <tr key={data.id}>
                                <td>{data.type}</td>
                                < td>{data.long_jump} m</td>
                                < td>{data.fifty_meter_run} 秒</td>
                                < td>{data.spider} 秒</td>
                                < td>{data.eight_shape_run} 回</td>
                                < td>{data.ball_throw} m</td>
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