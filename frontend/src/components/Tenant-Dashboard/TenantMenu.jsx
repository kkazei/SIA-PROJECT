import React from "react";

const TenantMenu = ({ announcements, onOpenModal, onLogout }) => {
  const menuItems = [
    {
      id: 'landlordAnnouncement',
      icon: '📢',
      label: 'Landlord Announcements',
      badge: announcements.length > 0 ? announcements.length : null,
      bgColor: 'bg-gray-900 hover:bg-gray-800'
    },
    {
      id: 'paymentHistory',
      icon: '📄',
      label: 'Payment History',
      bgColor: 'bg-gray-900 hover:bg-gray-800'
    },
    {
      id: 'lease',
      icon: '🏠',
      label: 'Lease Agreement',
      bgColor: 'bg-gray-900 hover:bg-gray-800'
    },
    {
      id: 'inquiries',
      icon: '✉️',
      label: 'Inquiries',
      bgColor: 'bg-gray-900 hover:bg-gray-800'
    },
    {
      id: 'browseApartments',
      icon: '🏘️',
      label: 'Browse Apartments',
      bgColor: 'bg-gray-900 hover:bg-gray-800'
    },
    {
      id: 'applications',
      icon: '📝',
      label: 'My Applications',
      bgColor: 'bg-gray-900 hover:bg-gray-800'
    },
    {
      id: 'logout',
      icon: '👋',
      label: 'Logout',
      bgColor: 'bg-red-500 hover:bg-red-600',
      action: onLogout
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
      {menuItems.map((item) => (
        <div
          key={item.id}
          onClick={item.action || (() => onOpenModal(item.id))}
          className={`${item.bgColor} text-white p-6 rounded-lg flex flex-col items-center cursor-pointer transition duration-200 relative`}
        >
          <span className="text-3xl">{item.icon}</span>
          <p className="mt-2">{item.label}</p>
          
          {item.badge && (
            <div className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center absolute -mt-2 ml-10">
              {item.badge}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default TenantMenu;