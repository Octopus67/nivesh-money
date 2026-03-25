interface PrintInputSummaryProps {
  inputs: Record<string, string>;
}

export function PrintInputSummary({ inputs }: PrintInputSummaryProps) {
  return (
    <dl className="hidden print:grid print:grid-cols-2 print:gap-2 mb-4 text-sm">
      {Object.entries(inputs).map(([label, value]) => (
        <div key={label} className="flex gap-2">
          <dt className="font-medium text-gray-700">{label}:</dt>
          <dd className="text-gray-900">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
