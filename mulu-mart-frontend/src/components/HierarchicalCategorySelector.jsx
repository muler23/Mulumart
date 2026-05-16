import React, { useState, useEffect } from 'react';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const HierarchicalCategorySelector = ({ onCategorySelect, selectedCategory }) => {
  const [categories, setCategories] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/v1/categories/nested');
      const data = await response.json();
      
      if (data.success) {
        setCategories(data.data);
      } else {
        setError('Failed to load categories');
      }
    } catch (err) {
      setError('Error loading categories');
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (categoryId) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleCategoryClick = (category, level) => {
    onCategorySelect(category, level);
  };

  const renderCategory = (category, level = 0) => {
    const hasChildren = category.subcategories && category.subcategories.length > 0;
    const isExpanded = expandedCategories.has(category._id);
    const isSelected = selectedCategory && selectedCategory._id === category._id;
    const paddingLeft = `${level * 20 + 12}px`;

    return (
      <div key={category._id} className="select-none">
        <div
          className={`flex items-center py-2 px-3 hover:bg-gray-50 cursor-pointer transition-colors ${
            isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : ''
          }`}
          style={{ paddingLeft }}
          onClick={() => handleCategoryClick(category, level)}
        >
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleCategory(category._id);
              }}
              className="mr-2 p-1 hover:bg-gray-200 rounded transition-colors"
            >
              {isExpanded ? (
                <ChevronDownIcon className="h-4 w-4 text-gray-600" />
              ) : (
                <ChevronRightIcon className="h-4 w-4 text-gray-600" />
              )}
            </button>
          )}
          
          {!hasChildren && <div className="w-7 mr-2" />}
          
          <div className="flex items-center flex-1">
            <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center mr-3">
              <span className="text-xs text-gray-600">
                {category.icon ? category.icon.charAt(0).toUpperCase() : 'C'}
              </span>
            </div>
            <div className="flex-1">
              <div className="font-medium text-gray-900">{category.name}</div>
              {category.description && (
                <div className="text-xs text-gray-500 mt-1">{category.description}</div>
              )}
            </div>
          </div>
        </div>
        
        {hasChildren && isExpanded && (
          <div className="bg-gray-50 border-l-2 border-gray-200">
            {category.subcategories.map((subcategory) => (
              <div key={subcategory._id}>
                {renderCategory(subcategory, level + 1)}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mt-2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <div className="text-red-500 mb-2">{error}</div>
        <button
          onClick={fetchCategories}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="border rounded-lg bg-white max-h-96 overflow-y-auto">
      <div className="p-3 border-b bg-gray-50">
        <h3 className="font-medium text-gray-900">Select Category</h3>
        <p className="text-xs text-gray-500 mt-1">Choose from hierarchical categories like Jiji</p>
      </div>
      
      {categories.length === 0 ? (
        <div className="p-4 text-center text-gray-500">
          No categories available
        </div>
      ) : (
        <div className="py-2">
          {categories.map((category) => (
            <div key={category._id}>
              {renderCategory(category)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HierarchicalCategorySelector;
