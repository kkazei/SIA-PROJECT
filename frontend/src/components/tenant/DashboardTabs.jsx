import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import DashboardOverview from "./DashboardOverview";
import RentalsTab from "./RentalsTab";
import PropertiesTab from "./PropertiesTab";
import ApplicationsTab from "./ApplicationsTab";

const DashboardTabs = ({ 
  activeTab, 
  setActiveTab, 
  user, 
  myRentals,
  applications,
  properties,
  handleLogout,
  handleApplyForProperty,
  propertiesLoading,
  applicationsLoading
}) => {
  return (
    <Tabs 
      defaultValue="dashboard" 
      value={activeTab} 
      onValueChange={setActiveTab}
      className="w-full"
    >
      <TabsList className="w-full mb-6">
        <TabsTrigger value="dashboard" className="flex-1">Dashboard</TabsTrigger>
        <TabsTrigger value="rentals" className="flex-1">My Rentals</TabsTrigger>
        <TabsTrigger value="properties" className="flex-1">Find Properties</TabsTrigger>
        <TabsTrigger value="applications" className="flex-1">My Applications</TabsTrigger>
      </TabsList>

      <TabsContent value="dashboard">
        <DashboardOverview 
          user={user} 
          myRentals={myRentals} 
          applications={applications}
          setActiveTab={setActiveTab}
          handleLogout={handleLogout}
        />
      </TabsContent>

      <TabsContent value="rentals">
        <RentalsTab 
          myRentals={myRentals}
          propertiesLoading={propertiesLoading} 
          setActiveTab={setActiveTab} 
        />
      </TabsContent>

      <TabsContent value="properties">
        <PropertiesTab 
          properties={properties}
          propertiesLoading={propertiesLoading}
          handleApplyForProperty={handleApplyForProperty} 
          setActiveTab={setActiveTab}
        />
      </TabsContent>

      <TabsContent value="applications">
        <ApplicationsTab 
          applications={applications} 
          applicationsLoading={applicationsLoading}
          setActiveTab={setActiveTab} 
        />
      </TabsContent>
    </Tabs>
  );
};

export default DashboardTabs;