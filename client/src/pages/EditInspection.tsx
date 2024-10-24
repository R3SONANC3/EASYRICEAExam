import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { FormErrors } from '../types';

interface Inspection {
  id: string | undefined;
  name: string;
  standardId: string;
  samplingPoints: ('front_end' | 'back_end' | 'other')[];
  note?: string;
  price?: number;
  samplingDatetime: string;
}

const SimpleAlert: React.FC<{ message: string }> = ({ message }) => (
  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
    <span className="block sm:inline">{message}</span>
  </div>
);

const EditInspection: React.FC = () => {
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

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (result) {
      try {
        const samplingPointsArray = result.samplingPoints
          ? result.samplingPoints.split(', ').map((point: string) =>
            point.toLowerCase().replace(' ', '_')
          ) as ('front_end' | 'back_end' | 'other')[]
          : [];

        setFormData({
          id: result.id,
          name: result.name || '',
          standardId: result.standardName || '',
          samplingPoints: samplingPointsArray,
          note: result.note || '',
          price: Number(result.price) || 0,

          samplingDatetime: utcToLocal(result.samplingDate),
        });
      } catch (error) {
        console.error('Error parsing result data:', error);
        setSubmitError('Error loading inspection data');
      }
    }
  }, [result]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.standardId.trim()) {
      newErrors.standardId = 'Standard ID is required';
    }

    if (formData.price !== undefined && formData.price < 0) {
      newErrors.price = 'Price cannot be negative';
    }

    if (!formData.samplingDatetime) {
      newErrors.samplingDatetime = 'Sampling date/time is required';
    }

    if (formData.samplingPoints.length === 0) {
      newErrors.samplingPoints = 'At least one sampling point must be selected';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        name: formData.name,
        standardId: formData.standardId,
        samplingPoints: formData.samplingPoints
          .map(point => point.replace('_', ' '))
          .join(', '),
        note: formData.note || null,
        price: formData.price || null,
        samplingDateTime: localToUTC(formData.samplingDatetime)
      };

      console.log('Sending payload to backend:', payload);
      console.log('Request URL:', `http://localhost:5000/api/result/${inspectionId}`);

      const response = await axios.put(
        `http://localhost:5000/api/result/${inspectionId}`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    
      console.log('Backend response:', response);

      if (response.status === 200) {
        navigate(`/result/${inspectionId}`, {
          state: { inspectionID: inspectionId }
        });
      }
    } catch (error: any) {
      console.error('Error updating inspection:', error);
      const errorMessage = error.response?.data?.error || 
                          error.message || 
                          'An error occurred while updating the inspection';
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(`/result/${inspectionId}`, { state: { inspectionID: inspectionId } });
  };

  const handleSamplingPointChange = (point: 'front_end' | 'back_end' | 'other') => {
    setFormData(prev => {
      const currentPoints = [...prev.samplingPoints];
      const index = currentPoints.indexOf(point);

      if (index === -1) {
        currentPoints.push(point);
      } else {
        currentPoints.splice(index, 1);
      }

      // Clear the error when user selects a point
      if (currentPoints.length > 0) {
        setErrors(prev => ({ ...prev, samplingPoints: undefined }));
      }

      return {
        ...prev,
        samplingPoints: currentPoints
      };
    });
  };

  const utcToLocal = (utcDateString: string): string => {
    if (!utcDateString) return '';
    try {
      const date = new Date(utcDateString);
      // Format: YYYY-MM-DDThh:mm
      return new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
        .toISOString()
        .slice(0, 16);
    } catch (error) {
      console.error('Error converting UTC to local time:', error);
      return '';
    }
  };

  const localToUTC = (localDateString: string): string => {
    if (!localDateString) return '';
    try {
      const date = new Date(localDateString);
      return date.toISOString();
    } catch (error) {
      console.error('Error converting local to UTC time:', error);
      return '';
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="border-b border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-center text-gray-900">
            Edit Inspection ID : {inspectionId}
          </h2>
        </div>

        {submitError && <SimpleAlert message={submitError} />}

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (e.target.value.trim()) {
                    setErrors(prev => ({ ...prev, name: undefined }));
                  }
                }}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                required
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            {/* Standard ID Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Standard ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.standardId}
                onChange={(e) => {
                  setFormData({ ...formData, standardId: e.target.value });
                  if (e.target.value.trim()) {
                    setErrors(prev => ({ ...prev, standardId: undefined }));
                  }
                }}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${errors.standardId ? 'border-red-500' : 'border-gray-300'
                  }`}
                required
              />
              {errors.standardId && (
                <p className="text-red-500 text-sm mt-1">{errors.standardId}</p>
              )}
            </div>

            {/* Note Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Note
              </label>
              <textarea
                value={formData.note || ''}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                rows={3}
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
                onChange={(e) => {
                  setFormData({ ...formData, price: Number(e.target.value) });
                  if (Number(e.target.value) >= 0) {
                    setErrors(prev => ({ ...prev, price: undefined }));
                  }
                }}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${errors.price ? 'border-red-500' : 'border-gray-300'
                  }`}
                min="0"
                step="0.01"
              />
              {errors.price && (
                <p className="text-red-500 text-sm mt-1">{errors.price}</p>
              )}
            </div>

            {/* Sampling Points */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Sampling Point <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-6">
                {(['front_end', 'back_end', 'other'] as const).map((point) => (
                  <label key={point} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.samplingPoints.includes(point)}
                      onChange={() => handleSamplingPointChange(point)}
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-700">
                      {point.split('_').map(word =>
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ')}
                    </span>
                  </label>
                ))}
              </div>
              {errors.samplingPoints && (
                <p className="text-red-500 text-sm mt-1">{errors.samplingPoints}</p>
              )}
            </div>

            {/* Sampling DateTime Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Date/Time of Sampling <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={formData.samplingDatetime}
                onChange={(e) => {
                  setFormData({ ...formData, samplingDatetime: e.target.value });
                  if (e.target.value) {
                    setErrors(prev => ({ ...prev, samplingDatetime: undefined }));
                  }
                }}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${errors.samplingDatetime ? 'border-red-500' : 'border-gray-300'
                  }`}
                required
              />
              {errors.samplingDatetime && (
                <p className="text-red-500 text-sm mt-1">{errors.samplingDatetime}</p>
              )}
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
                onClick={handleSubmit}
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditInspection;