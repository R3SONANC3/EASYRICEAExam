import { useEffect, useState } from 'react';
import { Search, Plus, Trash2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import axios from 'axios';

interface Inspection {
  id: number;
  name: string;
  standardName: string;
  note: string;
  createdAt: string;
}

const Home = () => {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchID, setSearchID] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const limit = 10;

  useEffect(() => {
    fetchInspections();
  }, [page]);

  useEffect(() => {
    
  })

  const handleSearch = async () => {
    if (!searchID) return;
    try {
      const response = await axios.get(
        `http://localhost:5000/api/history/${searchID}`
      );
      setInspections([response.data.data]);
    } catch (err) {
      setError('Inspection not found');
    } finally {
      setLoading(false);
    }
  };

  const fetchInspections = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/history`, {
        params: { page, limit },
      });
      setInspections(response.data.data);
      setTotal(response.data.total);
    } catch (err) {
      setError('Failed to fetch inspections');
    } finally {
      setLoading(false);
    }
  };

  const clearFilter = async () => {
    setSearchID('');
    setPage(1);
    setError(null);
    setLoading(true);
    fetchInspections();
  };

  const totalPages = Math.ceil(total / limit);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto mt-8 p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">History</h2>
          <button className="bg-green-600 text-white px-4 py-2 rounded-md flex items-center">
            <Plus className="mr-2" size={20} />
            Create Inspection
          </button>
        </div>

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

            </div>          <div className="flex items-end space-x-4">
              <button className="bg-green-600 text-white px-4 py-2 rounded-md">
                <Search size={20}
                  className="inline mr-2"
                  onClick={handleSearch}
                />
                Search
              </button>
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
        </div>

        <button
          className="text-red-600 mt-2"
          onClick={clearFilter}
        >
          Clear Filter
        </button>

        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <div className="flex items-center p-4 border-b">
            <button className="flex items-center text-red-600 mr-4">
              <Trash2 size={20} className="mr-2" />
              Delete
            </button>
            <span>Select items: {inspections.length} item(s)</span>
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
                <tr
                  key={inspection.id}
                  className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                >
                  <td className="p-3">
                    <input type="checkbox" className="mr-2" />
                    {new Date(inspection.createdAt).toLocaleString()}
                  </td>
                  <td className="p-3">{inspection.id}</td>
                  <td className="p-3">{inspection.name}</td>
                  <td className="p-3">{inspection.standardName}</td>
                  <td className="p-3">{inspection.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-4 border-t flex justify-between items-center">
            <span>
              Page {page} of {totalPages} ({inspections.length} items shown)
            </span>
            <div>
              <button
                className="px-2 py-1 border rounded-md mr-2"
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1}
              >
                &lt; Prev
              </button>
              <button
                className="px-2 py-1 border rounded-md"
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={page === totalPages}
              >
                Next &gt;
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
