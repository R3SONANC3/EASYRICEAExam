import { useNavigate } from "react-router-dom";
import { type ResultData } from "../types";

interface DetailsProps {
  result?: ResultData;
}

const ImageSection: React.FC<DetailsProps> = ({ result }) => {
  const navigate = useNavigate();

  if (!result) {
    return (
      <div className="w-1/3 mx-auto">
        Loading or no data available.
      </div>
    );
  }

  const handleGoBack = () => {
    navigate('/inspection');
  };

  const handleEdit = () => {
    navigate(`/inspection/edit/${result.id}`, { state: { result } });
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
          type="button"
          className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded transition-colors"
          onClick={handleGoBack}
        >
          Back
        </button>
        <button
          type="button"
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition-colors"
          onClick={handleEdit}
        >
          Edit
        </button>
      </div>
    </div>
  );
};

export default ImageSection;