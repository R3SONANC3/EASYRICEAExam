import React from 'react';

interface DefectData {
    name: string;  
    actual: number;  
}

interface DefectRiceProps {
    defects: DefectData[];
}

const DefectRice: React.FC<DefectRiceProps> = ({ defects }) => {

    return (
        <div className="space-y-4 px-5">
            <div className="bg-white shadow-sm rounded-lg p-6">
                <h3 className="text-lg font-bold mb-4">Defect Rice</h3>
                <table className="w-full text-left">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="border-b-2 pb-2">Name</th>
                            <th className="border-b-2 pb-2">Actual</th>
                        </tr>
                    </thead>
                    <tbody>
                        {defects.map((defect, index) => (
                            <tr key={index}>
                                <td>{defect.name}</td>
                                <td>{defect.actual.toFixed(2)} %</td> 
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default DefectRice;
