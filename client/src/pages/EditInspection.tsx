import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Inspection } from '../types';

const EditInspection = () => {
  const { inspectionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { result } = location.state || {};
  
  const [formData, setFormData] = useState<Inspection>({
    id: inspectionId,
    name: '',
    standardId: '',
    samplingPoints: [],
    note: '',
    price: 0,
    samplingDatetime: '',
  });

  useEffect(() => {    
    console.log(formData);
    
    if (result) {
      setFormData({
        id: result.id,
        name: result.name,
        standardId: result.standardName || '',
        samplingPoints: result.samplingPoints.split(', ') || [],
        note: result.note || '',
        price: Number(result.price) || 0,
        samplingDatetime: result.samplingDate || '',
      });
    }
  }, [result, inspectionId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log('Submitting data:', formData);
      navigate('/');
    } catch (error) {
      console.error('Error updating inspection:', error);
    }
  };

  const handleCancel = () => {
    navigate(`/result/${inspectionId}`, { state: { inspectionID: inspectionId } });
  };

  const handleSamplingPointChange = (point: 'front_end' | 'back_end' | 'other') => {
    setFormData(prev => {
      const currentPoints = prev.samplingPoints || [];
      if (currentPoints.includes(point)) {
        return {
          ...prev,
          samplingPoints: currentPoints.filter(p => p !== point)
        };
      } else {
        return {
          ...prev,
          samplingPoints: [...currentPoints, point]
        };
      }
    });
  };

  

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="border-b border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-center text-gray-900">
            Edit Inspection ID : {inspectionId}
          </h2>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              />
            </div>

            {/* Standard ID Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Standard ID
              </label>
              <input
                type="text"
                value={formData.standardId}
                onChange={(e) => setFormData({ ...formData, standardId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              />
            </div>

            {/* Note Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Note
              </label>
              <input
                type="text"
                value={formData.note || ''}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            {/* Price Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Price
              </label>
              <input
                type="number"
                value={formData.price || ''}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            {/* Sampling Points */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Sampling Point
              </label>
              <div className="flex gap-6">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.samplingPoints?.includes('front_end')}
                    onChange={() => handleSamplingPointChange('front_end')}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">Front End</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.samplingPoints?.includes('back_end')}
                    onChange={() => handleSamplingPointChange('back_end')}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">Back End</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.samplingPoints?.includes('other')}
                    onChange={() => handleSamplingPointChange('other')}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">Other</span>
                </label>
              </div>
            </div>

            {/* Sampling DateTime Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Date/Time of Sampling
              </label>
              <input
                type="datetime-local"
                value={formData.samplingDatetime || ''}
                onChange={(e) => setFormData({ ...formData, samplingDatetime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditInspection;