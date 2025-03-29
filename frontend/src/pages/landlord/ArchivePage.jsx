import React from "react";

const ArchivePage = () => {
  const archivedItems = [
    { id: 1, name: "Archived Item 1", date: "2025-03-01" },
    { id: 2, name: "Archived Item 2", date: "2025-03-15" },
    { id: 3, name: "Archived Item 3", date: "2025-03-20" },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Archive</h1>
        <input
          type="text"
          placeholder="Search archived items..."
          className="mt-4 w-full max-w-md px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </header>

      {/* Archived Items */}
      <main className="bg-white p-6 rounded-lg shadow-md">
        {archivedItems.length > 0 ? (
          <ul className="space-y-4">
            {archivedItems.map((item) => (
              <li
                key={item.id}
                className="p-4 border border-gray-200 rounded-lg hover:shadow-lg transition-shadow"
              >
                <h2 className="text-xl font-semibold text-gray-700">
                  {item.name}
                </h2>
                <p className="text-sm text-gray-500">Date Archived: {item.date}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-center">No archived items found.</p>
        )}
      </main>
    </div>
  );
};

export default ArchivePage;