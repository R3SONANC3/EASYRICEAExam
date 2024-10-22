const DefectRice = () => (
    <div className="bg-white shadow-md p-6 rounded mx-4">
      <h3 className="text-lg font-bold mb-4">Defect Rice</h3>
      <table className="w-full text-left">
        <thead>
          <tr>
            <th className="border-b-2 pb-2">Name</th>
            <th className="border-b-2 pb-2">Actual</th>
          </tr>
        </thead>
        <tbody>
          {["yellow", "paddy", "damaged", "glutinous", "chalky", "red"].map((defect) => (
            <tr key={defect}>
              <td>{defect}</td>
              <td>0.00 %</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
  
  export default DefectRice;
  