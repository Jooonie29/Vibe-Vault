import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface DashboardStatCardProps {
    label: string;
    value: string;
    trend: number;
    icon: LucideIcon;
    color: string;
    history: number[];
}

export function DashboardStatCard({
    label,
    value,
    trend,
    icon: Icon,
    color,
    history,
}: DashboardStatCardProps) {
    const isPositive = trend > 0;
    const isNegative = trend < 0;

    // Generate smooth SVG path for mini chart
    const max = Math.max(...history, 1);
    const min = Math.min(...history);
    const range = max - min || 1;
    const points = history.map((v, i) => ({
        x: (i / (history.length - 1)) * 100,
        y: 100 - ((v - min) / range) * 70 - 15,
    }));
    
    // Create smooth curve
    const path = points.reduce((acc, point, i, arr) => {
        if (i === 0) return `M ${point.x},${point.y}`;
        const prev = arr[i - 1];
        const cp1x = prev.x + (point.x - prev.x) / 3;
        const cp2x = prev.x + 2 * (point.x - prev.x) / 3;
        return `${acc} C ${cp1x},${prev.y} ${cp2x},${point.y} ${point.x},${point.y}`;
    }, '');

    // Icon background colors from reference
    const iconBgColors: Record<string, string> = {
        'bg-blue-500': 'bg-blue-100 dark:bg-blue-900/30',
        'bg-purple-500': 'bg-purple-100 dark:bg-purple-900/30', 
        'bg-orange-500': 'bg-orange-100 dark:bg-orange-900/30',
        'bg-emerald-500': 'bg-emerald-100 dark:bg-emerald-900/30',
    };

    const iconTextColors: Record<string, string> = {
        'bg-blue-500': 'text-blue-500 dark:text-blue-400',
        'bg-purple-500': 'text-purple-500 dark:text-purple-400',
        'bg-orange-500': 'text-orange-500 dark:text-orange-400', 
        'bg-emerald-500': 'text-emerald-500 dark:text-emerald-400',
    };

    return (
        <motion.div
            whileHover={{ y: -2 }}
            className="bg-card rounded-2xl p-6 shadow-sm border border-border transition-all duration-300"
        >
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <p className="text-muted-foreground text-sm font-medium">{label}</p>
                <div className={`w-10 h-10 rounded-xl ${iconBgColors[color] || 'bg-muted'} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${iconTextColors[color] || 'text-muted-foreground'}`} />
                </div>
            </div>

            {/* Value */}
            <h3 className="text-3xl font-bold text-card-foreground mb-4">{value}</h3>

            {/* Mini Chart and Trend */}
            <div className="flex items-end justify-between">
                {/* Trend Badge */}
                <div className={`flex items-center gap-1 text-sm font-medium ${
                    isPositive ? 'text-emerald-500' : isNegative ? 'text-red-500' : 'text-muted-foreground'
                }`}>
                    {isPositive && <TrendingUp className="w-4 h-4" />}
                    {isNegative && <TrendingDown className="w-4 h-4" />}
                    <span>{isPositive ? '+' : ''}{trend}%</span>
                </div>

                {/* Sparkline Chart */}
                <div className="w-24 h-10">
                    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <motion.path
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 1.5, ease: "easeInOut" }}
                            d={path}
                            fill="none"
                            stroke={isPositive ? "#10B981" : isNegative ? "#EF4444" : "#9CA3AF"}
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </div>
            </div>
        </motion.div>
    );
}

export default DashboardStatCard;
