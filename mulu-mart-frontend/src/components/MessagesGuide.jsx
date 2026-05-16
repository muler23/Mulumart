import React from 'react';
import { ChatBubbleLeftRightIcon, PhoneIcon, UserIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

const MessagesGuide = () => {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="bg-blue-600 text-white rounded-full p-2">
            <ChatBubbleLeftRightIcon className="h-6 w-6" />
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">How to Use Messages</h3>
          
          <div className="space-y-3 text-sm text-blue-800">
            <div className="flex items-start space-x-2">
              <span className="font-medium text-blue-600">1. View Messages:</span>
              <span>Click the <strong className="text-blue-900">Messages</strong> button in the top navigation to see all conversations</span>
            </div>
            
            <div className="flex items-start space-x-2">
              <span className="font-medium text-blue-600">2. Find Buyers:</span>
              <span>All conversations with potential buyers appear in your messages list</span>
            </div>
            
            <div className="flex items-start space-x-2">
              <span className="font-medium text-blue-600">3. Click Chat:</span>
              <span>Click the <strong className="text-blue-900">Chat</strong> button on any conversation to reply</span>
            </div>
            
            <div className="flex items-start space-x-2">
              <span className="font-medium text-blue-600">4. Real-time:</span>
              <span>Messages appear instantly when buyers reply - no refresh needed!</span>
            </div>
            
            <div className="flex items-start space-x-2">
              <span className="font-medium text-blue-600">5. Contact Options:</span>
              <span>Use <strong className="text-blue-900">Call</strong> or <strong className="text-blue-900">Email</strong> buttons for direct contact</span>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-100 rounded-lg">
            <p className="text-xs font-medium text-blue-700">
              <strong>💡 Pro Tip:</strong> Respond quickly to buyer messages to increase your chances of making a sale!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesGuide;
