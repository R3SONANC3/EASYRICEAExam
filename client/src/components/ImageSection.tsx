import { useNavigate } from "react-router-dom";
import { ResultData } from "../types";

interface DetailsProps {
  result?: ResultData;
}

const ImageSection:React.FC<DetailsProps> = ({result}) => {
  
  if (!result) {
    return <div>Loading or no data available.</div>;
  }

  const navigate = useNavigate();
  
  const goBackPage = () => {
    navigate('/inspection');
  };

  return (
    <div className="w-1/3 mx-auto">
      <img
        src={result.imagePath}
        alt="Rice Inspection"
        className="h-auto max-h-[500px] w-full object-contain mx-auto rounded"
      />
      <div className="mt-4 flex justify-center gap-4">
        <button 
          className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded transition-colors"
          onClick={goBackPage}
        >
          Back
        </button>
        <button 
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition-colors"
        >
          Edit
        </button>
      </div>
    </div>
  );
}

export default ImageSection;