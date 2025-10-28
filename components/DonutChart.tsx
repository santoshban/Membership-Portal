import React from 'react';

interface DonutChartProps {
    data: { value: number; color: string; label: string }[];
}

const DonutChart: React.FC<DonutChartProps> = ({ data }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    if (total === 0) {
        return <div className="flex items-center justify-center h-full text-gray-500">No data to display</div>;
    }

    const size = 180;
    const strokeWidth = 25;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    let accumulatedPercent = 0;

    return (
        <div className="w-full h-full flex items-center justify-center space-x-8">
            <div className="relative">
                <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="transparent"
                        stroke="#e5e7eb"
                        strokeWidth={strokeWidth}
                    />
                    {data.map((item, index) => {
                        const percent = item.value / total;
                        const strokeDashoffset = circumference * (1 - accumulatedPercent);
                        const strokeDasharray = `${circumference * percent} ${circumference * (1-percent)}`;
                        
                        const rotation = accumulatedPercent * 360;
                        accumulatedPercent += percent;

                        return (
                            <circle
                                key={index}
                                cx={size / 2}
                                cy={size / 2}
                                r={radius}
                                fill="transparent"
                                stroke={item.color}
                                strokeWidth={strokeWidth}
                                strokeDasharray={strokeDasharray}
                                strokeDashoffset={strokeDashoffset}
                                transform={`rotate(-90 ${size / 2} ${size / 2}) rotate(${rotation} ${size / 2} ${size / 2})`}
                                className="transition-all duration-500"
                            />
                        );
                    })}
                </svg>
                 <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-gray-800">{total}</span>
                    <span className="text-sm text-gray-500">Members</span>
                </div>
            </div>
            <div className="space-y-2">
                {data.map((item, index) => (
                    <div key={index} className="flex items-center">
                        <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></span>
                        <span className="text-sm text-gray-600">{item.label}: {item.value} ({total > 0 ? ((item.value / total) * 100).toFixed(0) : 0}%)</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DonutChart;