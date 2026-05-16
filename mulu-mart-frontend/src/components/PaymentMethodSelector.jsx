import React, { useState } from 'react';
import { 
  PhoneIcon, 
  BuildingLibraryIcon,
  CheckCircleIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline';

const PaymentMethodSelector = ({ 
  selectedMethod, 
  onMethodSelect, 
  accountNumber, 
  onAccountNumberChange,
  errors = {}
}) => {
  const paymentMethods = [
    {
      id: 'telebirr',
      name: 'Telebirr',
      icon: PhoneIcon,
      color: 'bg-green-500',
      placeholder: '09xxxxxxxx',
      description: 'Pay with Telebirr mobile money',
      logo: 'https://play-lh.googleusercontent.com/Mtnybz6w7FMdzdQUbc7PWN3_0iLw3t9lUkwjmAa_usFCZ60zS0Xs8o00BW31JDCkAiQk=w480-h960-rw'
    },
    {
      id: 'cbe',
      name: 'Commercial Bank of Ethiopia',
      icon: BuildingLibraryIcon,
      color: 'bg-blue-600',
      placeholder: '1000xxxxxxxxxx',
      description: 'Pay with CBE mobile banking',
      logo: 'https://images.seeklogo.com/logo-png/54/1/commercial-bank-of-ethiopia-logo-png_seeklogo-547506.png'
    },
    {
      id: 'abyssinia',
      name: 'Bank of Abyssinia',
      icon: CreditCardIcon,
      color: 'bg-purple-600',
      placeholder: '1000xxxxxxxxxx',
      description: 'Pay with Bank of Abyssinia',
      logo: 'https://ethiopianlogos.com/logos/bank_of_abyssinia/bank_of_abyssinia.png'
    },
    {
      id: 'awash',
      name: 'Awash Bank',
      icon: BuildingLibraryIcon,
      color: 'bg-orange-500',
      placeholder: '1000xxxxxxxxxx',
      description: 'Pay with Awash Bank mobile banking',
      logo: 'https://ethiopianlogos.com/logos/awash_international_bank/awash_international_bank.png'
    },
    {
      id: 'zemen',
      name: 'Zemen Bank',
      icon: BuildingLibraryIcon,
      color: 'bg-teal-600',
      placeholder: '1000xxxxxxxxxx',
      description: 'Pay with Zemen Bank',
      logo: 'https://ethiopianlogos.com/logos/zemen_bank/zemen_bank.png'
    },
    {
      id: 'dashen',
      name: 'Dashen Bank',
      icon: BuildingLibraryIcon,
      color: 'bg-indigo-600',
      placeholder: '1000xxxxxxxxxx',
      description: 'Pay with Dashen Bank',
      logo: 'https://ethiopianlogos.com/logos/dashen_bank/dashen_bank.png'
    }
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Select Payment Method</h3>
      
      {/* Payment Method Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {paymentMethods.map((method) => {
          const Icon = method.icon;
          const isSelected = selectedMethod === method.id;
          
          return (
            <button
              key={method.id}
              onClick={() => onMethodSelect(method.id)}
              className={`
                relative p-4 border-2 rounded-lg transition-all duration-200
                ${isSelected 
                  ? 'border-primary-500 bg-primary-50 shadow-md' 
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                }
              `}
            >
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <CheckCircleIcon className="h-5 w-5 text-primary-600" />
                </div>
              )}
              
              <div className="flex items-center space-x-3">
                {method.logo ? (
                  <img
                    src={method.logo}
                    alt={method.name}
                    className="h-16 w-16 object-contain"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextElementSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className={`p-2 rounded-lg ${method.color}`} style={{ display: method.logo ? 'none' : 'flex' }}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="text-left flex-1">
                  <div className="font-medium text-gray-900">{method.name}</div>
                  <div className="text-sm text-gray-600">{method.description}</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Account Number Input */}
      {selectedMethod && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            {paymentMethods.find(m => m.id === selectedMethod)?.name} Account Number
          </label>
          <input
            type="text"
            value={accountNumber}
            onChange={(e) => onAccountNumberChange(e.target.value)}
            placeholder={paymentMethods.find(m => m.id === selectedMethod)?.placeholder}
            className={`
              w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent
              ${errors.accountNumber ? 'border-red-300' : 'border-gray-300'}
            `}
          />
          {errors.accountNumber && (
            <p className="text-sm text-red-600">{errors.accountNumber}</p>
          )}
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>🔒 Secure Payment:</strong> You will be redirected to 
              {paymentMethods.find(m => m.id === selectedMethod)?.name} 
              to complete payment. Your password/PIN will never be shared with us.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodSelector;
