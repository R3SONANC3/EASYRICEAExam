import { useEffect, useState } from "react";
import axios from "axios";
import Details from "../components/Details";
import ImageSection from "../components/ImageSection";
import Navbar from "../components/Navbar";
import { ResultData } from "../types";
import { useLocation } from "react-router-dom";

const Result: React.FC = () => {
  const [data, setData] = useState<ResultData[]>([]); 
  const location = useLocation();
  const { inspectionID } = location.state || {};

  useEffect(() => {
    if (inspectionID) {
      axios
        .get<ResultData[]>(`http://localhost:5000/api/result/${inspectionID}`)
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

  const selectedResult = data[0];

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="flex gap-10 mt-6">
        <ImageSection result={selectedResult} />
        <div className="flex-1">
          <Details result={selectedResult} />
        </div>
      </div>
    </div>
  );
};

export default Result;