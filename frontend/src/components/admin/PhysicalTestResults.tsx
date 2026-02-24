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
import { Radar, Line } from 'react-chartjs-2';

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
    userId: string; // UUID型に変更
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
    const [selectedTab, setSelectedTab] = useState<string>('long_jump');




    useEffect(() => {
        const fetchUserResults = async () => {
            if (userId) {
                try {
                    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
                    const response = await axios.get(`${apiBase}/user_results/${userId}`);
                    console.log("API Response (fetchUserResults):", response.data);

                    // データを変換（user_idを含める）
                    const convertedResults = response.data.map((result: any) => {
                        console.log("Original Result:", result); // 変換前のデータを確認

                        return {
                            ...result,
                            user_id: result.user_id || userId, // user_idを確実に含める
                            long_jump: result.long_jump_cm,
                            fifty_meter_run: result.fifty_meter_run_ms,
                            spider: result.spider_ms,
                            ball_throw: result.ball_throw_cm
                        };
                    });

                    console.log("Converted Results:", convertedResults); // 変換後のデータを確認
                    setResults(convertedResults);
                } catch (error: unknown) {
                    console.error(error);
                    setResults([]);
                }
            } else {
                setResults([]);
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

                    if (userResponse.data.name) {
                        setUserName(userResponse.data.name);
                    }
                    if (userResponse.data.grade) {
                        setNationalDataGrade(userResponse.data.grade);
                    }
                } catch (error: unknown) {
                    console.error("Error fetching user data:", error);
                }
            }
        };
        fetchUserData();
    }, [userId]);

    useEffect(() => {
        const fetchAverageMaxData = async () => {
            if (nationalDataGrade) {
                try {
                    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
                    const [averageResponse, maxResponse] = await Promise.all([
                        axios.get(`${apiBase}/average_data/grade/${nationalDataGrade}`),
                        axios.get(`${apiBase}/max_data/grade/${nationalDataGrade}`)
                    ]);

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

                    setAverageMaxData([
                        { ...averageData, type: '平均値', long_jump: averageData.long_jump, fifty_meter_run: averageData.fifty_meter_run, spider: averageData.spider, eight_shape_run: averageData.eight_shape_run, ball_throw: averageData.ball_throw },
                        { ...maxData, type: '最高値', long_jump: maxData.long_jump, fifty_meter_run: maxData.fifty_meter_run, spider: maxData.spider, eight_shape_run: maxData.eight_shape_run, ball_throw: maxData.ball_throw }
                    ]);
                } catch (error: unknown) {
                    console.error("Error fetching average/max data:", error);
                    // clear out if API fails
                    setAverageData(null);
                    setMaxData(null);
                    setAverageMaxData(null);
                }
            }
        };

        fetchAverageMaxData();
    }, [nationalDataGrade]);

    useEffect(() => {
        if (results && results.length > 0) {
            const labels = results.map(result => moment(result.date).format('YYYY年MM月DD日'));

            let data: number[] = [];
            let label = '';
            let color = '';

            switch (selectedTab) {
                case 'long_jump':
                    data = results.map(result => result.long_jump_cm);
                    label = '立ち幅跳び (cm)';
                    color = 'rgba(75, 192, 192, 1)';
                    break;
                case 'fifty_meter_run':
                    data = results.map(result => result.fifty_meter_run_ms / 100);
                    label = '50m走 (秒)';
                    color = 'rgba(255, 206, 86, 1)';
                    break;
                case 'spider':
                    data = results.map(result => result.spider_ms / 100);
                    label = 'スパイダー (秒)';
                    color = 'rgba(54, 162, 235, 1)';
                    break;
                case 'eight_shape_run':
                    data = results.map(result => result.eight_shape_run_count);
                    label = '8の字走 (回)';
                    color = 'rgba(255, 99, 132, 1)';
                    break;
                case 'ball_throw':
                    data = results.map(result => result.ball_throw_cm / 100);
                    label = 'ボール投げ (m)';
                    color = 'rgba(153, 102, 255, 1)';
                    break;
            }

            const newLineChartData: any = {
                labels: labels,
                datasets: [
                    {
                        label: label,
                        data: data,
                        borderColor: color,
                        backgroundColor: color.replace('1)', '0.2)'),
                        tension: 0.1,
                        fill: false,
                        pointBackgroundColor: color,
                    }
                ]
            };
            setChartData(newLineChartData);
        }
    }, [results, selectedTab]);

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


    const getDiffBadge = (current: number, previous: number | undefined, betterIsHigher: boolean, unit: string) => {
        if (previous === undefined) return null;

        const diff = current - previous;
        if (diff === 0) return <span className="badge bg-secondary ms-2 text-white" style={{ fontSize: '0.7em' }}>±0</span>;

        const isImproved = betterIsHigher ? diff > 0 : diff < 0;
        const sign = diff > 0 ? '+' : '';
        const colorClass = isImproved ? 'bg-success' : 'bg-danger';
        const arrow = isImproved ? '↑' : '↓';

        // Format the difference string nicely based on the unit
        let formattedDiff = `${sign}${diff.toFixed(2).replace(/\.00$/, '')}`;
        if (unit === '秒' || unit === 'm') {
            formattedDiff = `${sign}${(diff).toFixed(2)}`;
        }

        return (
            <span className={`badge ${colorClass} ms-2 text-white`} style={{ fontSize: '0.7em' }}>
                {formattedDiff}{unit} {arrow}
            </span>
        );
    };

    return (
        <Container>
            <h1 className="mb-4">{userName}さんの体力テスト結果</h1>

            {/* トレンド（推移）グラフセクション */}
            <div className="mb-5 bg-white p-4 rounded shadow-sm">
                <h3 className="mb-3">能力ごとの成長推移</h3>

                <div className="d-flex flex-wrap gap-2 mb-4">
                    <button
                        className={`btn ${selectedTab === 'long_jump' ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => setSelectedTab('long_jump')}
                    >立ち幅跳び</button>
                    <button
                        className={`btn ${selectedTab === 'fifty_meter_run' ? 'btn-warning text-dark' : 'btn-outline-warning'}`}
                        onClick={() => setSelectedTab('fifty_meter_run')}
                    >50m走</button>
                    <button
                        className={`btn ${selectedTab === 'spider' ? 'btn-info text-white' : 'btn-outline-info'}`}
                        onClick={() => setSelectedTab('spider')}
                    >スパイダー</button>
                    <button
                        className={`btn ${selectedTab === 'eight_shape_run' ? 'btn-danger' : 'btn-outline-danger'}`}
                        onClick={() => setSelectedTab('eight_shape_run')}
                    >8の字走</button>
                    <button
                        className={`btn ${selectedTab === 'ball_throw' ? 'btn-secondary' : 'btn-outline-secondary'}`}
                        onClick={() => setSelectedTab('ball_throw')}
                    >ボール投げ</button>
                </div>

                {chartData && results && results.length > 0 ? (
                    <div style={{ height: '300px', width: '100%', maxWidth: '800px', margin: '0 auto' }}>
                        <Line
                            data={chartData as any}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: { display: false },
                                    title: { display: false }
                                },
                            }}
                        />
                    </div>
                ) : (
                    <p>推移グラフを表示するためのデータがありません。</p>
                )}
            </div>

            {/* 総合レーダーチャートセクション */}
            <div className="mb-5 bg-white p-4 rounded shadow-sm text-center">
                <h3>総合評価（最新記録の全国平均比較）</h3>
                {radarChartData && (
                    <div style={{ height: '400px', width: '400px', margin: '0 auto' }}>
                        <Radar data={radarChartData} options={radarChartOptions} />
                    </div>
                )}
            </div>

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
                        {[...results].reverse().map((result, reverseIndex) => {
                            const originalIndex = results.length - 1 - reverseIndex;
                            const prevResult = originalIndex > 0 ? results[originalIndex - 1] : undefined;

                            return (
                                <tr key={result.id}>
                                    <td>{moment(result.date).format('YYYY年MM月DD日')}</td>
                                    <td>
                                        {result.long_jump_cm} cm
                                        {getDiffBadge(result.long_jump_cm, prevResult?.long_jump_cm, true, 'cm')}
                                    </td>
                                    <td>
                                        {result.fifty_meter_run_ms / 100} 秒
                                        {getDiffBadge(result.fifty_meter_run_ms / 100, prevResult ? prevResult.fifty_meter_run_ms / 100 : undefined, false, '秒')}
                                    </td>
                                    <td>
                                        {result.spider_ms / 100} 秒
                                        {getDiffBadge(result.spider_ms / 100, prevResult ? prevResult.spider_ms / 100 : undefined, false, '秒')}
                                    </td>
                                    <td>
                                        {result.eight_shape_run_count} 回
                                        {getDiffBadge(result.eight_shape_run_count, prevResult?.eight_shape_run_count, true, '回')}
                                    </td>
                                    <td>
                                        {result.ball_throw_cm / 100} m
                                        {getDiffBadge(result.ball_throw_cm / 100, prevResult ? prevResult.ball_throw_cm / 100 : undefined, true, 'm')}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </Table>
            ) : (
                <p>結果がありません</p>
            )}
            <div className="d-flex align-items-center justify-content-between my-4">
                <h2 className="mb-0">
                    2023年度全国大会平均/最大データ
                </h2>
                <div className="d-flex align-items-center">
                    <label className="me-2 text-muted text-nowrap">比較する学年:</label>
                    <select
                        className="form-select form-select-sm"
                        value={nationalDataGrade || ''}
                        onChange={(e) => setNationalDataGrade(e.target.value)}
                        style={{ width: 'auto' }}
                    >
                        <option value="1年女子">1年女子</option>
                        <option value="2年女子">2年女子</option>
                        <option value="3年女子">3年女子</option>
                        <option value="4年女子">4年女子</option>
                        <option value="5年女子">5年女子</option>
                        <option value="6年女子">6年女子</option>
                        <option value="1年男子">1年男子</option>
                        <option value="2年男子">2年男子</option>
                        <option value="3年男子">3年男子</option>
                        <option value="4年男子">4年男子</option>
                        <option value="5年男子">5年男子</option>
                        <option value="6年男子">6年男子</option>
                    </select>
                </div>
            </div>
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
                                <td>{data.fifty_meter_run_ms / 100} 秒</td>
                                <td>{data.spider_ms / 100} 秒</td>
                                <td>{data.eight_shape_run_count} 回</td>
                                <td>{data.ball_throw_cm / 100} m</td>
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