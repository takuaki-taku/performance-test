import Container from '@/components/Container';
import FlexibilityCheckCard from '@/components/FlexibilityCheckCard';
import { flexibilityChecks } from '@/data/flexibilityChecks';

export default function FlexibilityPage() {
  return (
    <Container>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          柔軟性チェック項目
        </h1>
        <p className="text-lg text-gray-600 mb-12">
          以下のチェック項目は、身体の柔軟性を評価するための基本的なテストです。
          各テストは特定の部位の柔軟性を測定し、改善のための指標となります。
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {flexibilityChecks.map((check) => (
            <FlexibilityCheckCard key={check.id} check={check} />
          ))}
        </div>
      </div>
    </Container>
  );
} 