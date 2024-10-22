import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import axios from 'axios';
import { Standard, InspectionForm } from '../services/types'


const CreateInspection = () => {
    const [standards, setStandards] = useState<Standard[]>([]);
    const [formData, setFormData] = useState<InspectionForm>({
        name: '',
        standard: '',
        note: '',
        price: undefined,
        samplingPoints: [],
        samplingDateTime: '',
    });
    const [errors, setErrors] = useState<Partial<Record<keyof InspectionForm, string>>>({});

    useEffect(() => {
        fetchStandards();
    }, []);

    const fetchStandards = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/standard');

            const standardData = response.data.map((standard: {
                [x: string]: any; id: string; standard_name: string;
            }) => ({
                id: standard.id,
                name: standard.name,
            }));
            setStandards(standardData);
        } catch (error) {
            console.error('Error fetching standards:', error);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        if (name === 'price') {
            const numValue = parseFloat(value);
            if (!value || (numValue >= 0 && numValue <= 100000)) {
                setFormData(prev => ({ ...prev, [name]: value ? numValue : undefined }));
                setErrors(prev => ({ ...prev, [name]: undefined }));
            }
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const handleCheckboxChange = (value: string) => {
        setFormData(prev => ({
            ...prev,
            samplingPoints: prev.samplingPoints.includes(value)
                ? prev.samplingPoints.filter(point => point !== value)
                : [...prev.samplingPoints, value]
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type === 'application/json') {
            setFormData(prev => ({ ...prev, uploadFile: file }));
            setErrors(prev => ({ ...prev, uploadFile: undefined }));
        } else {
            setErrors(prev => ({ ...prev, uploadFile: 'Please upload a JSON file' }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Partial<Record<keyof InspectionForm, string>> = {};

        if (!formData.name) newErrors.name = 'Name is required';
        if (!formData.standard) newErrors.standard = 'Standard is required';

        if (formData.price !== undefined) {
            if (formData.price < 0 || formData.price > 100000) {
                newErrors.price = 'Price must be between 0 and 100,000';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            const formDataToSend = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                if (value !== undefined) {
                    if (key === 'samplingPoints') {
                        formDataToSend.append(key, JSON.stringify(value));
                    } else if (key === 'uploadFile') { // Ensure this matches the backend field
                        formDataToSend.append('uploadFile', value); // Adjust this line
                    } else {
                        formDataToSend.append(key, value.toString());
                    }
                }
            });
            console.log(formData);
            const response = await fetch('http://localhost:5000/api/standard/', {
                method: 'POST',
                body: formDataToSend,
            });

            if (response.ok) {
                setFormData({
                    name: '',
                    standard: '',
                    note: '',
                    price: undefined,
                    samplingPoints: [],
                    samplingDateTime: '',
                });
            } else {
                console.error('Submission failed');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
        }
    };


    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className="px-8 py-6 bg-gradient-to-r from-green-600 to-green-700">
                        <h2 className="text-2xl font-semibold text-white">Create Inspection</h2>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        {/* Name Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Name<span className="text-red-500 ml-1">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                placeholder="Please enter name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-150"
                                required
                            />
                            {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                        </div>

                        {/* Standard Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Standard<span className="text-red-500 ml-1">*</span>
                            </label>
                            <select
                                name="standard"
                                value={formData.standard}
                                onChange={handleInputChange}
                                className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-150"
                                required
                            >
                                <option value="">Please Select Standard</option>
                                {standards.map(standard => (
                                    <option key={standard.id} value={standard.id}>{standard.name}</option>
                                ))}
                            </select>

                            {errors.standard && <p className="mt-1 text-sm text-red-500">{errors.standard}</p>}
                        </div>

                        {/* Upload File Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Upload File</label>
                            <div className="mt-1 flex items-center">
                                <input
                                    name='uploadfile'
                                    type="file"
                                    accept=".json"
                                    onChange={handleFileChange}
                                    className="block w-full px-4 py-2 text-sm text-gray-700 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-medium file:bg-green-50 file:text-green-700 hover:file:bg-green-100 transition duration-150"
                                />
                            </div>
                            {errors.uploadFile && <p className="mt-1 text-sm text-red-500">{errors.uploadFile}</p>}
                        </div>

                        {/* Note Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Note</label>
                            <textarea
                                name="note"
                                placeholder="Enter any additional notes"
                                value={formData.note}
                                onChange={handleInputChange}
                                rows={3}
                                className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-150"
                            />
                        </div>

                        {/* Price Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Price</label>
                            <input
                                type="number"
                                name="price"
                                placeholder="Enter price"
                                value={formData.price || ''}
                                onChange={handleInputChange}
                                step="0.01"
                                min="0"
                                max="100000"
                                className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-150"
                            />
                            {errors.price && <p className="mt-1 text-sm text-red-500">{errors.price}</p>}
                        </div>

                        {/* Sampling Point Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Sampling Point</label>
                            <div className="space-y-2">
                                {['Front End', 'Back End', 'Other'].map((point) => (
                                    <label key={point} className="inline-flex items-center mr-6 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.samplingPoints.includes(point)}
                                            onChange={() => handleCheckboxChange(point)}
                                            className="form-checkbox h-5 w-5 text-green-600 rounded border-gray-300 focus:ring-green-500 transition duration-150"
                                        />
                                        <span className="ml-2 text-gray-700">{point}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Date/Time of Sampling Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Date/Time of Sampling</label>
                            <div className="mt-1 relative">
                                <input
                                    type="datetime-local"
                                    name="samplingDateTime"
                                    value={formData.samplingDateTime}
                                    onChange={handleInputChange}
                                    className="block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-150"
                                    step="1"
                                />
                                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                            </div>
                        </div>

                        {/* Form Buttons */}
                        <div className="flex justify-end space-x-4 pt-6">
                            <button
                                type="button"
                                onClick={() => window.history.back()}
                                className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-150"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-150"
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

export default CreateInspection; 