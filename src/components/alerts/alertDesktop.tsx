import clsx from "clsx";
import { useEffect, useState } from "react";
import { X, AlertTriangle, XCircle, Info, CheckCircle } from "lucide-react";

const ICONS = { 
  alerta: AlertTriangle, 
  error: XCircle, 
  info: Info, 
  sucesso: CheckCircle 
};

const COLORS = {
  alerta: "bg-yellow-100 border-yellow-500 text-yellow-700",
  error: "bg-red-100 border-red-500 text-red-700",
  info: "bg-blue-100 border-blue-500 text-blue-700",
  sucesso: "bg-green-100 border-green-500 text-green-700",
};

interface AlertProps {
  type: 'alerta' | 'error' | 'info' | 'sucesso';
  text: string;
  onClose: () => void;
}

const Alert = ({ type, text, onClose }: AlertProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!isVisible) return null;

  const IconComponent = ICONS[type];

  return (
    <div
      className={clsx(
        "fixed top-5 right-5 flex items-center w-[400px] p-4 border-l-8 shadow-lg rounded-lg transition-all duration-300",
        COLORS[type]
      )}
    >
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-md mr-4">
        <IconComponent size={24} className="w-8 h-8" />
      </div>
      <div className="flex-1">
        <h1 className="text-lg font-semibold capitalize">{type}</h1>
        <p className="text-sm">{text}</p>
      </div>
      <button onClick={() => setIsVisible(false)} className="text-gray-500 hover:text-gray-700">
        <X size={20} />
      </button>
    </div>
  );
};

export default Alert;
