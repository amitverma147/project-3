interface MetricCardProps {
  title: string;
  value: number | string;
}

export default function MetricCard({ title, value }: MetricCardProps) {
  return (
    <div className="bg-white border text-center border-gray-200 rounded-lg p-6 hover:shadow-sm transition-shadow">
      <h3 className="text-sm font-medium text-gray-500 mb-2">{title}</h3>
      <div className="text-3xl font-semibold text-gray-900">{value}</div>
    </div>
  );
}
