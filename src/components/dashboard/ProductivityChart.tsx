import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

interface ProductivityData {
    name: string;
    focus: number;
    unfocused: number;
}

const data: ProductivityData[] = [
    { name: 'Aug', focus: 35, unfocused: 25 },
    { name: 'Sep', focus: 45, unfocused: 30 },
    { name: 'Oct', focus: 30, unfocused: 50 },
    { name: 'Nov', focus: 60, unfocused: 40 },
    { name: 'Dec', focus: 50, unfocused: 65 },
    { name: 'Jan', focus: 40, unfocused: 55 },
];

export function ProductivityChart() {
    return (
        <div className="w-full">
            {/* Chart Container */}
            <div className="relative h-64">
                {/* Floating Badge */}
                <div className="absolute top-4 left-1/4 bg-white shadow-lg border border-gray-100 px-3 py-2 rounded-xl z-10">
                    <p className="text-xs font-semibold text-gray-900">Week 8</p>
                    <p className="text-[10px] text-gray-500">Unbalanced</p>
                </div>

                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 40, right: 20, left: 0, bottom: 0 }}>
                        <CartesianGrid
                            strokeDasharray="4 4"
                            vertical={false}
                            stroke="#E5E7EB"
                        />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 11, fill: '#9CA3AF' }}
                            dy={10}
                        />
                        <YAxis
                            hide={true}
                            domain={[0, 100]}
                        />
                        <Tooltip
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <div className="bg-white border border-gray-100 p-3 rounded-xl shadow-lg">
                                            <p className="text-xs font-semibold text-gray-900 mb-1">{payload[0].payload.name}</p>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-rose-400" />
                                                    <span className="text-xs text-gray-600">{payload[0].value}% Focus</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-indigo-500" />
                                                    <span className="text-xs text-gray-600">{payload[1].value}% Flow</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Line
                            type="monotone"
                            dataKey="focus"
                            stroke="#F87171"
                            strokeWidth={2}
                            dot={{ fill: '#F87171', strokeWidth: 0, r: 4 }}
                            activeDot={{ r: 6, stroke: '#F87171', strokeWidth: 2, fill: '#fff' }}
                            isAnimationActive={true}
                        />
                        <Line
                            type="monotone"
                            dataKey="unfocused"
                            stroke="#6366F1"
                            strokeWidth={2}
                            strokeDasharray="6 6"
                            dot={{ fill: '#6366F1', strokeWidth: 0, r: 4 }}
                            activeDot={{ r: 6, stroke: '#6366F1', strokeWidth: 2, fill: '#fff' }}
                            isAnimationActive={true}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                    <span className="text-xs text-gray-500">Focus</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                    <span className="text-xs text-gray-500">Lack of focus</span>
                </div>
            </div>
        </div>
    );
}

export default ProductivityChart;
