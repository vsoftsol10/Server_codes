import { CheckCircle, XCircle, Clock } from 'lucide-react';

const EmployeeRequestTab = ({ requests }) => {
  const getStatusBadge = (status) => {
    const statusConfig = {
      APPROVED: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      REJECTED: { color: 'bg-red-100 text-red-800', icon: XCircle },
      PENDING: { color: 'bg-yellow-100 text-yellow-800', icon: Clock }
    };
    
    const config = statusConfig[status] || statusConfig.PENDING;
    const Icon = config.icon;
    
    return (
      <span className={`px-3 py-1 text-xs font-medium rounded-full ${config.color} flex items-center gap-1 w-fit`}>
        <Icon className="w-3 h-3" />
        {status === 'PENDING' ? 'Pending' : status === 'APPROVED' ? 'Approved' : 'Rejected'}
      </span>
    );
  };

  const getRequestTypeLabel = (type) => {
    switch(type) {
      case 'GLOBAL':
        return 'Global Material';
      case 'PROJECT':
        return 'Project-Specific Material';
      case 'PROJECT_MATERIAL':
        return 'Add Material to Project';
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">My Material Requests</h3>
        
        <div className="space-y-4">
          {requests.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No requests submitted yet</p>
            </div>
          ) : (
            requests.map(request => (
              <div key={request.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-gray-900">{request.name}</h4>
                      {getStatusBadge(request.status)}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Type:</span>
                        <p className="font-medium text-gray-900">
                          {getRequestTypeLabel(request.type)}
                        </p>
                      </div>
                      
                      {request.projectName && (
                        <div>
                          <span className="text-gray-500">Project:</span>
                          <p className="font-medium text-gray-900">{request.projectName}</p>
                        </div>
                      )}
                      
                      <div>
                        <span className="text-gray-500">Category:</span>
                        <p className="font-medium text-gray-900">{request.category}</p>
                      </div>
                      
                      <div>
                        <span className="text-gray-500">Price:</span>
                        <p className="font-medium text-gray-900">₹{request.defaultRate}/{request.unit}</p>
                      </div>
                      
                      {request.quantity && (
                        <div>
                          <span className="text-gray-500">Quantity:</span>
                          <p className="font-medium text-gray-900">{request.quantity} {request.unit}</p>
                        </div>
                      )}
                      
                      <div>
                        <span className="text-gray-500">Requested:</span>
                        <p className="font-medium text-gray-900">
                          {new Date(request.requestDate).toLocaleDateString()}
                        </p>
                      </div>
                      
                      {request.reviewDate && (
                        <div>
                          <span className="text-gray-500">Reviewed:</span>
                          <p className="font-medium text-gray-900">
                            {new Date(request.reviewDate).toLocaleDateString()}
                          </p>
                        </div>
                      )}

                      {request.vendor && (
                        <div>
                          <span className="text-gray-500">Vendor:</span>
                          <p className="font-medium text-gray-900">{request.vendor}</p>
                        </div>
                      )}
                    </div>

                    {request.description && (
                      <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded">
                        <p className="text-sm text-gray-700">
                          <span className="font-semibold">Description:</span> {request.description}
                        </p>
                      </div>
                    )}

                    {request.rejectionReason && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                        <p className="text-sm text-red-800">
                          <span className="font-semibold">Rejection Reason:</span> {request.rejectionReason}
                        </p>
                      </div>
                    )}

                    {request.approvalNotes && (
                      <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
                        <p className="text-sm text-green-800">
                          <span className="font-semibold">Approval Notes:</span> {request.approvalNotes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeRequestTab;