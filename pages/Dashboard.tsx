import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { UserRole, Property, Payment, User, Lease } from '../types';
import { KENYAN_CITIES, PROPERTY_TYPES, COMMON_FEATURES, formatCurrency } from '../constants';
import { Plus, Check, MapPin, DollarSign, AlertCircle, Loader2, Home, User as UserIcon, Save, Trash2, Tag, ShieldCheck, XCircle, CheckCircle, Smartphone, Clock, Filter, Calendar, FileDown, Search, SlidersHorizontal, X } from 'lucide-react';
import { jsPDF } from 'jspdf';

// Sub-components for dashboards
const StatCard = ({ label, value, color }: { label: string, value: string, color: string }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
    <p className="text-gray-500 text-sm">{label}</p>
    <p className={`text-2xl font-bold mt-2 ${color}`}>{value}</p>
  </div>
);

export const Dashboard: React.FC<{ activeTab: string }> = ({ activeTab }) => {
  const { user } = useAuth();
  const { 
    properties, leases, addProperty, updateProperty, createLease, terminateLease, 
    makePayment, payments, maintenance, reportIssue, users, updateUserStatus
  } = useData();

  // State for Landlord
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newProp, setNewProp] = useState<Partial<Property>>({ 
    city: 'Nairobi', 
    status: 'AVAILABLE',
    propertyType: '1 Bedroom',
    features: [],
    rentAmount: 0,
    depositAmount: 0
  });

  // State for Tenant Payment & Registration
  const [showPaymentConfirm, setShowPaymentConfirm] = useState(false);
  const [mpesaNumber, setMpesaNumber] = useState('');
  const [transactionReceipt, setTransactionReceipt] = useState<Payment | null>(null);
  const [showRegistrationSuccess, setShowRegistrationSuccess] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isRegisterResidenceOpen, setIsRegisterResidenceOpen] = useState(false);
  const [newResidence, setNewResidence] = useState<Partial<Property>>({ 
    city: 'Nairobi', 
    rentAmount: 15000,
    depositAmount: 0,
    features: [],
    propertyType: 'Bedsitter'
  });
  
  // State for Tenant Dashboard Search & Filters
  const [tenantSearchTerm, setTenantSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<{min: number | string, max: number | string}>({ min: '', max: '' });
  const [filterType, setFilterType] = useState('');
  const [filterFeatures, setFilterFeatures] = useState<string[]>([]);

  // State for Tenant Managing Property
  const [editPropertyState, setEditPropertyState] = useState<Partial<Property> | null>(null);

  // State for Admin
  const [paymentFilterType, setPaymentFilterType] = useState<string>('ALL');
  const [paymentFilterDate, setPaymentFilterDate] = useState<string>('');

  useEffect(() => {
    if (user?.phone) {
      setMpesaNumber(user.phone);
    }
  }, [user]);

  // --- PDF GENERATION HELPER ---
  const generateLeasePDF = (lease: Lease, property: Property, tenant: User, landlord: User) => {
    const doc = new jsPDF();
    const lineHeight = 10;
    let yPos = 20;

    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("RESIDENTIAL LEASE AGREEMENT", 105, yPos, { align: "center" });
    yPos += 15;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Date Generated: ${new Date().toLocaleDateString()}`, 105, yPos, { align: "center" });
    yPos += 15;

    // Parties
    doc.setFont("helvetica", "bold");
    doc.text("1. PARTIES", 20, yPos);
    yPos += lineHeight;
    doc.setFont("helvetica", "normal");
    doc.text(`This Lease Agreement is made between:`, 20, yPos);
    yPos += lineHeight;
    doc.text(`LANDLORD: ${landlord.name} (Phone: ${landlord.phone || 'N/A'})`, 20, yPos);
    yPos += 7;
    doc.text(`TENANT: ${tenant.name} (Phone: ${tenant.phone || 'N/A'}, ID: ${tenant.id})`, 20, yPos);
    yPos += 15;

    // Property
    doc.setFont("helvetica", "bold");
    doc.text("2. PROPERTY", 20, yPos);
    yPos += lineHeight;
    doc.setFont("helvetica", "normal");
    doc.text(`The Landlord agrees to rent to the Tenant the property located at:`, 20, yPos);
    yPos += lineHeight;
    doc.text(`${property.title} (${property.propertyType || 'Residential'})`, 20, yPos);
    yPos += 7;
    doc.text(`${property.address}, ${property.city}, Kenya`, 20, yPos);
    yPos += 15;

    // Term
    doc.setFont("helvetica", "bold");
    doc.text("3. TERM", 20, yPos);
    yPos += lineHeight;
    doc.setFont("helvetica", "normal");
    doc.text(`Lease Start Date: ${lease.startDate}`, 20, yPos);
    yPos += 7;
    doc.text(`Lease End Date: ${lease.endDate}`, 20, yPos);
    yPos += 15;

    // Rent
    doc.setFont("helvetica", "bold");
    doc.text("4. RENT & DEPOSIT", 20, yPos);
    yPos += lineHeight;
    doc.setFont("helvetica", "normal");
    doc.text(`Monthly Rent: KES ${property.rentAmount.toLocaleString()}`, 20, yPos);
    yPos += 7;
    doc.text(`Security Deposit: KES ${property.depositAmount.toLocaleString()}`, 20, yPos);
    yPos += 7;
    doc.text(`Rent is due on the 5th day of each month. Payment method: MPESA/Bank Transfer.`, 20, yPos);
    yPos += 15;

    // Clauses
    doc.setFont("helvetica", "bold");
    doc.text("5. TERMS AND CONDITIONS", 20, yPos);
    yPos += lineHeight;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const terms = [
      "- The Tenant agrees to keep the premises in good condition.",
      "- The Tenant shall not sublease the property without written consent.",
      "- Utilities (Water, Electricity) are to be paid by the Tenant unless stated otherwise.",
      "- The Landlord reserves the right to inspect the property with 24 hours notice.",
      "- This agreement is governed by the Laws of the Republic of Kenya."
    ];
    
    terms.forEach(term => {
      doc.text(term, 20, yPos);
      yPos += 7;
    });

    yPos += 20;

    // Signatures
    doc.setFontSize(10);
    doc.text("__________________________", 20, yPos);
    doc.text("__________________________", 120, yPos);
    yPos += 5;
    doc.text("Landlord Signature", 20, yPos);
    doc.text("Tenant Signature", 120, yPos);

    doc.save(`Lease_Agreement_${tenant.name.replace(/\s+/g, '_')}.pdf`);
  };

  // --- LANDLORD VIEWS ---
  if (user?.role === UserRole.LANDLORD) {
    const myProperties = properties.filter(p => p.landlordId === user.id);
    const myIncome = payments.filter(pay => 
      leases.find(l => l.id === pay.leaseId && l.propertyId && myProperties.find(mp => mp.id === l.propertyId))
    ).reduce((acc, curr) => acc + curr.amount, 0);

    const handleAddProp = (e: React.FormEvent) => {
      e.preventDefault();
      addProperty({ 
        landlordId: user.id,
        title: newProp.title || 'Untitled Property',
        address: newProp.address || 'Nairobi',
        city: newProp.city || 'Nairobi',
        propertyType: newProp.propertyType || 'Apartment',
        rentAmount: newProp.rentAmount || 0,
        depositAmount: newProp.depositAmount || 0,
        status: 'AVAILABLE',
        imageUrl: `https://picsum.photos/800/600?random=${Date.now()}`,
        features: newProp.features || []
      });
      setIsAddOpen(false);
      setNewProp({ city: 'Nairobi', status: 'AVAILABLE', features: [], rentAmount: 0, depositAmount: 0, propertyType: '1 Bedroom' });
      // Replaced alert with nothing - UI will just close. Or could add a toast.
    };

    if (activeTab === 'dashboard') {
      return (
        <div className="space-y-6">
          {user.status === 'PENDING' && (
             <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded shadow-sm flex items-start gap-3">
               <AlertCircle className="text-yellow-600 mt-0.5" />
               <div>
                 <h3 className="text-yellow-800 font-bold">Account Under Review</h3>
                 <p className="text-yellow-700 text-sm mt-1">
                   Your landlord account is currently pending approval by the admin. You cannot list new properties until approved.
                 </p>
               </div>
             </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard label="Total Properties" value={myProperties.length.toString()} color="text-blue-600" />
            <StatCard label="Total Income (KES)" value={formatCurrency(myIncome)} color="text-kenyaGreen" />
            <StatCard label="Occupancy Rate" value={`${Math.round((myProperties.filter(p => p.status === 'OCCUPIED').length / (myProperties.length || 1)) * 100)}%`} color="text-purple-600" />
          </div>
          
          <h3 className="text-lg font-bold text-gray-800 mt-8">Recent Maintenance Requests</h3>
          <div className="bg-white rounded-lg shadow overflow-hidden">
             <table className="w-full text-left">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="p-4 font-semibold text-gray-600">Issue</th>
                    <th className="p-4 font-semibold text-gray-600">Priority</th>
                    <th className="p-4 font-semibold text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {maintenance.filter(m => myProperties.find(p => p.id === m.propertyId)).length === 0 ? (
                     <tr><td colSpan={3} className="p-4 text-gray-500">No active requests</td></tr>
                  ) : (
                    maintenance.filter(m => myProperties.find(p => p.id === m.propertyId)).map(m => (
                      <tr key={m.id} className="border-b">
                        <td className="p-4">{m.description}</td>
                        <td className="p-4 text-orange-600 font-bold">{m.priority}</td>
                        <td className="p-4">{m.status}</td>
                      </tr>
                    ))
                  )}
                </tbody>
             </table>
          </div>
        </div>
      );
    }

    if (activeTab === 'properties') {
      return (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">My Portfolio</h2>
            {user.status === 'APPROVED' ? (
              <button onClick={() => setIsAddOpen(true)} className="bg-kenyaGreen text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors shadow-sm">
                <Plus size={18} /> List New Property
              </button>
            ) : (
              <button disabled className="bg-gray-300 text-gray-500 px-4 py-2 rounded-lg flex items-center gap-2 cursor-not-allowed">
                <ShieldCheck size={18} /> Approval Pending
              </button>
            )}
          </div>

          {isAddOpen && (
            <div className="bg-white p-6 rounded-lg shadow-md mb-6 border border-green-100 animate-in slide-in-from-top-4">
              <h3 className="font-bold text-lg mb-4 text-gray-800 border-b pb-2">New Property Details</h3>
              <form onSubmit={handleAddProp} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Property Title</label>
                  <input placeholder="e.g. Sunset Apartments, Block B" className="w-full border p-2 rounded focus:ring-2 focus:ring-kenyaGreen outline-none transition-all" required onChange={e => setNewProp({...newProp, title: e.target.value})} />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
                  <select 
                    className="w-full border p-2 rounded focus:ring-2 focus:ring-kenyaGreen outline-none bg-white transition-all" 
                    onChange={e => setNewProp({...newProp, propertyType: e.target.value})}
                    value={newProp.propertyType}
                  >
                    {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address / Location</label>
                  <input placeholder="e.g. Moi Avenue, near CBD" className="w-full border p-2 rounded focus:ring-2 focus:ring-kenyaGreen outline-none transition-all" required onChange={e => setNewProp({...newProp, address: e.target.value})} />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <select className="w-full border p-2 rounded focus:ring-2 focus:ring-kenyaGreen outline-none bg-white transition-all" onChange={e => setNewProp({...newProp, city: e.target.value})}>
                    {KENYAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Rent (KES)</label>
                  <input type="number" placeholder="0" className="w-full border p-2 rounded focus:ring-2 focus:ring-kenyaGreen outline-none transition-all" required onChange={e => setNewProp({...newProp, rentAmount: parseInt(e.target.value)})} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deposit Amount (KES)</label>
                  <input type="number" placeholder="0" className="w-full border p-2 rounded focus:ring-2 focus:ring-kenyaGreen outline-none transition-all" required onChange={e => setNewProp({...newProp, depositAmount: parseInt(e.target.value)})} />
                </div>

                <div className="col-span-1 md:col-span-2">
                   <label className="block text-sm font-medium text-gray-700 mb-1">Features (comma separated)</label>
                   <input placeholder="WiFi, CCTV, Borehole, Parking" className="w-full border p-2 rounded focus:ring-2 focus:ring-kenyaGreen outline-none transition-all" onChange={e => setNewProp({...newProp, features: e.target.value.split(',').map(s => s.trim())})} />
                </div>

                <div className="col-span-1 md:col-span-2 flex gap-3 mt-2">
                  <button type="submit" className="bg-slate-900 text-white py-2 px-6 rounded font-medium hover:bg-slate-800 transition-colors">Publish Listing</button>
                  <button type="button" onClick={() => setIsAddOpen(false)} className="bg-gray-100 text-gray-700 py-2 px-6 rounded font-medium hover:bg-gray-200 transition-colors">Cancel</button>
                </div>
              </form>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myProperties.map(prop => (
              <div key={prop.id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 group hover:shadow-md transition-shadow">
                <div className="relative h-48 overflow-hidden">
                   <img src={prop.imageUrl} alt={prop.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                   <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-bold text-gray-700 shadow-sm">
                     {prop.city}
                   </div>
                   <div className="absolute bottom-2 left-2 bg-slate-900/80 text-white px-2 py-1 rounded text-xs">
                     {prop.propertyType || 'Apartment'}
                   </div>
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-lg text-gray-900 line-clamp-1">{prop.title}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${prop.status === 'AVAILABLE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {prop.status}
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm flex items-center gap-1 mt-1"><MapPin size={14}/> {prop.address}</p>
                  
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {prop.features.slice(0,3).map((f, i) => (
                      <span key={i} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{f}</span>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                    <div>
                      <p className="text-xs text-gray-400">Monthly Rent</p>
                      <p className="text-kenyaRed font-bold">{formatCurrency(prop.rentAmount)}</p>
                    </div>
                    {prop.depositAmount > 0 && (
                      <div className="text-right">
                        <p className="text-xs text-gray-400">Deposit</p>
                        <p className="text-gray-700 font-medium text-sm">{formatCurrency(prop.depositAmount)}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }
    
    if (activeTab === 'tenants') {
      const myLeases = leases.filter(l => l.isActive && myProperties.find(p => p.id === l.propertyId));

      return (
        <div>
          <h2 className="text-xl font-bold mb-6">Active Tenants</h2>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-4 font-semibold text-gray-600">Tenant Name</th>
                  <th className="p-4 font-semibold text-gray-600">Property</th>
                  <th className="p-4 font-semibold text-gray-600">Contact</th>
                  <th className="p-4 font-semibold text-gray-600">Rent</th>
                  <th className="p-4 font-semibold text-gray-600">Lease End</th>
                  <th className="p-4 font-semibold text-gray-600">Action</th>
                </tr>
              </thead>
              <tbody>
                {myLeases.length === 0 ? (
                  <tr><td colSpan={6} className="p-6 text-center text-gray-500">No active tenants found.</td></tr>
                ) : (
                  myLeases.map(lease => {
                    const tenant = users.find(u => u.id === lease.tenantId);
                    const property = properties.find(p => p.id === lease.propertyId);
                    return (
                      <tr key={lease.id} className="border-b hover:bg-gray-50">
                        <td className="p-4 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-xs font-bold">
                            {tenant?.name.charAt(0)}
                          </div>
                          <span className="font-medium">{tenant?.name || 'Unknown'}</span>
                        </td>
                        <td className="p-4 text-gray-600">{property?.title}</td>
                        <td className="p-4 text-gray-600">{tenant?.phone || tenant?.email}</td>
                        <td className="p-4 text-kenyaGreen font-bold">{formatCurrency(property?.rentAmount || 0)}</td>
                        <td className="p-4 text-sm text-gray-500">{lease.endDate}</td>
                        <td className="p-4">
                          <button 
                             onClick={() => {
                               if (tenant && property) {
                                 generateLeasePDF(lease, property, tenant, user);
                               }
                             }}
                             className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm font-medium transition-colors"
                             title="Download Lease Agreement"
                          >
                            <FileDown size={16} /> Agreement
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    if (activeTab === 'payments') {
      const myPropertyIds = myProperties.map(p => p.id);
      const myLeases = leases.filter(l => myPropertyIds.includes(l.propertyId));
      const myLeaseIds = myLeases.map(l => l.id);
      const myPayments = payments.filter(p => myLeaseIds.includes(p.leaseId));

      return (
        <div>
          <h2 className="text-xl font-bold mb-6">Received Payments</h2>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
             <table className="w-full text-left">
               <thead className="bg-gray-50 border-b">
                 <tr>
                   <th className="p-4 font-semibold text-gray-600">Date</th>
                   <th className="p-4 font-semibold text-gray-600">Tenant</th>
                   <th className="p-4 font-semibold text-gray-600">Property</th>
                   <th className="p-4 font-semibold text-gray-600">Type</th>
                   <th className="p-4 font-semibold text-gray-600">Code</th>
                   <th className="p-4 font-semibold text-gray-600 text-right">Amount</th>
                 </tr>
               </thead>
               <tbody>
                 {myPayments.length === 0 ? (
                   <tr><td colSpan={6} className="p-6 text-center text-gray-500">No payments found.</td></tr>
                 ) : (
                   myPayments.map(pay => {
                     const lease = leases.find(l => l.id === pay.leaseId);
                     const tenant = users.find(u => u.id === lease?.tenantId);
                     const property = properties.find(p => p.id === lease?.propertyId);
                     return (
                       <tr key={pay.id} className="border-b hover:bg-gray-50">
                         <td className="p-4 text-sm text-gray-600">{new Date(pay.date).toLocaleDateString()}</td>
                         <td className="p-4 font-medium">{tenant?.name || 'Unknown'}</td>
                         <td className="p-4 text-gray-600 text-sm">{property?.title || 'Unknown'}</td>
                         <td className="p-4"><span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold">{pay.type}</span></td>
                         <td className="p-4 font-mono text-gray-500">{pay.transactionCode}</td>
                         <td className="p-4 text-right font-bold text-kenyaGreen">{formatCurrency(pay.amount)}</td>
                       </tr>
                     )
                   })
                 )}
               </tbody>
             </table>
          </div>
        </div>
      );
    }
  }

  // --- TENANT VIEWS ---
  if (user?.role === UserRole.TENANT) {
    const myLease = leases.find(l => l.tenantId === user.id && l.isActive);
    const myProperty = myLease ? properties.find(p => p.id === myLease.propertyId) : null;
    const availableProperties = properties.filter(p => p.status === 'AVAILABLE');

    const filteredProperties = availableProperties.filter(p => {
        const term = tenantSearchTerm.toLowerCase();
        const matchesSearch = (
            p.title.toLowerCase().includes(term) ||
            p.city.toLowerCase().includes(term) ||
            (p.propertyType && p.propertyType.toLowerCase().includes(term)) ||
            (p.address && p.address.toLowerCase().includes(term))
        );
        
        // Price Range Logic
        const minP = priceRange.min === '' ? 0 : Number(priceRange.min);
        const maxP = priceRange.max === '' ? Infinity : Number(priceRange.max);
        const matchesPrice = p.rentAmount >= minP && p.rentAmount <= maxP;

        // Type Logic
        const matchesType = filterType === '' || p.propertyType === filterType;

        // Features Logic (AND logic: property must have ALL selected features)
        const matchesFeatures = filterFeatures.length === 0 || filterFeatures.every(f => 
            p.features.some(pf => pf.toLowerCase().includes(f.toLowerCase()))
        );

        return matchesSearch && matchesPrice && matchesType && matchesFeatures;
    });

    const handleRegisterResidence = (e: React.FormEvent) => {
      e.preventDefault();
      const property = addProperty({
        ...newResidence as any,
        landlordId: 'landlord-1',
        imageUrl: `https://picsum.photos/800/600?random=${Date.now()}`,
        features: newResidence.features && newResidence.features.length > 0 ? newResidence.features : ['Tenant Registered'],
        status: 'OCCUPIED'
      });

      createLease({
        propertyId: property.id,
        tenantId: user.id,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
        isActive: true
      });

      setIsRegisterResidenceOpen(false);
      setShowRegistrationSuccess(true);
    };

    if (activeTab === 'manage-residence') {
       if (!myProperty || !myLease) {
         return (
            <div className="flex flex-col items-center justify-center h-96 text-center">
              <div className="bg-gray-100 p-6 rounded-full mb-4"><Home size={40} className="text-gray-400"/></div>
              <h3 className="text-2xl font-bold text-gray-700">No Residence to Manage</h3>
              <p className="text-gray-500 max-w-sm mt-3">You must have an active lease or registered residence to access management features.</p>
            </div>
         );
       }

       const handleUpdateProperty = (e: React.FormEvent) => {
         e.preventDefault();
         if (editPropertyState && myProperty) {
            updateProperty({
                ...myProperty,
                ...editPropertyState,
                id: myProperty.id
            });
            alert("Property details updated successfully!");
         }
       };

       const handleDelist = () => {
         if (window.confirm("Are you sure you want to vacate? This will end your lease immediately.")) {
           terminateLease(myLease.id);
           alert("You have vacated the property. Status updated to AVAILABLE.");
         }
       };

       return (
         <div className="max-w-4xl mx-auto space-y-8">
           <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
             <div className="flex justify-between items-start mb-6">
                <div>
                   <h2 className="text-2xl font-bold text-gray-900">Manage Your Residence</h2>
                   <p className="text-gray-500">Update details or change occupancy status.</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${myProperty.status === 'OCCUPIED' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                   Status: {myProperty.status}
                </div>
             </div>

             <form onSubmit={handleUpdateProperty} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-2">
                   <label className="block text-sm font-medium text-gray-700 mb-2">Property Title / Name</label>
                   <input 
                     className="w-full border p-3 rounded-lg" 
                     defaultValue={myProperty.title}
                     onChange={(e) => setEditPropertyState(prev => ({ ...prev, title: e.target.value }))}
                   />
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                   <input 
                     className="w-full border p-3 rounded-lg" 
                     defaultValue={myProperty.address}
                     onChange={(e) => setEditPropertyState(prev => ({ ...prev, address: e.target.value }))}
                   />
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                   <select 
                     className="w-full border p-3 rounded-lg bg-white"
                     defaultValue={myProperty.city}
                     onChange={(e) => setEditPropertyState(prev => ({ ...prev, city: e.target.value }))}
                   >
                     {KENYAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                   </select>
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">Rent Amount (KES)</label>
                   <input 
                     type="number"
                     className="w-full border p-3 rounded-lg" 
                     defaultValue={myProperty.rentAmount}
                     onChange={(e) => setEditPropertyState(prev => ({ ...prev, rentAmount: parseInt(e.target.value) }))}
                   />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Features (Comma separated)</label>
                    <input 
                      className="w-full border p-3 rounded-lg" 
                      defaultValue={myProperty.features.join(', ')}
                      onChange={(e) => setEditPropertyState(prev => ({ ...prev, features: e.target.value.split(',').map(s => s.trim()) }))}
                    />
                </div>
                <div className="col-span-2 flex justify-end gap-4 mt-4 pt-4 border-t border-gray-100">
                   <button type="submit" className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2 rounded-lg hover:bg-slate-800 transition-colors">
                      <Save size={18} /> Update Details
                   </button>
                </div>
             </form>
           </div>
           <div className="bg-red-50 p-6 rounded-xl border border-red-100">
             <h3 className="text-red-900 font-bold text-lg mb-2 flex items-center gap-2"><AlertCircle size={20}/> Vacate & Delist</h3>
             <p className="text-red-700 mb-4 text-sm">
               Moving out? Use this option to end your lease. The property will be marked as <strong>AVAILABLE</strong> on the platform.
             </p>
             <button 
               onClick={handleDelist}
               className="bg-white border border-red-300 text-red-600 px-4 py-2 rounded-lg font-bold hover:bg-red-600 hover:text-white transition-colors flex items-center gap-2"
             >
               <Trash2 size={18} /> Confirm Vacate
             </button>
           </div>
         </div>
       );
    }

    if (activeTab === 'dashboard') {
      return (
        <div className="space-y-6">
           {!myLease ? (
             <div className="bg-blue-50 border border-blue-200 p-6 rounded-xl">
               <div className="flex justify-between items-center">
                 <div>
                    <h3 className="text-xl font-bold text-blue-800">Welcome, {user.name}!</h3>
                    <p className="text-blue-600 mt-2">You don't have an active lease yet.</p>
                 </div>
                 <button 
                   onClick={() => setIsRegisterResidenceOpen(true)}
                   className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 shadow-md transition-colors"
                 >
                   Register My Residence
                 </button>
               </div>
               
               {isRegisterResidenceOpen && (
                 <div className="mt-6 bg-white p-6 rounded-lg border border-blue-100 shadow-sm animate-in fade-in slide-in-from-top-4">
                   <h4 className="font-bold text-gray-800 mb-4">Register Current Residence</h4>
                   <form onSubmit={handleRegisterResidence} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input 
                        className="border p-2 rounded" 
                        placeholder="Property Name (e.g. Joy Apartments, A4)" 
                        required 
                        value={newResidence.title || ''}
                        onChange={e => setNewResidence({...newResidence, title: e.target.value})}
                      />
                      <input 
                        className="border p-2 rounded" 
                        placeholder="Address / Location" 
                        required 
                        value={newResidence.address || ''}
                        onChange={e => setNewResidence({...newResidence, address: e.target.value})}
                      />
                      <select 
                        className="border p-2 rounded"
                        value={newResidence.city}
                        onChange={e => setNewResidence({...newResidence, city: e.target.value})}
                      >
                        {KENYAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <input 
                        type="number" 
                        className="border p-2 rounded" 
                        placeholder="Monthly Rent (KES)" 
                        required 
                        value={newResidence.rentAmount}
                        onChange={e => setNewResidence({...newResidence, rentAmount: parseInt(e.target.value)})}
                      />
                      <input 
                        type="number" 
                        className="border p-2 rounded" 
                        placeholder="Deposit Amount (KES)" 
                        required 
                        value={newResidence.depositAmount}
                        onChange={e => setNewResidence({...newResidence, depositAmount: parseInt(e.target.value)})}
                      />
                      <input 
                        className="col-span-1 md:col-span-2 border p-2 rounded" 
                        placeholder="Features (comma separated, e.g. WiFi, Water)" 
                        value={newResidence.features?.join(', ') || ''}
                        onChange={e => setNewResidence({...newResidence, features: e.target.value.split(',').map(f => f.trim())})}
                      />
                      <div className="col-span-1 md:col-span-2 flex gap-3">
                        <button type="submit" className="bg-slate-900 text-white px-6 py-2 rounded">Complete Registration</button>
                        <button type="button" onClick={() => setIsRegisterResidenceOpen(false)} className="bg-gray-200 text-gray-700 px-6 py-2 rounded">Cancel</button>
                      </div>
                   </form>
                   <p className="text-xs text-gray-400 mt-3">
                     * This will add the property to the system and assign "Mama Ngina Properties" (Demo Landlord) as the owner.
                   </p>
                 </div>
               )}

               {showRegistrationSuccess && (
                 <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                   <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md animate-in fade-in zoom-in duration-200">
                     <div className="text-center">
                       <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                         <CheckCircle className="h-8 w-8 text-green-600" />
                       </div>
                       <h3 className="text-2xl font-bold text-gray-900">Residence Registered!</h3>
                       <p className="text-gray-500 mt-2">Your property has been successfully added to the system.</p>
                     </div>
                     <div className="mt-6">
                       <button
                         onClick={() => {
                           setShowRegistrationSuccess(false);
                           setNewResidence({ city: 'Nairobi', rentAmount: 15000, depositAmount: 0, features: [] });
                         }}
                         className="w-full bg-slate-900 text-white rounded-xl py-3 font-bold hover:bg-slate-800 transition-colors"
                       >
                         Continue to Dashboard
                       </button>
                     </div>
                   </div>
                 </div>
               )}
             </div>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-kenyaGreen">
                 <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Home size={20}/> Current Residence</h3>
                 <p className="text-xl font-semibold">{myProperty?.title}</p>
                 <p className="text-gray-500">{myProperty?.address}, {myProperty?.city}</p>
                 <div className="mt-2 inline-block bg-gray-100 px-2 py-1 rounded text-xs text-gray-700 font-bold uppercase">{myProperty?.propertyType || 'Residence'}</div>
                 <p className="mt-4 text-kenyaGreen font-bold text-2xl">{formatCurrency(myProperty?.rentAmount || 0)}</p>
               </div>
               <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
                 <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Check size={20}/> Lease Status</h3>
                 <p className="text-gray-600 mb-2">Lease Active</p>
                 <div className="flex items-center gap-2 text-blue-600 font-medium bg-blue-50 p-2 rounded-lg inline-block">
                    Expires: {myLease.endDate}
                 </div>
                 <div className="mt-4">
                    <button 
                      onClick={() => {
                        const landlord = users.find(u => u.id === myProperty?.landlordId);
                        if (landlord && myProperty) {
                           generateLeasePDF(myLease, myProperty, user, landlord);
                        }
                      }}
                      className="text-sm bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-200 transition-colors"
                    >
                      <FileDown size={16}/> Download Agreement
                    </button>
                 </div>
               </div>
             </div>
           )}

           <div className="flex flex-col gap-4 mt-8 mb-4">
              <h3 className="text-xl font-bold">Available Properties in Kenya</h3>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="Search city, name, location..." 
                    className="pl-10 pr-4 py-2 border rounded-lg w-full focus:ring-2 focus:ring-kenyaGreen outline-none text-sm"
                    value={tenantSearchTerm}
                    onChange={(e) => setTenantSearchTerm(e.target.value)}
                  />
                </div>
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${showFilters ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                >
                   <SlidersHorizontal size={18} /> Filters
                   {(priceRange.min !== '' || priceRange.max !== '' || filterType || filterFeatures.length > 0) && (
                     <span className="bg-kenyaRed text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full ml-1">!</span>
                   )}
                </button>
              </div>

              {/* FILTER PANEL */}
              {showFilters && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 animate-in slide-in-from-top-2">
                   <div className="flex justify-between items-start mb-4">
                      <h4 className="font-bold text-gray-800">Advanced Filters</h4>
                      <button onClick={() => {
                          setPriceRange({ min: '', max: '' });
                          setFilterType('');
                          setFilterFeatures([]);
                      }} className="text-xs text-red-600 hover:underline">Reset All</button>
                   </div>
                   
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Price Range */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Price Range (KES)</label>
                        <div className="flex gap-2 items-center">
                           <input 
                             type="number" 
                             placeholder="Min" 
                             className="w-full border p-2 rounded text-sm focus:ring-1 focus:ring-kenyaGreen outline-none"
                             value={priceRange.min}
                             onChange={(e) => setPriceRange({...priceRange, min: e.target.value})}
                           />
                           <span className="text-gray-400">-</span>
                           <input 
                             type="number" 
                             placeholder="Max" 
                             className="w-full border p-2 rounded text-sm focus:ring-1 focus:ring-kenyaGreen outline-none"
                             value={priceRange.max}
                             onChange={(e) => setPriceRange({...priceRange, max: e.target.value})}
                           />
                        </div>
                      </div>

                      {/* Property Type */}
                      <div>
                         <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
                         <select 
                           className="w-full border p-2 rounded text-sm bg-white focus:ring-1 focus:ring-kenyaGreen outline-none"
                           value={filterType}
                           onChange={(e) => setFilterType(e.target.value)}
                         >
                           <option value="">Any Type</option>
                           {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                         </select>
                      </div>

                      {/* Amenities */}
                      <div>
                         <label className="block text-sm font-medium text-gray-700 mb-2">Features & Amenities</label>
                         <div className="grid grid-cols-2 gap-2">
                           {COMMON_FEATURES.map(feat => (
                             <label key={feat} className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                               <input 
                                 type="checkbox" 
                                 className="rounded text-kenyaGreen focus:ring-kenyaGreen"
                                 checked={filterFeatures.includes(feat)}
                                 onChange={(e) => {
                                   if(e.target.checked) setFilterFeatures([...filterFeatures, feat]);
                                   else setFilterFeatures(filterFeatures.filter(f => f !== feat));
                                 }}
                               />
                               {feat}
                             </label>
                           ))}
                         </div>
                      </div>
                   </div>

                   {/* Active Filters Summary */}
                   {(priceRange.min || priceRange.max || filterType || filterFeatures.length > 0) && (
                     <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-2">
                       {priceRange.min && <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs flex items-center gap-1">Min: {priceRange.min}</span>}
                       {priceRange.max && <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs flex items-center gap-1">Max: {priceRange.max}</span>}
                       {filterType && <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs flex items-center gap-1">{filterType} <button onClick={() => setFilterType('')}><X size={12}/></button></span>}
                       {filterFeatures.map(f => (
                         <span key={f} className="bg-green-50 text-green-700 px-2 py-1 rounded text-xs flex items-center gap-1">{f} <button onClick={() => setFilterFeatures(filterFeatures.filter(i => i !== f))}><X size={12}/></button></span>
                       ))}
                     </div>
                   )}
                </div>
              )}
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredProperties.length === 0 ? (
                <div className="col-span-3 text-center py-12 bg-white rounded-xl shadow-sm border border-dashed border-gray-300">
                  <Filter size={32} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-gray-500 font-medium">No properties found matching your criteria.</p>
                  <button onClick={() => {
                     setTenantSearchTerm('');
                     setPriceRange({ min: '', max: '' });
                     setFilterType('');
                     setFilterFeatures([]);
                  }} className="text-sm text-kenyaGreen hover:underline mt-1">Clear all filters</button>
                </div>
              ) : (
                filteredProperties.map(p => (
                  <div key={p.id} className="bg-white rounded-lg shadow overflow-hidden group hover:shadow-md transition-shadow">
                    <div className="relative h-48">
                      <img src={p.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt={p.title} />
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        {p.city}
                      </div>
                      <div className="absolute top-2 left-2 bg-white/90 text-gray-800 text-xs font-bold px-2 py-1 rounded shadow-sm">
                        {p.propertyType || 'Apartment'}
                      </div>
                    </div>
                    <div className="p-4">
                      <h4 className="font-bold text-gray-800">{p.title}</h4>
                      <p className="text-sm text-gray-500 truncate">{p.address}</p>
                      <div className="flex gap-1 mt-2 mb-2 flex-wrap">
                         {p.features.slice(0, 3).map((f, i) => (
                           <span key={i} className="bg-gray-100 text-gray-600 text-[10px] px-1.5 py-0.5 rounded">{f}</span>
                         ))}
                         {p.features.length > 3 && <span className="bg-gray-100 text-gray-600 text-[10px] px-1.5 py-0.5 rounded">+{p.features.length - 3}</span>}
                      </div>
                      <div className="flex justify-between items-end border-t pt-3 border-gray-100 mt-2">
                        <div>
                          <span className="font-bold text-kenyaRed block text-lg">{formatCurrency(p.rentAmount)}</span>
                        </div>
                        {!myLease && (
                          <button 
                            onClick={() => createLease({ propertyId: p.id, tenantId: user.id, startDate: '2023-11-01', endDate: '2024-11-01', isActive: true })}
                            className="text-xs bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors shadow-sm"
                          >
                            Rent Now
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
           </div>
        </div>
      );
    }

    if (activeTab === 'my-lease') {
       if(!myLease) return (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="bg-gray-100 p-4 rounded-full mb-4"><Home size={32} className="text-gray-400"/></div>
          <h3 className="text-lg font-bold text-gray-700">No Active Lease</h3>
          <p className="text-gray-500 max-w-sm mt-2">Please go to the dashboard to rent a property or register your current residence.</p>
        </div>
      );

      const tenantLeaseIds = leases.filter(l => l.tenantId === user.id).map(l => l.id);
      const myPaymentHistory = payments.filter(p => tenantLeaseIds.includes(p.leaseId));
      
      const handlePaymentProcess = async () => {
        setIsProcessingPayment(true);
        // Simulate API call/STK push
        await new Promise(r => setTimeout(r, 3000));
        
        const newPayment = makePayment({ 
            leaseId: myLease.id, 
            amount: myProperty?.rentAmount || 0, 
            date: new Date().toISOString(), 
            type: 'RENT', 
            method: 'MPESA', 
            status: 'COMPLETED', 
            transactionCode: 'QDH' + Math.floor(1000 + Math.random() * 9000) + 'X' + Math.floor(10 + Math.random() * 90)
        });
        
        setIsProcessingPayment(false);
        setShowPaymentConfirm(false);
        setTransactionReceipt(newPayment);
      };

      return (
        <div className="space-y-8 relative">
          {/* Transaction Receipt Modal */}
          {transactionReceipt && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-sm animate-in fade-in zoom-in duration-200">
                <div className="bg-kenyaGreen p-6 text-center text-white relative overflow-hidden">
                   <div className="absolute top-[-20px] left-[-20px] w-20 h-20 bg-white/10 rounded-full"></div>
                   <div className="absolute bottom-[-10px] right-[-10px] w-16 h-16 bg-white/10 rounded-full"></div>
                   <CheckCircle className="mx-auto w-12 h-12 mb-2 text-white" />
                   <h3 className="text-2xl font-bold">Payment Success</h3>
                   <p className="text-green-100 text-sm">Transaction Complete</p>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex justify-between border-b pb-3 border-dashed border-gray-200">
                    <span className="text-gray-500 text-sm">Ref. Code</span>
                    <span className="font-mono font-bold text-gray-800">{transactionReceipt.transactionCode}</span>
                  </div>
                  <div className="flex justify-between border-b pb-3 border-dashed border-gray-200">
                    <span className="text-gray-500 text-sm">Amount Paid</span>
                    <span className="font-bold text-kenyaGreen text-lg">{formatCurrency(transactionReceipt.amount)}</span>
                  </div>
                  <div className="flex justify-between border-b pb-3 border-dashed border-gray-200">
                    <span className="text-gray-500 text-sm">Date</span>
                    <span className="text-gray-800 text-sm">{new Date(transactionReceipt.date).toLocaleString()}</span>
                  </div>
                   <div className="flex justify-between">
                    <span className="text-gray-500 text-sm">Paid To</span>
                    <span className="text-gray-800 text-sm font-medium">Simba Estates Agent</span>
                  </div>
                  <button 
                    onClick={() => setTransactionReceipt(null)}
                    className="w-full bg-slate-900 text-white rounded-xl py-3 font-bold hover:bg-slate-800 transition-colors mt-4"
                  >
                    Close Receipt
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Payment Modal */}
          {showPaymentConfirm && (
             <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
               <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm animate-in fade-in zoom-in duration-200">
                 {!isProcessingPayment ? (
                   <>
                     <div className="text-center mb-6">
                       <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                         <DollarSign size={32} className="text-kenyaGreen" />
                       </div>
                       <h3 className="text-xl font-bold text-gray-900">Confirm Payment</h3>
                       <p className="text-gray-500 mt-2">
                         Initiate MPESA payment of <span className="font-bold text-gray-900">{formatCurrency(myProperty?.rentAmount || 0)}</span>.
                       </p>
                     </div>
                     
                     <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">M-Pesa Phone Number</label>
                        <div className="relative">
                          <Smartphone className="absolute left-3 top-3 text-gray-400" size={18} />
                          <input 
                            value={mpesaNumber} 
                            onChange={(e) => setMpesaNumber(e.target.value)}
                            className="w-full border pl-10 pr-4 py-2.5 rounded-lg focus:ring-2 focus:ring-kenyaGreen outline-none font-medium"
                            placeholder="07..."
                          />
                        </div>
                     </div>

                     <div className="flex flex-col gap-3">
                       <button 
                         onClick={handlePaymentProcess}
                         className="w-full bg-kenyaGreen hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-green-200"
                       >
                         Pay Now
                       </button>
                       <button 
                         onClick={() => setShowPaymentConfirm(false)}
                         className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl transition-all"
                       >
                         Cancel
                       </button>
                     </div>
                   </>
                 ) : (
                   <div className="text-center py-8">
                      <div className="w-16 h-16 border-4 border-green-200 border-t-kenyaGreen rounded-full animate-spin mx-auto mb-4"></div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">Sending STK Push...</h3>
                      <p className="text-sm text-gray-500 max-w-[200px] mx-auto">Please check your phone <span className="font-mono text-gray-800">{mpesaNumber}</span> and enter your M-Pesa PIN.</p>
                   </div>
                 )}
               </div>
             </div>
           )}

          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-8 border-b border-gray-100">
                <div>
                   <h2 className="text-2xl font-bold text-gray-900">Monthly Rent</h2>
                   <p className="text-gray-500">Due Date: 5th of every month</p>
                </div>
                <div className="mt-4 md:mt-0 text-right">
                    <p className="text-sm text-gray-500 mb-1">Total Amount Due</p>
                    <p className="text-4xl font-bold text-kenyaRed">{formatCurrency(myProperty?.rentAmount || 0)}</p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                    <div className="border rounded-xl p-4 flex items-center gap-4 bg-gray-50 border-green-200 cursor-pointer hover:border-green-500 transition-colors">
                        <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">M</div>
                        <div>
                            <p className="font-bold text-gray-900">M-PESA</p>
                            <p className="text-xs text-gray-500">Lipan Na M-Pesa (Till: 505050)</p>
                        </div>
                        <div className="ml-auto">
                           <div className="w-5 h-5 rounded-full border-2 border-green-600 flex items-center justify-center">
                               <div className="w-2.5 h-2.5 rounded-full bg-green-600"></div>
                           </div>
                        </div>
                    </div>

                    <div className="mt-6">
                       <button 
                         onClick={() => {
                           const landlord = users.find(u => u.id === myProperty?.landlordId);
                           if (landlord && myProperty) {
                              generateLeasePDF(myLease, myProperty, user, landlord);
                           }
                         }}
                         className="w-full bg-blue-50 text-blue-700 py-3 rounded-xl font-bold hover:bg-blue-100 transition-colors flex items-center justify-center gap-2 border border-blue-200"
                       >
                         <FileDown size={20} /> Download Lease Agreement
                       </button>
                    </div>
                </div>

                <div className="flex flex-col justify-end">
                     <button 
                        onClick={() => setShowPaymentConfirm(true)}
                        className="w-full bg-slate-900 text-white text-lg py-4 rounded-xl font-bold hover:bg-slate-800 shadow-lg transform hover:-translate-y-1 transition-all flex items-center justify-center gap-3"
                      >
                        <DollarSign size={24} />
                        Pay Rent
                      </button>
                      <p className="text-xs text-center text-gray-400 mt-3 flex items-center justify-center gap-1">
                        <AlertCircle size={12} /> Secure transaction via MPESA Daraja API
                      </p>
                </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
               <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2"><Clock size={20}/> Recent Transactions</h3>
            </div>
            <table className="w-full text-left text-sm">
               <thead className="bg-gray-50">
                 <tr>
                   <th className="p-4 text-gray-600 font-medium">Date</th>
                   <th className="p-4 text-gray-600 font-medium">Type</th>
                   <th className="p-4 text-gray-600 font-medium">Code</th>
                   <th className="p-4 text-gray-600 font-medium text-right">Amount</th>
                   <th className="p-4 text-gray-600 font-medium text-center">Status</th>
                 </tr>
               </thead>
               <tbody>
                 {myPaymentHistory.length === 0 ? (
                    <tr><td colSpan={5} className="p-6 text-center text-gray-400 italic">No past transactions found.</td></tr>
                 ) : (
                    myPaymentHistory.map(pay => (
                      <tr key={pay.id} className="border-b last:border-0 hover:bg-gray-50">
                         <td className="p-4">{new Date(pay.date).toLocaleDateString()}</td>
                         <td className="p-4"><span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs font-bold uppercase">{pay.type}</span></td>
                         <td className="p-4 font-mono text-gray-500">{pay.transactionCode}</td>
                         <td className="p-4 text-right font-bold text-gray-900">{formatCurrency(pay.amount)}</td>
                         <td className="p-4 text-center">
                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold">Success</span>
                         </td>
                      </tr>
                    ))
                 )}
               </tbody>
            </table>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-xl font-bold mb-4">Report Maintenance Issue</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              reportIssue({
                propertyId: myLease.propertyId,
                tenantId: user.id,
                description: formData.get('desc') as string,
                priority: (formData.get('priority') as any) || 'MEDIUM',
                status: 'PENDING',
                dateReported: new Date().toISOString()
              });
              (e.target as HTMLFormElement).reset();
              alert("Maintenance request submitted to Landlord.");
            }}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Issue Description</label>
                <textarea name="desc" className="w-full border p-3 rounded-lg" placeholder="Describe the issue (e.g. leaking tap)..." required></textarea>
              </div>
              <div className="mb-4">
                 <label className="block text-sm font-medium text-gray-700 mb-1">Priority Level</label>
                 <select name="priority" className="w-full border p-3 rounded-lg bg-white">
                   <option value="LOW">Low - Can wait a few days</option>
                   <option value="MEDIUM">Medium - Needs attention soon</option>
                   <option value="HIGH">High - Urgent / Emergency</option>
                 </select>
              </div>
              <button className="bg-slate-900 text-white px-4 py-2 rounded font-medium hover:bg-slate-800 transition-colors">Submit Request</button>
            </form>
          </div>
        </div>
      )
    }
  }

  // --- ADMIN VIEWS ---
  if (user?.role === UserRole.ADMIN) {
     if (activeTab === 'dashboard') {
       return (
          <div className="space-y-6">
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Total Users" value={users.length.toString()} color="text-slate-800" />
                <StatCard label="Properties" value={properties.length.toString()} color="text-slate-800" />
                <StatCard label="Active Leases" value={leases.length.toString()} color="text-slate-800" />
                <StatCard label="System Revenue" value={formatCurrency(payments.reduce((a,b) => a+b.amount, 0))} color="text-slate-800" />
             </div>
             <div className="bg-white p-8 rounded-xl shadow-sm text-center py-12">
               <h3 className="text-gray-400">Select "User Management" to handle registrations.</h3>
             </div>
          </div>
       );
     }
     
     if (activeTab === 'users') {
        const pendingLandlords = users.filter(u => u.role === UserRole.LANDLORD && u.status === 'PENDING');
       const otherUsers = users.filter(u => !(u.role === UserRole.LANDLORD && u.status === 'PENDING'));

       return (
         <div className="space-y-8">
           <div className="bg-white p-6 rounded-xl shadow-sm border border-orange-100">
             <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-orange-800">
               <AlertCircle size={20} /> Pending Landlord Approvals
             </h3>
             {pendingLandlords.length === 0 ? (
               <p className="text-gray-500 italic">No pending requests at this time.</p>
             ) : (
               <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-orange-50">
                      <tr>
                        <th className="p-3 text-orange-800">Name</th>
                        <th className="p-3 text-orange-800">Email</th>
                        <th className="p-3 text-orange-800">Phone</th>
                        <th className="p-3 text-orange-800 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingLandlords.map(u => (
                        <tr key={u.id} className="border-b border-orange-100">
                          <td className="p-3 font-medium">{u.name}</td>
                          <td className="p-3">{u.email}</td>
                          <td className="p-3">{u.phone}</td>
                          <td className="p-3 text-right flex justify-end gap-2">
                            <button 
                              onClick={() => updateUserStatus(u.id, 'APPROVED')}
                              className="bg-green-600 text-white px-3 py-1 rounded text-xs font-bold hover:bg-green-700 transition-colors flex items-center gap-1"
                            >
                              <CheckCircle size={14}/> Approve
                            </button>
                            <button 
                              onClick={() => updateUserStatus(u.id, 'REJECTED')}
                              className="bg-red-600 text-white px-3 py-1 rounded text-xs font-bold hover:bg-red-700 transition-colors flex items-center gap-1"
                            >
                              <XCircle size={14}/> Reject
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
               </div>
             )}
           </div>

           <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-bold mb-4">All Registered Users</h3>
              <table className="w-full text-left text-sm">
                 <thead className="bg-gray-50 border-b">
                   <tr>
                     <th className="p-3">Name</th>
                     <th className="p-3">Role</th>
                     <th className="p-3">Status</th>
                     <th className="p-3">Email</th>
                     <th className="p-3">Actions</th>
                   </tr>
                 </thead>
                 <tbody>
                   {otherUsers.map(u => (
                     <tr key={u.id} className="border-b hover:bg-gray-50">
                       <td className="p-3">{u.name}</td>
                       <td className="p-3"><span className={`px-2 py-0.5 rounded text-xs font-bold ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : u.role === 'LANDLORD' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>{u.role}</span></td>
                       <td className="p-3">
                         <span className={`px-2 py-0.5 rounded text-xs font-bold ${u.status === 'APPROVED' ? 'bg-green-100 text-green-700' : u.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                           {u.status}
                         </span>
                       </td>
                       <td className="p-3">{u.email}</td>
                       <td className="p-3">
                         {u.status === 'REJECTED' && (
                           <button onClick={() => updateUserStatus(u.id, 'APPROVED')} className="text-xs text-blue-600 hover:underline">Re-activate</button>
                         )}
                         {u.status === 'APPROVED' && u.role !== 'ADMIN' && (
                           <button onClick={() => updateUserStatus(u.id, 'REJECTED')} className="text-xs text-red-600 hover:underline">Suspend</button>
                         )}
                       </td>
                     </tr>
                   ))}
                 </tbody>
              </table>
           </div>
         </div>
       );
     }

     if (activeTab === 'all-properties') {
       return (
         <div className="bg-white p-6 rounded-xl shadow-sm">
           <h3 className="text-lg font-bold mb-4">All Listed Properties</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             {properties.map(p => (
               <div key={p.id} className="border rounded-lg p-4">
                 <h4 className="font-bold">{p.title}</h4>
                 <p className="text-sm text-gray-500">{p.address}</p>
                 <div className="mt-2 flex justify-between items-center">
                    <span className="text-kenyaRed font-bold">{formatCurrency(p.rentAmount)}</span>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">{p.status}</span>
                 </div>
               </div>
             ))}
           </div>
         </div>
       );
     }
     
     if (activeTab === 'payments-overview') {
        const filteredPayments = payments.filter(p => {
          const matchesType = paymentFilterType === 'ALL' || p.type === paymentFilterType;
          const matchesDate = !paymentFilterDate || p.date.startsWith(paymentFilterDate);
          return matchesType && matchesDate;
        });

        const totalRevenue = filteredPayments.reduce((sum, p) => sum + p.amount, 0);

        return (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-end gap-4 bg-white p-6 rounded-xl shadow-sm">
              <div>
                <h2 className="text-xl font-bold text-gray-800">System Financials</h2>
                <p className="text-gray-500 text-sm">Overview of all rent and deposit collections.</p>
              </div>
              <div className="flex gap-3">
                 <div className="relative">
                   <Calendar className="absolute left-3 top-2.5 text-gray-400" size={16} />
                   <input 
                     type="date" 
                     className="pl-9 pr-4 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-kenyaGreen"
                     value={paymentFilterDate}
                     onChange={(e) => setPaymentFilterDate(e.target.value)}
                   />
                 </div>
                 <div className="relative">
                   <Filter className="absolute left-3 top-2.5 text-gray-400" size={16} />
                   <select 
                     className="pl-9 pr-8 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-kenyaGreen bg-white appearance-none"
                     value={paymentFilterType}
                     onChange={(e) => setPaymentFilterType(e.target.value)}
                   >
                     <option value="ALL">All Types</option>
                     <option value="RENT">Rent Only</option>
                     <option value="DEPOSIT">Deposit Only</option>
                   </select>
                 </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg">
                 <p className="text-slate-400 text-sm mb-1">Total Revenue (Filtered)</p>
                 <p className="text-3xl font-bold text-kenyaGreen">{formatCurrency(totalRevenue)}</p>
               </div>
               <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                 <p className="text-gray-500 text-sm mb-1">Transaction Count</p>
                 <p className="text-3xl font-bold text-gray-800">{filteredPayments.length}</p>
               </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
               <div className="p-4 border-b bg-gray-50 font-bold text-gray-700 flex justify-between">
                 <span>Transaction Log</span>
                 <span className="text-xs font-normal text-gray-500 bg-gray-200 px-2 py-1 rounded">Showing {filteredPayments.length} records</span>
               </div>
               <div className="overflow-x-auto">
                 <table className="w-full text-left text-sm">
                   <thead>
                     <tr className="border-b">
                       <th className="p-4 text-gray-600 font-medium">Date</th>
                       <th className="p-4 text-gray-600 font-medium">Tenant</th>
                       <th className="p-4 text-gray-600 font-medium">Property Details</th>
                       <th className="p-4 text-gray-600 font-medium">Landlord</th>
                       <th className="p-4 text-gray-600 font-medium">Type</th>
                       <th className="p-4 text-gray-600 font-medium">Ref Code</th>
                       <th className="p-4 text-gray-600 font-medium text-right">Amount</th>
                     </tr>
                   </thead>
                   <tbody>
                     {filteredPayments.length === 0 ? (
                       <tr><td colSpan={7} className="p-8 text-center text-gray-500">No records found matching your filters.</td></tr>
                     ) : (
                       filteredPayments.map(pay => {
                         const lease = leases.find(l => l.id === pay.leaseId);
                         const tenant = users.find(u => u.id === lease?.tenantId);
                         const property = properties.find(p => p.id === lease?.propertyId);
                         const landlord = users.find(u => u.id === property?.landlordId);

                         return (
                           <tr key={pay.id} className="border-b hover:bg-gray-50 transition-colors">
                             <td className="p-4 text-gray-500 whitespace-nowrap">{new Date(pay.date).toLocaleDateString()}</td>
                             <td className="p-4 font-medium text-gray-900">{tenant?.name || 'Unknown'}</td>
                             <td className="p-4">
                               <div className="font-medium text-gray-800">{property?.title}</div>
                               <div className="text-xs text-gray-500">{property?.city}</div>
                             </td>
                             <td className="p-4 text-gray-600">{landlord?.name || 'Unknown'}</td>
                             <td className="p-4">
                               <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${pay.type === 'RENT' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'}`}>
                                 {pay.type}
                               </span>
                             </td>
                             <td className="p-4 font-mono text-gray-500">{pay.transactionCode}</td>
                             <td className="p-4 text-right font-bold text-gray-900">{formatCurrency(pay.amount)}</td>
                           </tr>
                         );
                       })
                     )}
                   </tbody>
                 </table>
               </div>
            </div>
          </div>
        );
     }
  }

  return <div>Access Denied or Unknown Role</div>;
};