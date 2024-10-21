import React, { useEffect, useState } from 'react';
import { Search, Plus, Trash2 } from 'lucide-react';

const Home = () => {
  const [inspections, setInspections] = useState([
    { id: 'MI-000-0000', name: 'Name1', standard: 'Standard1', createdAt: '28/08/2023 18:00:00', note: '' },
    // ... add more dummy data as needed
  ]);
  const [searchID, setSearchID] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-2xl font-bold mb-6">EASYRICE TEST</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex space-x-4 flex-grow">
            <div className="flex-grow">
              <label className="block text-sm font-medium text-gray-700 mb-1">ID</label>
              <input
                type="text"
                placeholder="Search with ID"
                className="w-full p-2 border rounded-md"
                value={searchID}
                onChange={(e) => setSearchID(e.target.value)}
              />
            </div>
            <div className="flex-grow">
              <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
              <input
                type="date"
                className="w-full p-2 border rounded-md"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>
            <div className="flex-grow">
              <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
              <input
                type="date"
                className="w-full p-2 border rounded-md"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-end space-x-4">
            <button className="bg-green-600 text-white px-4 py-2 rounded-md">
              <Search size={20} className="inline mr-2" />
              Search
            </button>
            <button className="bg-green-600 text-white px-4 py-2 rounded-md flex items-center">
              <Plus size={20} className="mr-2" />
              Create Inspection
            </button>
          </div>
        </div>
        
        <button className="text-red-600 mb-4">
          Clear Filter
        </button>

        <div className="overflow-x-auto">
          <div className="flex items-center mb-4">
            <button className="flex items-center text-red-600 mr-4">
              <Trash2 size={20} className="mr-2" />
              Delete
            </button>
            <span>Select items: 1 item</span>
          </div>
          <table className="min-w-full">
            <thead className="bg-green-600 text-white">
              <tr>
                <th className="p-3 text-left">Create Date - Time</th>
                <th className="p-3 text-left">Inspection ID</th>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Standard</th>
                <th className="p-3 text-left">Note</th>
              </tr>
            </thead>
            <tbody>
              {inspections.map((inspection, index) => (
                <tr key={inspection.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="p-3">
                    <input type="checkbox" className="mr-2" />
                    {inspection.createdAt}
                  </td>
                  <td className="p-3">{inspection.id}</td>
                  <td className="p-3">{inspection.name}</td>
                  <td className="p-3">{inspection.standard}</td>
                  <td className="p-3">{inspection.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 flex justify-between items-center">
            <span>1-10 of 100</span>
            <div>
              <button className="px-2 py-1 border rounded-md mr-2">&lt;</button>
              <button className="px-2 py-1 border rounded-md">&gt;</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;