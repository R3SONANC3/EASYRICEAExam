import React, { useEffect, useState, useCallback } from 'react';
import { Search, Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { FetchParams, Inspection } from '../types';
import axios from 'axios';


const History = () => {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchID, setSearchID] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  const limit = 10;
  const navigate = useNavigate();

  const fetchInspections = useCallback(async (params: FetchParams) => {
    setIsLoading(true);
    setError('');
    try {
      const queryParams = new URLSearchParams({
        page: params.page.toString(),
        limit: params.limit.toString(),
      });

      const response = await axios.get(`http://localhost:5000/api/history`, {
        params: queryParams,
      });

      // Check if the response was successful
      if (response.status !== 200) {
        throw new Error('Failed to fetch inspections');
      }

      const data = response.data; // Axios automatically parses the response JSON
      setInspections(data.data);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInspections({ page, limit });
  }, [page,fetchInspections]);

  const handleSearch = async () => {
    if (!searchID.trim()) return;
  
    setIsLoading(true);
    setError('');
    try {
      const response = await axios.get(`http://localhost:5000/api/history/${searchID}`);
  
      if (response.status !== 200) {
        throw new Error('Inspection not found');
      }
  
      const data = response.data;
      setInspections([data.data]);
      setTotal(1);
      setPage(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedItems.length) return;
  
    setIsLoading(true);
    setError('');
    try {
      const ids = selectedItems.join(',');
      
      const response = await axios.delete(`http://localhost:5000/api/history/${ids}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.status !== 200) {
        throw new Error('Failed to delete inspections');
      }
  
      await fetchInspections({ page, limit });
      setSelectedItems([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete inspections');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRowClick = (inspection: Inspection) => {
    navigate(`/result/${inspection.id}`, {
      state: {
        inspectionID: inspection.id,
      }
    });
  };

  const clearFilter = () => {
    setSearchID('');

    setPage(1);
    fetchInspections({ page: 1, limit });
  };

  const handleCheckboxChange = (id: number, event: React.ChangeEvent<HTMLInputElement> | React.MouseEvent) => {
    event.stopPropagation();
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto mt-8 px-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Inspection History</h2>
          <button
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center transition-colors"
            onClick={() => navigate('/inspection')}
          >
            <Plus className="mr-2" size={20} />
            Create Inspection
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-600 p-4 mb-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Inspection ID
              </label>
              <div className="flex">
                <input
                  type="text"
                  placeholder="Search by ID"
                  className="w-full p-2 border rounded-l-md focus:ring-2 focus:ring-green-500 outline-none"
                  value={searchID}
                  onChange={(e) => setSearchID(e.target.value)}
                />
                <button
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-r-md transition-colors"
                  onClick={handleSearch}
                  disabled={isLoading}
                >
                  <Search size={20} />
                </button>
              </div>
            </div>

            <div className="flex items-end">
              <button
                className="text-gray-600 hover:text-gray-800 px-4 py-2 rounded-md border hover:bg-gray-50 transition-colors"
                onClick={clearFilter}
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="flex items-center p-4 border-b">
            <button
              className={`flex items-center mr-4 ${selectedItems.length ? 'text-red-600 hover:text-red-700' : 'text-gray-400'}`}
              onClick={handleDelete}
              disabled={isLoading || !selectedItems.length}
            >
              <Trash2 size={20} className="mr-2" />
              Delete Selected
            </button>
            <span className="text-gray-600">
              {selectedItems.length} item(s) selected
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-green-600 text-white">
                <tr>
                  <th className="w-8 p-3">&nbsp;</th>
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
                    onClick={() => handleRowClick(inspection)}
                    className={`
                        cursor-pointer
                        ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                        hover:bg-gray-100 transition-colors
                      `}
                  >
                    <td className="p-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        className="rounded border-gray-300"
                        checked={selectedItems.includes(inspection.id)}
                        onChange={(e) => handleCheckboxChange(inspection.id, e)}
                      />
                    </td>
                    <td className="p-3">
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
          </div>

          <div className="p-4 border-t flex justify-between items-center">
            <span className="text-gray-600">
              Page {page} of {totalPages} ({total} total items)
            </span>
            <div className="flex gap-2">
              <button
                className={`
                  px-4 py-2 border rounded-md transition-colors
                  ${page === 1 || isLoading ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'hover:bg-gray-50'}
                `}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1 || isLoading}
              >
                Previous
              </button>
              <button
                className={`
                  px-4 py-2 border rounded-md transition-colors
                  ${page === totalPages || isLoading ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'hover:bg-gray-50'}
                `}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || isLoading}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default History;