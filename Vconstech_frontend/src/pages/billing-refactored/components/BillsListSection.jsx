import React from 'react';
import { FileText, Eye, Pencil, Trash2, Search, Filter, X } from 'lucide-react';

const BillsListSection = ({
  activeSection,
  setActiveSection,
  bills,
  loading,
  searchTerm,
  setSearchTerm,
  dateFilter,
  setDateFilter,
  customDateRange,
  setCustomDateRange,
  showFilterDropdown,
  setShowFilterDropdown,
  handlePrintBill,
  handleEditBill,
  handleDeleteBill,
  handleUpdateStatus,
}) => {
  
  // Helper function for status colors
  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'open':
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  // Filter bills based on active section and search
  const filteredBills = bills.filter(bill => {
    // Filter by section
    let sectionMatch = true;
    if (activeSection === 'invoice') {
      sectionMatch = bill.billType === 'invoice' && bill.status !== 'draft';
    } else if (activeSection === 'quotation') {
      sectionMatch = bill.billType === 'quotation' && bill.status !== 'draft';
    } else if (activeSection === 'draft') {
      sectionMatch = bill.status === 'draft';
    }

    // Filter by search term
    const searchMatch = searchTerm === '' || 
      (bill.billNumber && bill.billNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (bill.clientName && bill.clientName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (bill.projectName && bill.projectName.toLowerCase().includes(searchTerm.toLowerCase()));

    // Filter by date
    let dateMatch = true;
    if (dateFilter !== 'all') {
      const billDate = new Date(bill.billDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (dateFilter === 'today') {
        dateMatch = billDate.toDateString() === today.toDateString();
      } else if (dateFilter === 'week') {
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        dateMatch = billDate >= weekAgo;
      } else if (dateFilter === 'month') {
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        dateMatch = billDate >= monthAgo;
      } else if (dateFilter === 'custom' && customDateRange.start && customDateRange.end) {
        const startDate = new Date(customDateRange.start);
        const endDate = new Date(customDateRange.end);
        dateMatch = billDate >= startDate && billDate <= endDate;
      }
    }

    return sectionMatch && searchMatch && dateMatch;
  });

  return (
    <div className="bg-white rounded-lg shadow-md mb-6">
      {/* Section Tabs */}
      <div className="border-b border-gray-200 px-6">
        <div className="flex space-x-8">
          {['all', 'invoice', 'quotation', 'draft'].map(section => (
            <button
              key={section}
              onClick={() => setActiveSection(section)}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeSection === section
                  ? 'border-[#ffbe2a] text-[#ffbe2a]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {section.charAt(0).toUpperCase() + section.slice(1)}
              <span className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded-full">
                {section === 'all' 
                  ? bills.length 
                  : section === 'invoice'
                  ? bills.filter(b => b.billType === 'invoice' && b.status !== 'draft').length
                  : section === 'quotation'
                  ? bills.filter(b => b.billType === 'quotation' && b.status !== 'draft').length
                  : bills.filter(b => b.status === 'draft').length
                }
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search Box */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by bill number, client name, or project..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffbe2a] focus:border-transparent outline-none"
            />
          </div>

          {/* Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                {dateFilter === 'all' ? 'All Time' :
                 dateFilter === 'today' ? 'Today' :
                 dateFilter === 'week' ? 'This Week' :
                 dateFilter === 'month' ? 'This Month' :
                 'Custom Range'}
              </span>
            </button>

            {showFilterDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <div className="py-1">
                  <button
                    onClick={() => {
                      setDateFilter('all');
                      setShowFilterDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    All Time
                  </button>
                  <button
                    onClick={() => {
                      setDateFilter('today');
                      setShowFilterDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    Today
                  </button>
                  <button
                    onClick={() => {
                      setDateFilter('week');
                      setShowFilterDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    This Week
                  </button>
                  <button
                    onClick={() => {
                      setDateFilter('month');
                      setShowFilterDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    This Month
                  </button>
                  <button
                    onClick={() => {
                      setDateFilter('custom');
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 border-t"
                  >
                    Custom Range
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Custom Date Range Inputs */}
        {dateFilter === 'custom' && (
          <div className="flex gap-4 mt-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
              <input
                type="date"
                value={customDateRange.start}
                onChange={(e) => setCustomDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffbe2a] focus:border-transparent outline-none"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
              <input
                type="date"
                value={customDateRange.end}
                onChange={(e) => setCustomDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffbe2a] focus:border-transparent outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Bills Content */}
      <div className="p-6">
        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Loading bills...</p>
          </div>
        ) : filteredBills.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              No {activeSection === 'all' ? 'bills' : activeSection === 'draft' ? 'drafts' : activeSection + 's'} found
            </p>
            <p className="text-gray-400 text-sm mt-2">
              {searchTerm ? 'Try a different search term' : `Create your first ${activeSection === 'all' ? 'bill' : activeSection} using the form above`}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bill #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBills.map((bill) => {
                  const items = Array.isArray(bill?.BillItem) ? bill.BillItem : 
                                Array.isArray(bill?.items) ? bill.items : [];

                  const subtotal = items.reduce(
                    (sum, item) => sum + Number(item?.amount || 0),
                    0
                  );

                  const grossAmount =
                    subtotal +
                    Number(bill?.labourCharges || 0) +
                    Number(bill?.transportCharges || 0) +
                    Number(bill?.otherCharges || 0);

                  const cgstPercent = Number(bill?.cgstPercent || bill?.cgst || 0);
                  const sgstPercent = Number(bill?.sgstPercent || bill?.sgst || 0);
                  const igstPercent = Number(bill?.igstPercent || bill?.igst || 0);
                  const tdsPercent = Number(bill?.tdsPercent || bill?.tds || 0);
                  const retentionPercent = Number(bill?.retentionPercent || bill?.retention || 0);

                  const cgst = (grossAmount * cgstPercent) / 100;
                  const sgst = (grossAmount * sgstPercent) / 100;
                  const igst = (grossAmount * igstPercent) / 100;

                  const totalWithTax = grossAmount + cgst + sgst + igst;

                  const tds = (totalWithTax * tdsPercent) / 100;
                  const retention = (totalWithTax * retentionPercent) / 100;

                  const netPayable =
                    totalWithTax -
                    tds -
                    retention -
                    Number(bill?.advancePaid || 0) +
                    Number(bill?.previousBills || 0);

                  const billId = bill._id || bill.id;
                  const billNumber = bill.billId || bill.billNumber || 'N/A';
                  const billType = bill.billType || 'invoice';

                  return (
                    <tr key={billId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          ₹ {netPayable.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={bill.status || 'open'}
                          onChange={(e) => handleUpdateStatus(billId, e.target.value)}
                          className={`text-xs font-semibold px-3 py-1 rounded-full border-0 cursor-pointer ${getStatusColor(bill.status || 'open')}`}
                        >
                          <option value="open">Open</option>
                          <option value="sent">Sent</option>
                          <option value="paid">Paid</option>
                          <option value="draft">Draft</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{billNumber}</div>
                        <div className="text-xs text-gray-500">
                          {billType === 'quotation' ? 'Quotation' : 'Invoice'} • by {bill.companyName || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{bill.clientName || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(bill.billDate).toLocaleDateString('en-IN', { 
                            day: '2-digit', 
                            month: 'short', 
                            year: 'numeric' 
                          })}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(bill.createdAt || bill.billDate).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handlePrintBill(bill)}
                            className="text-gray-600 hover:text-gray-900"
                            title="View"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleEditBill(bill)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit"
                          >
                            <Pencil className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteBill(billId)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default BillsListSection;