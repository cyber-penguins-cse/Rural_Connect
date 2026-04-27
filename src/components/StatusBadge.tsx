import { ProductStatus, EnquiryStatus } from '../types';

type Status = ProductStatus | EnquiryStatus;

const config: Record<Status, { bg: string; text: string; dot: string }> = {
  PENDING:   { bg: 'bg-amber-50',  text: 'text-amber-700',  dot: 'bg-amber-500' },
  APPROVED:  { bg: 'bg-purple-50',  text: 'text-purple-700',  dot: 'bg-purple-500' },
  REJECTED:  { bg: 'bg-red-50',    text: 'text-red-700',    dot: 'bg-red-500' },
  ACCEPTED:  { bg: 'bg-blue-50',   text: 'text-blue-700',   dot: 'bg-blue-500' },
  COMPLETED: { bg: 'bg-emerald-50',text: 'text-emerald-700',dot: 'bg-emerald-500' },
};

export default function StatusBadge({ status }: { status: Status }) {
  const c = config[status] ?? config.PENDING;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {status}
    </span>
  );
}

