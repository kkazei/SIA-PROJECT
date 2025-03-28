import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import SummaryCard from "./SummaryCard";
import QuickActionLinks from "./QuickActionLinks";

const DashboardOverview = ({ user, myRentals, applications, setActiveTab, handleLogout }) => {
  return (
    <>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-8'>
        <SummaryCard 
          title={`Welcome, ${user.name}!`}
          items={[
            { label: "Role", value: user.role },
            { label: "Email", value: user.email }
          ]}
          delay={0.2}
        />

        <SummaryCard 
          title="Housing Summary"
          items={myRentals && myRentals.length > 0 
            ? [
                { label: `You are currently renting ${myRentals.length} propert${myRentals.length === 1 ? 'y' : 'ies'}` },
                { label: "Current residence", value: myRentals[0]?.title || 'N/A' }
              ]
            : [{ label: "You're not currently renting any properties" }]
          }
          action={myRentals && myRentals.length > 0
            ? { label: "View all rentals", onClick: () => setActiveTab("rentals") }
            : { label: "Browse available properties", onClick: () => setActiveTab("properties") }
          }
          delay={0.3}
        />

        <SummaryCard 
          title="Application Status"
          items={applications.length > 0
            ? [
                { label: `You have ${applications.length} active application(s)` },
                { label: "Latest application", value: applications[0]?.status || 'N/A' }
              ]
            : [{ label: "No active applications" }]
          }
          action={applications.length > 0 
            ? { label: "View all applications", onClick: () => setActiveTab("applications") }
            : null
          }
          delay={0.4}
        />
        
        <SummaryCard 
          title="Next Payment"
          items={myRentals && myRentals.length > 0
            ? [
                { label: "Property", value: myRentals[0]?.title || 'N/A' },
                { label: "Amount", value: `$${myRentals[0]?.rentAmount || 'N/A'}/month` },
                { label: "Due date", value: myRentals[0]?.leaseStart 
                  ? new Date(new Date(myRentals[0].leaseStart).setMonth(new Date().getMonth() + 1)).toLocaleDateString() 
                  : 'N/A' 
                }
              ]
            : [{ label: "No active leases" }]
          }
          action={myRentals && myRentals.length > 0
            ? { label: "Make a payment", path: "/tenant/payments" }
            : null
          }
          delay={0.5}
        />
      </div>

      <h3 className='text-xl font-semibold text-green-400 mb-4'>Quick Actions</h3>
      <QuickActionLinks setActiveTab={setActiveTab} />



      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className='mt-4'
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogout}
          className='w-full py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white 
          font-bold rounded-lg shadow-lg hover:from-green-600 hover:to-emerald-700
          focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900'
        >
          Logout
        </motion.button>
      </motion.div>
    </>
  );
};

export default DashboardOverview;