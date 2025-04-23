import { FlexibilityCheck } from '@/types/flexibility';

export const flexibilityChecks: FlexibilityCheck[] = [
  {
    id: 1,
    title: '前屈テスト',
    image: '/images/flexibility/forward-bend.jpg',
    description: '立った状態から前屈を行い、手が床に届く距離を測定します。股関節とハムストリングスの柔軟性を評価します。'
  },
  {
    id: 2,
    title: '開脚テスト',
    image: '/images/flexibility/split.jpg',
    description: '床に座り、両脚を最大限に開脚します。股関節の可動域と内転筋の柔軟性を評価します。'
  },
  {
    id: 3,
    title: '肩関節可動域テスト',
    image: '/images/flexibility/shoulder.jpg',
    description: '両手を後ろで組み、肩関節の可動域を測定します。肩甲骨の柔軟性と肩関節の可動域を評価します。'
  },
  {
    id: 4,
    title: '体幹回旋テスト',
    image: '/images/flexibility/trunk-rotation.jpg',
    description: '座った状態で体幹を回旋し、可動域を測定します。体幹の柔軟性と回旋可動域を評価します。'
  }
]; 