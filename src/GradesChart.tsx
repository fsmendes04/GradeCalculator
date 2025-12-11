import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const GradesChart = () => {
  const navigate = useNavigate();
  const grades = [9.6, 11.3, 5.0, 12.1, 19.9, 7.7, 7.7, 16.3, 13.2, 9.7, 14.8, 16.0, 8.5, 12.9, 8.6, 13.2, 9.1, 12.4, 8.1, 3.5, 6.6, 11.1, 6.6, 5.6, 15.3, 7.9, 9.6, 5.8, 12.2, 8.6, 17.8, 7.3, 7.8, 12.9, 18.8, 13.2, 18.4, 18.0, 8.9, 3.8, 5.3, 8.9, 5.6, 16.2, 15.9, 17.7, 12.1, 9.3, 18.8, 7.6, 13.1, 9.4, 16.0];
  const meanGrade = parseFloat((grades.reduce((acc, val) => acc + val, 0) / grades.length).toFixed(2));
  const myGrade = 13.2;

  const getInterval = (grade: number) => {
    if (grade < 0.5) return 0;
    if (grade >= 20.5) return 21;
    return Math.floor(grade + 0.5);
  };
  
  const intervalCount: { [key: number]: number } = {};
  for (let i = 0; i <= 20; i++) {
    intervalCount[i] = 0;
  }
  
  grades.forEach(grade => {
    const interval = getInterval(grade);
    if (interval >= 1 && interval <= 20) {
      intervalCount[interval]++;
    }
  });
  
  const totalGrades = grades.length;
  const data = [];
  
  for (let i = 0; i <= 20; i++) {
    data.push({
      interval: i.toString(),
      percentage: parseFloat(((intervalCount[i] / totalGrades) * 100).toFixed(1)),
      count: intervalCount[i]
    });
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-200 p-6">~
    <span></span>
      <div className="max-w-6xl mx-auto">
        <div className="mb-20 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <h1 className="text-6xl font-bold text-blue-900">Grade Distribution</h1>
          <div className="w-24"></div>
        </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <ResponsiveContainer width="100%" height={600}>
              <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis 
                  dataKey="interval" 
                  label={{ value: 'Grade', position: 'insideBottom', offset: -10, style: { fill: '#1e40af', fontWeight: 'bold' } }}
                  tick={{ fill: '#1e40af' }}
                  type="number"
                  domain={[0, 20]}
                  ticks={[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]}
                />
                <YAxis 
                  label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft', style: { fill: '#1e40af', fontWeight: 'bold' } }}
                  tick={{ fill: '#1e40af' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#eff6ff', 
                    border: '2px solid #3b82f6',
                    borderRadius: '8px'
                  }}
                  formatter={(value: any, name: any, props: any) => {
                    if (name === 'percentage') {
                      return [`${value}% (${props.payload.count} grades)`, 'Percentage'];
                    }
                    return [value, name];
                  }}
                />
                <Legend wrapperStyle={{ display: 'none' }} />
                <Bar 
                  dataKey="percentage" 
                  fill="#3b82f6" 
                  radius={[8, 8, 0, 0]}
                  name="percentage"
                />
                <ReferenceLine 
                  x={meanGrade} 
                  stroke="#ef4444" 
                  strokeWidth={3}
                  label={{ 
                    value: `Mean: ${meanGrade}`, 
                    position: 'top',
                    fill: '#ef4444',
                    fontWeight: 'bold',
                    fontSize: 14
                  }}
                />
                <ReferenceLine 
                  x={myGrade} 
                  stroke="#22c55e" 
                  strokeWidth={3}
                  label={{ 
                    value: `My Grade: ${myGrade}`, 
                    position: 'top',
                    fill: '#22c55e',
                    fontWeight: 'bold',
                    fontSize: 14
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
  );
};

export default GradesChart;
