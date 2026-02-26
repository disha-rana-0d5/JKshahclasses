import { TrendingUp, LucideIcon, ArrowUpRight, ArrowDownRight } from "lucide-react";

export interface StatsCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  iconBgColor?: string;
  iconColor?: string;
  extraData?: { label: string; value: string }[];
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  iconBgColor = "bg-primary/10",
  iconColor = "text-primary",
  extraData,
}: StatsCardProps) {
  return (
    <div className="bg-gradient-to-br from-white via-white to-muted/20 rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-300 border border-border relative overflow-hidden group">
      {/* Background decoration */}
      <div className={`absolute -right-8 -top-8 w-32 h-32 ${iconBgColor} opacity-20 rounded-full blur-2xl group-hover:scale-110 transition-transform`}></div>
      
      <div className="relative">
        {/* Header Row */}
        <div className="flex items-start justify-between mb-3">
          <div className={`${iconBgColor} ${iconColor} p-2 rounded-lg`}>
            <Icon className="w-5 h-5" />
          </div>
          {trend && (
            <div
              className={`flex items-center gap-0.5 px-2 py-1 rounded-full text-xs ${
                trend.isPositive 
                  ? "bg-accent/10 text-accent border border-accent/20" 
                  : "bg-red-50 text-red-700"
              }`}
            >
              {trend.isPositive ? (
                <ArrowUpRight className="w-3 h-3" />
              ) : (
                <ArrowDownRight className="w-3 h-3" />
              )}
              <span>{trend.value}</span>
            </div>
          )}
        </div>

        {/* Stats Content */}
        <div className="mb-2">
          <p className="text-xs text-muted-foreground mb-0.5 uppercase tracking-wide">{title}</p>
          <h2 className="text-2xl text-foreground mb-0.5">{value}</h2>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>

        {/* Extra Data */}
        {extraData && extraData.length > 0 && (
          <div className="flex gap-3 pt-2 border-t border-border">
            {extraData.map((data, index) => (
              <div key={index} className="flex-1">
                <p className="text-[10px] text-muted-foreground uppercase">{data.label}</p>
                <p className="text-xs text-foreground">{data.value}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}