/* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// @ts-ignore
'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Table } from 'react-bootstrap';
import moment from 'moment';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    TooltipItem,
    ChartOptions,
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler
} from 'chart.js';
// @ts-ignore
import { Radar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler
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

interface RadarChartData {
    labels: string[];
    datasets: {
        label: string;
        data: number[];
        backgroundColor: string;
        borderColor: string;
        borderWidth: number;
        fill: boolean;
    }[];
}

interface AverageData {
    id: number;
    grade: string;
    long_jump_cm: number;
    fifty_meter_run_ms: number;
    spider_ms: number;
    eight_shape_run_count: number;
    ball_throw_cm: number;
    total_score: number | null;
}

interface MaxData {
    id: number;
    grade: string;
    long_jump_cm: number;
    fifty_meter_run_ms: number;
    spider_ms: number;
    eight_shape_run_count: number;
    ball_throw_cm: number;
    total_score: number | null;
}

interface Result {
    id: number;
    date: string;
    long_jump_cm: number;
    fifty_meter_run_ms: number;
    spider_ms: number;
    eight_shape_run_count: number;
    ball_throw_cm: number;
}

interface DisplayData extends AverageData {
    type: string;
    long_jump: number;
    fifty_meter_run: number;
    spider: number;
    eight_shape_run: number;
    ball_throw: number;
}

function PhysicalTestResults({ userId }: PhysicalTestResultsProps) {
    const [results, setResults] = useState<Result[] | null>(null);
    const [userName, setUserName] = useState<string | null>(null);
    const [averageMaxData, setAverageMaxData] = useState<DisplayData[] | null>(null);
    const [nationalDataGrade, setNationalDataGrade] = useState<string | null>(null);
    const [averageData, setAverageData] = useState<DisplayData | null>(null);
    const [maxData, setMaxData] = useState<DisplayData | null>(null);
    const [chartData, setChartData] = useState<ChartData | null>(null);
    const [radarChartData, setRadarChartData] = useState<RadarChartData | null>(null);


    useEffect(() => {
        const fetchUserResults = async () => {
            if (userId) {
                try {
                    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
                    const response = await axios.get(`${apiBase}/user_results/${userId}`);
                    console.log("API Response (fetchUserResults):", response.data);

                    // データを変換
                    const convertedResults = response.data.map((result: Result) => {
                        console.log("Original Result:", result); // 変換前のデータを確認

                        return {
                            ...result,
                            long_jump: result.long_jump_cm,
                            fifty_meter_run: result.fifty_meter_run_ms,
                            spider: result.spider_ms,
                            ball_throw: result.ball_throw_cm
                        };
                    });

                    console.log("Converted Results:", convertedResults); // 変換後のデータを確認
                    setResults(convertedResults);
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
                    console.log("API Response (fetchUserData):", userResponse.data);
                    
                    setUserName(userResponse.data.name);
                    setResults(userResponse.data.results);
                    setNationalDataGrade(userResponse.data.grade);

                    // 全国平均データと最大値データの取得
                    if (userResponse.data.grade) {
                        try {
                            const [averageResponse, maxResponse] = await Promise.all([
                                axios.get(`${apiBase}/average_data/grade/${userResponse.data.grade}`),
                                axios.get(`${apiBase}/max_data/grade/${userResponse.data.grade}`)
                            ]);
                            
                            console.log("Average Data Response:", averageResponse.data);
                            console.log("Max Data Response:", maxResponse.data);
                            
                            const averageData = {
                                ...averageResponse.data,
                                long_jump: averageResponse.data.long_jump_cm,
                                fifty_meter_run: averageResponse.data.fifty_meter_run_ms,
                                spider: averageResponse.data.spider_ms,
                                eight_shape_run: averageResponse.data.eight_shape_run_count,
                                ball_throw: averageResponse.data.ball_throw_cm
                            };

                            const maxData = {
                                ...maxResponse.data,
                                long_jump: maxResponse.data.long_jump_cm,
                                fifty_meter_run: maxResponse.data.fifty_meter_run_ms,
                                spider: maxResponse.data.spider_ms,
                                eight_shape_run: maxResponse.data.eight_shape_run_count,
                                ball_throw: maxResponse.data.ball_throw_cm
                            };
                            
                            setAverageData(averageData);
                            setMaxData(maxData);
                            
                            // テーブル表示用のデータを設定
                            setAverageMaxData([
                                { ...averageData, type: '平均値', long_jump: averageData.long_jump, fifty_meter_run: averageData.fifty_meter_run, spider: averageData.spider, eight_shape_run: averageData.eight_shape_run, ball_throw: averageData.ball_throw },
                                { ...maxData, type: '最高値', long_jump: maxData.long_jump, fifty_meter_run: maxData.fifty_meter_run, spider: maxData.spider, eight_shape_run: maxData.eight_shape_run, ball_throw: maxData.ball_throw }
                            ]);
                } catch (error: unknown) {
                            console.error("Error fetching average/max data:", error);
                        }
                    }
                } catch (error: unknown) {
                    console.error("Error fetching user data:", error);
                }
            }
        };

        fetchUserData();
    }, [userId]);

    useEffect(() => {
        console.log("Results:", results);
        console.log("Average Data:", averageData);
        console.log("Max Data:", maxData);

        if (results && averageData && maxData) {
            const labels = results.map(result => moment(result.date).format('YYYY年MM月DD日'));
            const longJumpData = results.map(result => result.long_jump_cm);
            const fiftyMeterRunData = results.map(result => result.fifty_meter_run_ms);
            const spiderData = results.map(result => result.spider_ms);
            const eightShapeRunData = results.map(result => result.eight_shape_run_count);
            const ballThrowData = results.map(result => result.ball_throw_cm);

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

    useEffect(() => {
        if (results && averageData && maxData) {
            // 最新の結果を取得
            const latestResult = results[results.length - 1];
            
            // デバッグ用のログ
            console.log('最新の個人記録:', latestResult);
            console.log('全国平均データ:', averageData);
            console.log('全国最大データ:', maxData);
            
            // 各項目の偏差値を計算
            const calculateDeviation = (value: number, average: number, type: string) => {
                // デバッグ用のログ
                console.log(`${type}の計算:`, {
                    value,
                    average,
                    diff: value - average
                });

                // 立ち幅跳びとボール投げの場合、値が大きいほど良い
                if (type === 'long_jump' || type === 'ball_throw') {
                    const deviation = 50 + ((value - average) / average) * 50;
                    console.log(`${type}の偏差値:`, deviation);
                    return Math.min(Math.max(deviation, 0), 100);
                }
                // 8の字走の場合、回数が多いほど良い
                else if (type === 'eight_shape_run') {
                    const deviation = 50 + ((value - average) / average) * 50;
                    console.log(`${type}の偏差値:`, deviation);
                    return Math.min(Math.max(deviation, 0), 100);
                }
                // その他の項目（時間系）の場合、値が小さいほど良い
                else {
                    const deviation = 50 + ((average - value) / average) * 50;
                    console.log(`${type}の偏差値:`, deviation);
                    return Math.min(Math.max(deviation, 0), 100);
                }
            };

            const newRadarChartData: RadarChartData = {
                labels: ['立ち幅跳び', '50m走', 'スパイダー', '8の字走', 'ボール投げ'],
                datasets: [
                    {
                        label: '個人結果(最新)',
                        data: [
                            calculateDeviation(latestResult.long_jump_cm, averageData.long_jump_cm, 'long_jump'),
                            calculateDeviation(latestResult.fifty_meter_run_ms, averageData.fifty_meter_run_ms, 'fifty_meter_run'),
                            calculateDeviation(latestResult.spider_ms, averageData.spider_ms, 'spider'),
                            calculateDeviation(latestResult.eight_shape_run_count, averageData.eight_shape_run_count, 'eight_shape_run'),
                            calculateDeviation(latestResult.ball_throw_cm, averageData.ball_throw_cm, 'ball_throw')
                        ],
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 2,
                        fill: true
                    },
                    {
                        label: '全国平均',
                        data: [50, 50, 50, 50, 50],
                        backgroundColor: 'rgba(255, 99, 132, 0.2)',
                        borderColor: 'rgba(255, 99, 132, 1)',
                        borderWidth: 2,
                        fill: true
                    }
                ]
            };
            setRadarChartData(newRadarChartData);
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

    const radarChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: true,
                text: '平均値との比較（偏差値）',
            },
            tooltip: {
                callbacks: {
                    label: function (context: TooltipItem<"radar">) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.r !== null) {
                            label += new Intl.NumberFormat('ja-JP', { style: 'decimal', maximumFractionDigits: 1 }).format(context.parsed.r);
                        }
                        return label;
                    }
                }
            }
        },
        scales: {
            r: {
                min: 30,
                max: 70,
                ticks: {
                    stepSize: 10
                }
            }
        }
    };

    return (
    <Container>
        <h1>{userName}さんの体力テスト結果</h1>

        {radarChartData && (
            <div style={{ height: '400px', width: '400px', margin: '0 auto' }}>
                <Radar data={radarChartData} options={radarChartOptions} />
            </div>
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
                            <td>{result.long_jump_cm} cm</td>
                            <td>{result.fifty_meter_run_ms/100} 秒</td>
                            <td>{result.spider_ms/100} 秒</td>
                            <td>{result.eight_shape_run_count} 回</td>
                            <td>{result.ball_throw_cm/100} m</td>
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
                            <td>{data.long_jump_cm} cm</td>
                            <td>{data.fifty_meter_run_ms/100} 秒</td>
                            <td>{data.spider_ms/100} 秒</td>
                            <td>{data.eight_shape_run_count} 回</td>
                            <td>{data.ball_throw_cm/100} m</td>
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