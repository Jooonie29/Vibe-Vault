import React from 'react';
import { motion } from 'framer-motion';
import { format, subDays, isSameDay } from 'date-fns';

interface ChartDataPoint {
    day: string;
    fullDate: string;
    value: number;
    label: string;
}

interface ProjectAnalyticsProps {
    data: ChartDataPoint[];
    maxValue: number;
    timePeriod: string;
}

export function ProjectAnalytics({ data, maxValue, timePeriod }: ProjectAnalyticsProps) {
    const safeMaxValue = Math.max(maxValue, 1);
    const hasData = data.some(d => d.value > 0);
    const totalActivity = data.reduce((sum, d) => sum + d.value, 0);
    
    // Calculate average for tooltip
    const avgValue = Math.round(totalActivity / (data.length || 1));
    
    return (
        <div className="w-full h-full flex flex-col">
            {/* Chart Header with Stats */}
            <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-gray-900">{totalActivity}</span>
                    <span className="text-sm text-gray-500 font-medium">activities</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>{timePeriod}</span>
                </div>
            </div>

            {/* Chart Container */}
            <div className="flex-1 min-h-[180px] flex items-end justify-between gap-1 px-1">
                {data.map((point, i) => {
                    const isToday = isSameDay(new Date(point.fullDate), new Date());
                    const hasActivity = point.value > 0;
                    
                    // Calculate discrete height in 10 levels using fixed reference (max = 10 activities)
                    // Level 1 = 10%, Level 2 = 20%, ..., Level 10 = 100%
                    // Using fixed max of 10 so 1 activity = 10% height, not 100%
                    const FIXED_MAX_ACTIVITIES = 10;
                    let heightLevel = 0;
                    if (hasActivity) {
                        // Map to 10 discrete levels based on fixed maximum of 10
                        heightLevel = Math.min(10, Math.max(1, Math.ceil(point.value / FIXED_MAX_ACTIVITIES * 10)));
                    }
                    const height = hasData ? (heightLevel * 10) : 4;
                    
                    return (
                        <div 
                            key={i} 
                            className="flex-1 flex flex-col items-center gap-2 relative group cursor-pointer"
                        >
                            {/* Tooltip */}
                            <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                                <div className="bg-gray-900 text-white px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap shadow-lg">
                                    <div className="font-bold">{point.value} activities</div>
                                    <div className="text-gray-400 text-[10px]">{point.label}</div>
                                    {/* Arrow */}
                                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                                </div>
                            </div>

                            {/* Bar Container */}
                            <div className="w-full h-[140px] flex items-end justify-center relative">
                                {/* Background track */}
                                <div className="absolute inset-x-1 bottom-0 top-0 bg-gray-100 rounded-t-lg opacity-50"></div>
                                
                                {/* Actual bar */}
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${height}%` }}
                                    transition={{ 
                                        duration: 0.6, 
                                        delay: i * 0.05, 
                                        ease: [0.34, 1.56, 0.64, 1] 
                                    }}
                                    className={`w-full max-w-[40px] rounded-t-lg relative overflow-hidden transition-all duration-300 ${
                                        hasActivity 
                                            ? isToday 
                                                ? 'bg-gradient-to-t from-violet-600 to-violet-400 shadow-lg shadow-violet-200' 
                                                : 'bg-gradient-to-t from-emerald-600 to-emerald-400'
                                            : 'bg-gray-200'
                                    }`}
                                >
                                    {/* Shine effect */}
                                    {hasActivity && (
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                                    )}
                                </motion.div>
                            </div>

                            {/* Day Label */}
                            <div className="flex flex-col items-center gap-0.5">
                                <span className={`text-xs font-semibold uppercase tracking-wider ${
                                    isToday ? 'text-violet-600' : 'text-gray-400'
                                }`}>
                                    {point.day}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Summary Stats Row */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded bg-gradient-to-t from-violet-600 to-violet-400"></div>
                        <span className="text-xs text-gray-500">Today</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded bg-gradient-to-t from-emerald-600 to-emerald-400"></div>
                        <span className="text-xs text-gray-500">Activity</span>
                    </div>
                </div>
                <div className="text-xs text-gray-400">
                    Avg: <span className="font-semibold text-gray-600">{avgValue}</span> per day
                </div>
            </div>
        </div>
    );
}
