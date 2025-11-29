import React, { useState } from 'react';

export const Docs: React.FC = () => {
  const [section, setSection] = useState<'srs' | 'sds' | 'final'>('srs');

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto">
      <div className="flex gap-4 border-b border-gray-200 mb-8 pb-4">
        <button 
          onClick={() => setSection('srs')}
          className={`px-4 py-2 rounded-lg font-medium ${section === 'srs' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
        >
          SRS Document
        </button>
        <button 
          onClick={() => setSection('sds')}
          className={`px-4 py-2 rounded-lg font-medium ${section === 'sds' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
        >
          SDS Document
        </button>
        <button 
          onClick={() => setSection('final')}
          className={`px-4 py-2 rounded-lg font-medium ${section === 'final' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
        >
          Final Report
        </button>
      </div>

      <div className="prose prose-slate max-w-none">
        {section === 'srs' && (
          <div>
            <h1 className="text-3xl font-bold mb-6 text-gray-900">Software Requirements Specification (SRS)</h1>
            <div className="space-y-6">
              <section>
                <h3 className="text-xl font-semibold text-gray-800">1. Introduction</h3>
                <p className="text-gray-600">The Simba Estates Management System is a web-based application designed to digitize house rental operations in Kenya. It connects Landlords, Tenants, and Administrators.</p>
              </section>
              <section>
                <h3 className="text-xl font-semibold text-gray-800">2. User Roles</h3>
                <ul className="list-disc pl-6 text-gray-600">
                  <li><strong>Admin:</strong> System oversight, user management, global reports.</li>
                  <li><strong>Landlord:</strong> Property listing, tenant approval, rent tracking.</li>
                  <li><strong>Tenant:</strong> View properties, lease details, MPESA payment integration, maintenance requests.</li>
                </ul>
              </section>
              <section>
                <h3 className="text-xl font-semibold text-gray-800">3. Functional Requirements</h3>
                <ul className="list-disc pl-6 text-gray-600">
                  <li>User Registration/Login (Secure Authentication).</li>
                  <li>Property CRUD (Create, Read, Update, Delete).</li>
                  <li>Financial Reporting (Rent collection, Arrears in KES).</li>
                  <li>Geographical Mapping (Kenyan Cities).</li>
                </ul>
              </section>
            </div>
          </div>
        )}

        {section === 'sds' && (
          <div>
            <h1 className="text-3xl font-bold mb-6 text-gray-900">Software Design Specification (SDS)</h1>
             <div className="space-y-6">
              <section>
                <h3 className="text-xl font-semibold text-gray-800">1. System Architecture</h3>
                <p className="text-gray-600">The system utilizes a 3-Tier Architecture:</p>
                <ul className="list-disc pl-6 text-gray-600">
                  <li><strong>Presentation Layer:</strong> React SPA with Tailwind CSS.</li>
                  <li><strong>Logic Layer:</strong> TypeScript Controllers & Services.</li>
                  <li><strong>Data Layer:</strong> SQL Database (Simulated via LocalStorage for this demo).</li>
                </ul>
              </section>
              <section>
                <h3 className="text-xl font-semibold text-gray-800">2. Database Schema (Conceptual SQL)</h3>
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm mt-2">
{`TABLE Users (
  id INT PRIMARY KEY,
  role ENUM('Admin', 'Landlord', 'Tenant'),
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255)
);

TABLE Properties (
  id INT PRIMARY KEY,
  landlord_id INT FOREIGN KEY,
  address VARCHAR(255),
  rent_amount DECIMAL(10,2),
  status ENUM('Available', 'Occupied')
);

TABLE Payments (
  id INT PRIMARY KEY,
  lease_id INT,
  amount DECIMAL(10,2),
  mpesa_code VARCHAR(20)
);`}
                </pre>
              </section>
            </div>
          </div>
        )}

        {section === 'final' && (
          <div>
            <h1 className="text-3xl font-bold mb-6 text-gray-900">Project Final Report</h1>
            <div className="space-y-6">
              <section>
                <h3 className="text-xl font-semibold text-gray-800">1. Executive Summary</h3>
                <p className="text-gray-600">Simba Estates has been successfully developed to solve the chaos of manual rent collection in Nairobi. The system handles property onboarding and tenant leases seamlessly.</p>
              </section>
              <section>
                <h3 className="text-xl font-semibold text-gray-800">2. Implementation Details</h3>
                <p className="text-gray-600">
                  The frontend was built using React for a responsive experience on mobile devices (common in Kenya). 
                  Tailwind CSS ensures a modern aesthetic. The backend logic enforces strict role-based access control.
                </p>
              </section>
              <section>
                <h3 className="text-xl font-semibold text-gray-800">3. Future Scope</h3>
                <ul className="list-disc pl-6 text-gray-600">
                  <li>Live MPESA STK Push integration.</li>
                  <li>SMS Notifications via AfricasTalking.</li>
                  <li>Google Maps API for exact plot location.</li>
                </ul>
              </section>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};