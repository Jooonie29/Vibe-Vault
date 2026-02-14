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

export interface ProductivityData {
    name: string;
    items: number;
    projects: number;
}

interface ProductivityChartProps {
    data?: ProductivityData[];
    isLoading?: boolean;
}

export function ProductivityChart({ data = [], isLoading }: ProductivityChartProps) {
    if (isLoading) {
        return (
            <div className="w-full h-[450px] flex items-center justify-center bg-muted/5 rounded-2xl animate-pulse">
                <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs text-muted-foreground">Loading analytics...</p>
                </div>
            </div>
        );
    }

    if (!data.length) {
        return (
            <div className="w-full h-[450px] flex items-center justify-center bg-muted/5 rounded-2xl">
                <p className="text-sm text-muted-foreground">No data available for this period</p>
            </div>
        );
    }

    return (
        <div className="w-full">
            {/* Chart Container */}
            <div className="relative h-[450px]">
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
                            domain={[0, (dataMax: number) => (dataMax < 10 ? 10 : dataMax)]}
                        />
                        <Tooltip
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <div className="bg-white border border-gray-100 p-3 rounded-xl shadow-lg">
                                            <p className="text-xs font-semibold text-gray-900 mb-1">{payload[0].payload.name}</p>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-violet-500" />
                                                    <span className="text-xs text-gray-600">{payload[0].value} Items</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                                    <span className="text-xs text-gray-600">{payload[1].value} Projects</span>
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
                            dataKey="items"
                            stroke="#8b5cf6" // violet-500
                            strokeWidth={2}
                            dot={{ fill: '#8b5cf6', strokeWidth: 0, r: 4 }}
                            activeDot={{ r: 6, stroke: '#8b5cf6', strokeWidth: 2, fill: '#fff' }}
                            isAnimationActive={true}
                        />
                        <Line
                            type="monotone"
                            dataKey="projects"
                            stroke="#10b981" // emerald-500
                            strokeWidth={2}
                            strokeDasharray="6 6"
                            dot={{ fill: '#10b981', strokeWidth: 0, r: 4 }}
                            activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2, fill: '#fff' }}
                            isAnimationActive={true}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-violet-500"></span>
                    <span className="text-xs text-gray-500">Items (Code, Prompts, Files)</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="text-xs text-gray-500">Active Projects</span>
                </div>
            </div>
        </div>
    );
}

export default ProductivityChart;
