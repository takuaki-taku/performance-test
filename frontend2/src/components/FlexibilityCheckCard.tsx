import Image from 'next/image';
import { FlexibilityCheck } from '@/types/flexibility';

interface FlexibilityCheckCardProps {
  check: FlexibilityCheck;
}

const FlexibilityCheckCard = ({ check }: FlexibilityCheckCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="relative h-48">
        <Image
          src={check.image}
          alt={check.title}
          fill
          className="object-cover"
        />
      </div>
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          {check.title}
        </h3>
        <p className="text-gray-600">
          {check.description}
        </p>
      </div>
    </div>
  );
};

export default FlexibilityCheckCard; 