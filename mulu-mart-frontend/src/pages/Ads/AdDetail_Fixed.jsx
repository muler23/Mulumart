// This file contains the corrected sections for AdDetail.jsx to fix the sellerName undefined error

// Fixed Chat Header Section (lines 669-702)
const FixedChatHeader = () => {
  const { sellerName, sellerEmail, sellerPhone, sellerProfileImage } = getSellerInfo();
  
  return (
    <div className="bg-primary-600 text-white p-4 rounded-t-lg flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
          {sellerProfileImage ? (
            <img
              src={sellerProfileImage}
              alt={sellerName}
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            <span className="text-white font-medium text-sm">
              {sellerName?.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div>
          <h4 className="font-semibold">{sellerName}</h4>
          <div className="text-sm opacity-90">
            {/* Seller Contact Info */}
            {sellerEmail && (
              <div className="flex items-center space-x-2">
                <EnvelopeIcon className="h-4 w-4 text-white/80" />
                <span className="text-xs">{sellerEmail}</span>
              </div>
            )}
            {sellerPhone && (
              <div className="flex items-center space-x-2">
                <PhoneIcon className="h-4 w-4 text-white/80" />
                <span className="text-xs">{sellerPhone}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Fixed Sidebar Seller Info Section (lines 622-640)
const FixedSidebarSellerInfo = () => {
  const { sellerName, sellerEmail, sellerPhone } = getSellerInfo();
  
  return (
    <div className="text-center mb-4">
      <h4 className="font-semibold text-gray-900">Seller Information</h4>
      <p className="text-sm text-gray-600">
        {sellerName || 'Not provided'}
      </p>
      {sellerPhone && (
        <p className="text-sm text-gray-600">
          <PhoneIcon className="h-4 w-4 inline mr-1" />
          {sellerPhone}
        </p>
      )}
      {sellerEmail && (
        <p className="text-sm text-gray-600">
          <EnvelopeIcon className="h-4 w-4 inline mr-1" />
          {sellerEmail}
        </p>
      )}
    </div>
  );
};

// Fixed Chat Message Section (line 722)
const FixedChatMessage = () => {
  const { sellerName } = getSellerInfo();
  
  return (
    <p className="text-gray-600 text-sm">Send a message to {sellerName}</p>
  );
};

console.log('Fixed sections created successfully!');
