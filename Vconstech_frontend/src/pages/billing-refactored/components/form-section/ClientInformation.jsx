import React from 'react'
import { User, Phone } from 'lucide-react'

const ClientInformation = ({
  formData,
  handleInputChange,
  handleClientNameChange,
  selectClient,
  clientSuggestions,
  showClientSuggestions,
  setShowClientSuggestions,
  setShowClientModal
}) => {
  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row gap-3 mb-4 items-start sm:items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800 pb-2 border-b-2 border-[#ffbe2a]">
          Client Information
        </h2>
        <button 
          onClick={() => setShowClientModal(true)}
          className="text-sm font-semibold text-white bg-[#ffbe2a] px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
        >
          + Add New Client
        </button>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="relative">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Client Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              name="clientName"
              value={formData.clientName}
              onChange={handleClientNameChange}
              onFocus={() => formData.clientName && setShowClientSuggestions(true)}
              onBlur={() => setTimeout(() => setShowClientSuggestions(false), 200)}
              placeholder="Start typing client name..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffbe2a] focus:border-transparent outline-none"
              required
            />
          </div>
          
          {/* Client Suggestions Dropdown */}
          {showClientSuggestions && clientSuggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {clientSuggestions.map((client, index) => (
                <div
                  key={index}
                  onClick={() => selectClient(client)}
                  className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                >
                  <div className="font-semibold text-gray-800">{client.clientName}</div>
                  {client.clientPhone && (
                    <div className="text-sm text-gray-600">{client.clientPhone}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Client GST Number
          </label>
          <input
            type="text"
            name="clientGST"
            value={formData.clientGST}
            onChange={handleInputChange}
            placeholder="29XXXXXXXXXXXXX"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffbe2a] focus:border-transparent outline-none"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Client Address
          </label>
          <textarea
            name="clientAddress"
            value={formData.clientAddress}
            onChange={handleInputChange}
            rows="2"
            placeholder="Client Address"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffbe2a] focus:border-transparent outline-none resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Client Phone
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="tel"
              name="clientPhone"
              value={formData.clientPhone}
              onChange={handleInputChange}
              placeholder="+91 XXXXX XXXXX"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffbe2a] focus:border-transparent outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Client Email
          </label>
          <input
            type="email"
            name="clientEmail"
            value={formData.clientEmail}
            onChange={handleInputChange}
            placeholder="client@example.com"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffbe2a] focus:border-transparent outline-none"
          />
        </div>
      </div>
    </div>
  )
}

export default ClientInformation