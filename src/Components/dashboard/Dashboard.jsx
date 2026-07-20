import React from "react";

const Dashboard = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md p-4">
        <h2 className="text-xl font-bold mb-6">Management</h2>

        <nav className="space-y-4">
          <p className="font-semibold text-white bg-blue-600 p-2 rounded">
            Dashboard
          </p>
          <p className="text-gray-600">Add Fund</p>
          <p className="text-gray-600">RCU</p>
          <p className="text-gray-600">Banking Services</p>
          <p className="text-gray-600">CIBIL Services</p>
          <p className="text-gray-600">Loans & Credit</p>
          <p className="text-gray-600">Commission Plans</p>
          <p className="text-gray-600">Contact For API</p>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Header */}
        <div className="bg-white shadow p-4 flex justify-between items-center">
          <div className="text-lg font-semibold">Welcome back</div>

          <div className="flex items-center gap-4">
            <span className="bg-gray-200 px-3 py-1 rounded">Main ₹0</span>
            <span className="bg-gray-200 px-3 py-1 rounded">CIBIL ₹0</span>
            <button className="bg-green-500 text-white px-4 py-1 rounded">
              + Add Fund
            </button>
          </div>
        </div>

        {/* Banner */}
        <div className="p-4">
          <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white p-4 rounded-lg font-semibold">
            Booking • Recharge • Hotel • Visa • Coming Soon
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-10">
          {/* Partner Hub */}
          <div>
            <h1 className="text-2xl font-bold">Partner Hub</h1>
            <p className="text-gray-500 mb-4">Welcome back, Online Sales</p>

            <div className="bg-blue-100 p-3 rounded">UPDATE:</div>
          </div>

          {/* Bank Statement */}
          <div>
            <h2 className="text-xl font-bold mb-4 border-b pb-2">
              Bank Statement Analysis
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div className="card">Bank Statement Analysis</div>
              <div className="card">Fetch Bank Statement (Mobile)</div>
            </div>
          </div>

          {/* RCU */}
          <div>
            <h2 className="text-xl font-bold mb-4 border-b pb-2">RCU</h2>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div className="card">PAN Verification</div>
              <div className="card">Aadhaar Verification</div>
              <div className="card">GST Verification</div>
              <div className="card">MSME Verification</div>
              <div className="card">Bank Verification</div>
              <div className="card">RC Verification</div>
              <div className="card">Electricity Verification</div>
            </div>
          </div>

          {/* Loans & Credit */}
          <div>
            <h2 className="text-xl font-bold mb-4 border-b pb-2">
              Loans & Credit
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div className="card">Personal Loan (Instant)</div>
              <div className="card">Personal Loan (Normal)</div>
              <div className="card">Business Loan (Instant)</div>
              <div className="card">Business Loan (Normal)</div>
              <div className="card">Credit Card Apply</div>
              <div className="card">Insurance (PolicyBazaar)</div>
              <div className="card">Open Saving Account</div>
              <div className="card">Loan Status</div>
              <div className="card">Education Loan</div>
              <div className="card">Education Leads</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
