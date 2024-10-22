import Composition from "../components/Composition";
import DefectRice from "../components/DefectRice";
import Details from "../components/Details";
import ImageSection from "../components/ImageSection";
import Navbar from "../components/Navbar";


const Result = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="flex gap-10 mt-6">
        <ImageSection />
        <div className="flex-1">
          <Details />
          <Composition />
          <DefectRice />
        </div>
      </div>
    </div>
  );
};

export default Result;
