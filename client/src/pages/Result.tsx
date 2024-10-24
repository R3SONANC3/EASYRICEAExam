import { useEffect, useState } from "react";
import axios from "axios";
import Details from "../components/Details";
import ImageSection from "../components/ImageSection";
import Navbar from "../components/Navbar";
import { InspectionResponse } from "../types";
import { useLocation, useParams } from "react-router-dom";
import DefectRice from "../components/DefectRice";
import Composition from "../components/Composition";

const Result: React.FC = () => {
  const [data, setData] = useState<InspectionResponse | null>(null);
  const location = useLocation();
  const { inspectionID } = location.state || useParams();

  useEffect(() => {
    if (inspectionID) {
      axios
        .get<InspectionResponse>(`http://localhost:5000/api/result/${inspectionID}`)
        .then((response) => {
          setData(response.data);
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
        });
    }
  }, [inspectionID]);

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="flex justify-center items-center h-screen">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  const selectedResult = data.inspection;
  const defectData = data.results.defects.map(defect => ({
    name: defect.type,
    actual: defect.percentage,
  }));
  const composition = data.results;

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="flex gap-10 mt-6">
        <ImageSection result={selectedResult} />
        <div className="flex-1">
          <Details result={selectedResult} />
          <Composition composition={composition} />
          <DefectRice defects={defectData} />
        </div>
      </div>
    </div>
  );
};

export default Result;

