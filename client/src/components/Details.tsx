import React from 'react';
import { ResultData } from '../types';

interface DetailsProps {
  result?: ResultData;
}

const Details: React.FC<DetailsProps> = ({ result }) => {
  
  if (!result) {
    return <div>Loading or no data available.</div>;
  }

  const samplingPointsArray = result.samplingPoints ? result.samplingPoints.split(", ") : [];

  const formatDate = (dateString: string) => {
    const months = [
      "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
      "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
    ];

    const date = new Date(dateString);
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear() + 543;
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${day} ${month} ${year} ${hours}:${minutes}:${seconds}`;
  };

  return (
    <div className="space-y-4 px-5">
      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="grid grid-cols-2 gap-y-4">
          
          <div className="space-y-1">
            <div className="text-gray-600 text-lg">Create Date - Time</div>
            <div className='font-bold'>{formatDate(result.createdAt)}</div>
          </div>

          <div className="space-y-1">
            <div className="text-gray-600 text-lg">Inspection ID</div>
            <div className='font-bold'>{result.id}</div>
          </div>

          <div className="space-y-1">
            <div className="text-gray-600 text-lg">Standard</div>
            <div className='font-bold'>{result.standardName}</div>
          </div>

          <div className="space-y-1">
            <div className="text-gray-600 text-lg">Total Sample</div>
            <div className='font-bold'>{result.totalSamples} kernel</div>
          </div>

          <div className="space-y-1">
            <div className="text-gray-600 text-lg">Update Date - Time</div>
            <div className='font-bold'>{formatDate(result.updatedAt)}</div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="grid grid-cols-2 gap-y-4">
          <div className="space-y-1">
            <div className="text-gray-600 text-lg">Note</div>
            <div className='font-bold'>{result.note}</div>
          </div>

          <div className="space-y-1">
            <div className="text-gray-600 text-lg">Price</div>
            <div className='font-bold'>
              {parseFloat(result.price).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })} บาท
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-gray-600 text-lg">Date/Time of Sampling</div>
            <div className='font-bold'>{formatDate(result.samplingDate)}</div>
          </div>

          <div className="space-y-1">
            <div className="text-gray-600 text-lg">Sampling Point</div>
            <div className='font-bold'>{samplingPointsArray.join(", ")}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Details;
