import { useNavigate } from "react-router-dom";

function ImageSection() {
  const navigate = useNavigate();

  const goBackPage = () => {
    navigate('/inspection')
  }

  return (
    <div className="w-1/3 mx-auto">
    {/* Image with max size control */}
    <img
      src="https://easyrice-es-trade-data.s3.ap-southeast-1.amazonaws.com/example-rice.webp"
      alt="Rice"
      className="h-auto max-h-[500px] object-contain mx-auto rounded"
    />

    {/* Buttons centered underneath the image */}
    <div className="mt-4 flex justify-center gap-4">
      <button className="bg-green-500 text-white py-2 px-4 rounded" onClick={goBackPage}>Back</button>
      <button className="bg-blue-500 text-white py-2 px-4 rounded">Edit</button>
    </div>
  </div>
  )
}


export default ImageSection;
