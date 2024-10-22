const Composition = () => (
    <div className="bg-white shadow-md p-6 mb-6 rounded mx-4">
      <h3 className="text-lg font-bold mb-4">Composition</h3>
      <table className="w-full text-left">
        <thead>
          <tr>
            <th className="border-b-2 pb-2">Name</th>
            <th className="border-b-2 pb-2">Length</th>
            <th className="border-b-2 pb-2">Actual</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>ข้าวเต็มเมล็ด</td>
            <td>&gt;= 7</td>
            <td>0.00 %</td>
          </tr>
          <tr>
            <td>ข้าวใหญ่</td>
            <td>3.5 - 6.99</td>
            <td>0.00 %</td>
          </tr>
          <tr>
            <td>ข้าวหักธรรมดา</td>
            <td>0 - 3.49</td>
            <td>0.00 %</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
  
  export default Composition;
  