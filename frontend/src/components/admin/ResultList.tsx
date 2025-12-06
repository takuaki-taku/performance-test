'use client';

import { Table } from 'react-bootstrap';
import axios from 'axios';
import moment from 'moment';
import { Result } from '@/types/Result';
import { showToast } from '@/components/common/Toast';

interface ResultListProps {
    results: Result[] | null;
    userId: string; // UUID型に変更
    onResultDeleted: (resultId: number) => void;
}

const ResultList: React.FC<ResultListProps> = ({ results, onResultDeleted }) => {
    const handleDelete = async (resultId: number): Promise<void> => {
        if (window.confirm('本当にこの結果を削除しますか？')) {
            try {
                const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
                await axios.delete(`${apiBase}/user_results/${resultId}`);
                showToast('結果を削除しました', 'success');
                onResultDeleted(resultId);
            } catch (error: unknown) {
                console.error(error);
                showToast('結果の削除に失敗しました', 'error');
            }
        }
    };

    if (!results || results.length === 0) {
        return <p>結果がありません</p>;
    }

    return (
        <Table striped bordered hover>
            <thead>
                <tr>
                    <th>日付</th>
                    <th>立ち幅跳び</th>
                    <th>50m走</th>
                    <th>スパイダー</th>
                    <th>8の字走</th>
                    <th>ボール投げ</th>
                    <th>操作</th>
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
                        <td>
                            <button 
                                className="btn btn-danger"
                                onClick={() => handleDelete(result.id)}
                            >
                                削除
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </Table>
    );
};

export default ResultList;