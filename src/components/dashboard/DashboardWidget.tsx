import { LucideIcon } from 'lucide-react';

interface DashboardWidgetProps {
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
  className?: string;
}

export const DashboardWidget: React.FC<DashboardWidgetProps> = ({ title, icon: Icon, children, className = '' }) => {
  return (
    <div className={`bg-white rounded-2xl border border-gray-200/80 shadow-sm p-4 md:p-6 ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <Icon className="text-blue-600" size={20} />
        <h3 className="font-bold text-lg text-gray-800">{title}</h3>
      </div>
      <div className="h-full">
        {children}
      </div>
    </div>
  );
};