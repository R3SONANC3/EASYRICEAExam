import { CompositionProps } from "../types";

const Composition: React.FC<CompositionProps> = ({ composition }) => {


  const getPercentage = (type: string) => {
    if (type === "ข้าวเต็มเมล็ด") {
      return composition?.classifications?.find(c => c.name === "ข้าวเต็มเมล็ด")?.percentage || 0;
    }
    if (type === "ข้าวหักใหญ่") {
      return composition?.classifications?.find(c => c.name === "ข้าวหักใหญ่")?.percentage || 0;
    }
    if (type === "ข้าวหักธรรมดา") {
      return composition?.unclassified?.percentage || 0;
    }
    return 0;
  };

  const formatPercentage = (value: number) => {
    return value.toFixed(2) + " %";
  };

  return (
    <div className="space-y-4 px-5 py-5">
      <div className="bg-white shadow-sm rounded-lg p-6">
      <h3 className="text-lg font-bold mb-4">Composition Rice</h3>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left py-2 px-4">Name</th>
              <th className="text-left py-2 px-4">Length</th>
              <th className="text-right py-2 px-4">Actual</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t">
              <td className="py-2 px-4">ข้าวเต็มเมล็ด</td>
              <td className="py-2 px-4">&gt;= 7</td>
              <td className="py-2 px-4 text-right text-green-600">
                {formatPercentage(getPercentage("ข้าวเต็มเมล็ด"))}
              </td>
            </tr>
            <tr className="border-t">
              <td className="py-2 px-4">ข้าวหักใหญ่</td>
              <td className="py-2 px-4">3.5 - 6.99</td>
              <td className="py-2 px-4 text-right text-green-600">
                {formatPercentage(getPercentage("ข้าวหักใหญ่"))}
              </td>
            </tr>
            <tr className="border-t">
              <td className="py-2 px-4">ข้าวหักธรรมดา</td>
              <td className="py-2 px-4">0 - 3.49</td>
              <td className="py-2 px-4 text-right text-green-600">
                {formatPercentage(getPercentage("ข้าวหักธรรมดา"))}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Composition;