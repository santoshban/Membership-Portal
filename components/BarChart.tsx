import React from 'react';

interface BarChartProps {
    data: { month: string; revenue: number }[];
}

const BarChart: React.FC<BarChartProps> = ({ data }) => {
    const maxValue = Math.max(...data.map(d => d.revenue), 1); // Avoid division by zero

    return (
        <div className="w-full h-full flex flex-col">
            <div className="flex-grow flex items-end justify-around space-x-2">
                {data.map((item, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center group">
                        <div
                            className="w-full bg-[#004a97] hover:bg-[#003b7a] rounded-t-md transition-all duration-300 relative"
                            style={{ 
                                height: `${(item.revenue / maxValue) * 100}%`,
                            }}
                            title={`$${item.revenue.toFixed(2)}`}
                        >
                           <div className="opacity-0 group-hover:opacity-100 text-white text-xs text-center p-1 bg-gray-800 rounded-md absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max">
                                ${item.revenue.toFixed(2)}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="w-full h-6 border-t border-gray-200 mt-2 flex justify-around">
                 {data.map((item, index) => (
                    <div key={index} className="flex-1 text-center text-xs text-gray-500">
                        {item.month}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BarChart;