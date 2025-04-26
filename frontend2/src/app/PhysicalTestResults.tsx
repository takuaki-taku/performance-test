import { useEffect, useState } from 'react';
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
    TooltipItem // TooltipItem
} from 'chart.js';


ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

interface PhysicalTestResultsProps {
    userId: number;
}

interface ChartData {
    labels: string[];
    datasets: {
        label: string;
        data: number[];
        backgroundColor: string;
    }[];
}

interface AverageMaxData {
    id: number;
    type: string;
    grade: string;
    long_jump: number;
    fifty_meter_run: number;
    spider: number;
    eight_shape_run: number;
    ball_throw: number;
    total_score: number;
}

interface Result {
    id: number;
    date: string;
    long_jump: number;
    fifty_meter_run: number;
    spider: number;
    eight_shape_run: number;
    ball_throw: number;
}

function PhysicalTestResults({ userId }: PhysicalTestResultsProps) {
    const [results, setResults] = useState<Result[] | null>(null);
    const [userName, setUserName] = useState<string | null>(null);
    const [averageMaxData, setAverageMaxData] = useState<AverageMaxData[] | null>(null);
    const [nationalDataGrade, setNationalDataGrade] = useState<string | null>(null);
    const [averageData, setAverageData] = useState<AverageMaxData | null>(null);
    const [maxData, setMaxData] = useState<AverageMaxData | null>(null);
    const [chartData, setChartData] = useState<ChartData | null>(null);


    useEffect(() => {
        const fetchUserResults = async () => {
            if (userId) {
                try {
                    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
                    const response = await axios.get(`${apiBase}/users/${userId}`);
                    console.log("API Response (fetchUserResults):", response.data); // APIレスポンスの確認
                    setResults(response.data.results);
                    setUserName(response.data.name);
                } catch (error: unknown) {
                    console.error(error);
                    setResults([]);
                    setUserName(null);
                }
            } else {
                setResults([]);
                setUserName(null);
            }
        };
        fetchUserResults();
    }, [userId]);
    
    useEffect(() => {
        const fetchUserData = async () => {
            if (userId) {
                try {
                    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
                    const userResponse = await axios.get(`${apiBase}/users/${userId}`);
                    console.log("API Response (fetchUserData):", userResponse.data); // APIレスポンスの確認
                    
                    setUserName(userResponse.data.name);
                    setResults(userResponse.data.results);
                    setNationalDataGrade(userResponse.data.grade);
                } catch (error: unknown) {
                    console.error("Error fetching user data:", error); // エラーハンドリングの強化
                }
            }
        };

        const fetchAverageMaxData = async () => {
            if (nationalDataGrade) {
                try {
                    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
                    const averageMaxDataResponse = await axios.get(`${apiBase}/average_max_data/grade/${nationalDataGrade}`);
                    console.log("API Response (fetchAverageMaxData):", averageMaxDataResponse.data); // APIレスポンスの確認
                    setAverageMaxData(averageMaxDataResponse.data);
                } catch (error: unknown) {
                    console.error("Error fetching average/max data:", error); // エラーハンドリングの強化
                }
            }
        };

        fetchUserData();
        fetchAverageMaxData();
    }, [userId, nationalDataGrade]);

    useEffect(() => {
        if (averageMaxData && nationalDataGrade) {
            const average = averageMaxData.find(item => item.type === '平均値');
            const max = averageMaxData.find(item => item.type === '最高値');

            setAverageData(average || null);
            setMaxData(max || null);
        }
    }, [averageMaxData, nationalDataGrade]);

    useEffect(() => {
        console.log("Results:", results);
        console.log("Average Data:", averageData);
        console.log("Max Data:", maxData);

        if (results && averageData && maxData) {
            const labels = results.map(result => moment(result.date).format('YYYY年MM月DD日'));
            const longJumpData = results.map(result => result.long_jump);
            const fiftyMeterRunData = results.map(result => result.fifty_meter_run);
            const spiderData = results.map(result => result.spider);
            const eightShapeRunData = results.map(result => result.eight_shape_run);
            const ballThrowData = results.map(result => result.ball_throw);

            // const diffFromAverageLongJump = longJumpData.map(value => value - (averageData?.long_jump || 0));
            // const diffFromAverageFiftyMeterRun = fiftyMeterRunData.map(value => value - (averageData?.fifty_meter_run || 0));
            // const diffFromAverageSpider = spiderData.map(value => value - (averageData?.spider || 0));
            // const diffFromAverageEightShapeRun = eightShapeRunData.map(value => value - (averageData?.eight_shape_run || 0));
            // const diffFromAverageBallThrow = ballThrowData.map(value => value - (averageData?.ball_throw || 0));

            // const diffFromMaxLongJump = longJumpData.map(value => value - (maxData?.long_jump || 0));
            // const diffFromMaxFiftyMeterRun = fiftyMeterRunData.map(value => value - (maxData?.fifty_meter_run || 0));
            // const diffFromMaxSpider = spiderData.map(value => value - (maxData?.spider || 0));
            // const diffFromMaxEightShapeRun = eightShapeRunData.map(value => value - (maxData?.eight_shape_run || 0));
            // const diffFromMaxBallThrow = ballThrowData.map(value => value - (maxData?.ball_throw || 0));

            const newChartData: ChartData = {
                labels: labels,
                datasets: [
                    {
                        label: '立ち幅跳び (個人結果)',
                        data: longJumpData,
                        backgroundColor: 'rgba(75, 192, 192, 0.5)',
                    },
                    {
                        label: '50m走 (個人結果)',
                        data: fiftyMeterRunData,
                        backgroundColor: 'rgba(255, 206, 86, 0.5)',
                    },
                    {
                        label: 'スパイダー (個人結果)',
                        data: spiderData,
                        backgroundColor: 'rgba(54, 162, 235, 0.5)',
                    },
                    {
                        label: '8の字走 (個人結果)',
                        data: eightShapeRunData,
                        backgroundColor: 'rgba(255, 99, 132, 0.5)',
                    },
                    {
                        label: 'ボール投げ (個人結果)',
                        data: ballThrowData,
                        backgroundColor: 'rgba(75, 192, 192, 0.5)',
                    },
                ],
            };
            console.log("Chart Data:", newChartData);
            setChartData(newChartData);
        }
    }, [results, averageData, maxData]);

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: true,
                text: '体力テスト結果',
            },
            tooltip: {
                callbacks: {
                    label: function (context: TooltipItem<"bar">) {
                        let label = context.dataset.label || '';

                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            label += new Intl.NumberFormat('ja-JP', { style: 'decimal' }).format(context.parsed.y);
                        }
                        return label;
                    }
                }
            }
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
                            <td>{result.long_jump} m</td>
                            <td>{result.fifty_meter_run} 秒</td>
                            <td>{result.spider} 秒</td>
                            <td>{result.eight_shape_run} 回</td>
                            <td>{result.ball_throw} m</td>
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
                            <td>{data.long_jump / 100} m</td>
                            <td>{data.fifty_meter_run} 秒</td>
                            <td>{data.spider} 秒</td>
                            <td>{data.eight_shape_run} 回</td>
                            <td>{data.ball_throw} m</td>
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