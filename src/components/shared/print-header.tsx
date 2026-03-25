export function PrintHeader() {
  return (
    <div className="hidden print:block mb-6 pb-4 border-b border-gray-300">
      <h2 className="text-lg font-bold">
        <span className="text-[#1e3a5f]">Nivesh</span>
        <span className="text-[#047857]">.money</span>
        {' '}| Smart Mutual Fund Advisory
      </h2>
      <p className="text-sm text-gray-600">AMFI Registered | ARN: XXXXX</p>
      <p className="text-sm text-gray-600">Generated on {new Date().toLocaleDateString('en-IN')}</p>
    </div>
  );
}
