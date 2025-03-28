import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const SummaryCard = ({ title, items, action, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="p-5 bg-gray-800 rounded-xl shadow-lg border border-gray-700"
    >
      <h3 className="text-xl font-semibold mb-4 text-green-300">{title}</h3>
      <div className="space-y-2 mb-4">
        {items.map((item, index) => (
          <div key={index} className="flex justify-between">
            <span className="text-gray-300">{item.label}</span>
            {item.value && <span className="text-white font-medium">{item.value}</span>}
          </div>
        ))}
      </div>
      
      {action && (
        <div className="mt-4">
          {action.path ? (
            <Link 
              to={action.path}
              className="block w-full text-center py-2 px-3 bg-emerald-600 hover:bg-emerald-700 
              text-white rounded-lg transition-colors duration-200"
            >
              {action.label}
            </Link>
          ) : (
            <button
              onClick={action.onClick}
              className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 
              text-white rounded-lg transition-colors duration-200"
            >
              {action.label}
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default SummaryCard;