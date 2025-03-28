import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  Home, Search, FileText
} from "lucide-react";

const QuickActionLinks = ({ setActiveTab }) => {
  const actionLinks = [
    {
      icon: <Home className="w-5 h-5" />,
      text: "My Rentals",
      action: () => setActiveTab("rentals"),
      color: "from-emerald-500 to-emerald-700"
    },
    {
      icon: <Search className="w-5 h-5" />,
      text: "Find Properties",
      action: () => setActiveTab("properties"),
      color: "from-blue-500 to-blue-700"
    },
    {
      icon: <FileText className="w-5 h-5" />,
      text: "Applications",
      action: () => setActiveTab("applications"),
      color: "from-purple-500 to-purple-700"
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.7 }}
      className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
    >
      {actionLinks.map((link, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 + (index * 0.1) }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {link.path ? (
            <Link 
              to={link.path}
              className={`flex flex-col items-center justify-center p-4 bg-gradient-to-br ${link.color} 
              rounded-xl shadow-lg text-white h-24`}
            >
              {link.icon}
              <span className="mt-2 text-sm font-medium text-center">{link.text}</span>
            </Link>
          ) : (
            <button 
              onClick={link.action}
              className={`w-full flex flex-col items-center justify-center p-4 bg-gradient-to-br ${link.color} 
              rounded-xl shadow-lg text-white h-24`}
            >
              {link.icon}
              <span className="mt-2 text-sm font-medium text-center">{link.text}</span>
            </button>
          )}
        </motion.div>
      ))}
    </motion.div>
  );
};

export default QuickActionLinks;