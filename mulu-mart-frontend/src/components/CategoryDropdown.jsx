import React, { useState, useEffect } from 'react';
import api from '../services/api';

const CategoryDropdown = ({ onCategoryChange, selectedCategory }) => {
  // State Management
  const [selectedMain, setSelectedMain] = useState('');
  const [selectedSub, setSelectedSub] = useState('');
  const [selectedSubSub, setSelectedSubSub] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch categories from database
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories/nested');
        setCategories(response.data.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Initialize from props
  useEffect(() => {
    if (selectedCategory) {
      // Find the category in the nested structure
      const findCategoryInTree = (categoryList, targetId) => {
        for (const mainCat of categoryList) {
          if (mainCat._id === targetId) {
            return { main: mainCat.name, sub: '', subSub: '' };
          }
          if (mainCat.subcategories) {
            for (const subCat of mainCat.subcategories) {
              if (subCat._id === targetId) {
                return { main: mainCat.name, sub: subCat.name, subSub: '' };
              }
              if (subCat.subcategories) {
                for (const subSubCat of subCat.subcategories) {
                  if (subSubCat._id === targetId) {
                    return { 
                      main: mainCat.name, 
                      sub: subCat.name, 
                      subSub: subSubCat.name 
                    };
                  }
                }
              }
            }
          }
        }
        return null;
      };

      const found = findCategoryInTree(categories, selectedCategory);
      if (found) {
        setSelectedMain(found.main);
        setSelectedSub(found.sub);
        setSelectedSubSub(found.subSub);
      }
    }
  }, [selectedCategory, categories]);

  // Handle Main Category Change
  const handleMainCategoryChange = (e) => {
    const main = e.target.value;
    setSelectedMain(main);
    setSelectedSub('');
    setSelectedSubSub('');
    
    // Find the main category object
    const mainCategory = categories.find(cat => cat.name === main);
    if (mainCategory) {
      onCategoryChange({
        categoryId: mainCategory._id,
        main,
        sub: '',
        subSub: '',
        fullPath: main
      });
    }
  };

  // Handle Sub Category Change
  const handleSubCategoryChange = (e) => {
    const sub = e.target.value;
    setSelectedSub(sub);
    setSelectedSubSub('');
    
    if (sub && selectedMain) {
      const mainCategory = categories.find(cat => cat.name === selectedMain);
      const subCategory = mainCategory?.subcategories?.find(subCat => subCat.name === sub);
      
      if (subCategory) {
        onCategoryChange({
          categoryId: subCategory._id,
          main: selectedMain,
          sub,
          subSub: '',
          fullPath: `${selectedMain} → ${sub}`
        });
      }
    }
  };

  // Handle Sub-Sub Category Change
  const handleSubSubCategoryChange = (e) => {
    const subSub = e.target.value;
    setSelectedSubSub(subSub);
    
    if (subSub && selectedMain && selectedSub) {
      const mainCategory = categories.find(cat => cat.name === selectedMain);
      const subCategory = mainCategory?.subcategories?.find(subCat => subCat.name === selectedSub);
      const subSubCategory = subCategory?.subcategories?.find(subSubCat => subSubCat.name === subSub);
      
      if (subSubCategory) {
        onCategoryChange({
          categoryId: subSubCategory._id,
          main: selectedMain,
          sub: selectedSub,
          subSub,
          fullPath: `${selectedMain} → ${selectedSub} → ${subSub}`
        });
      }
    }
  };

  // Get available options
  const mainCategories = categories.map(cat => cat.name);
  const mainCategoryObjects = categories;
  const selectedMainCategory = mainCategoryObjects.find(cat => cat.name === selectedMain);
  const subCategories = selectedMainCategory?.subcategories?.map(subCat => subCat.name) || [];
  const selectedSubCategory = selectedMainCategory?.subcategories?.find(subCat => subCat.name === selectedSub);
  const subSubCategories = selectedSubCategory?.subcategories?.map(subSubCat => subSubCat.name) || [];

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded mb-4"></div>
          <div className="h-10 bg-gray-200 rounded mb-4"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Category Dropdown */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Main Category *
        </label>
        <select
          value={selectedMain}
          onChange={handleMainCategoryChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Select Main Category</option>
          {mainCategories.map(category => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {/* Sub Category Dropdown */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Sub Category *
        </label>
        <select
          value={selectedSub}
          onChange={handleSubCategoryChange}
          disabled={!selectedMain}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <option value="">Select Sub Category</option>
          {subCategories.map(category => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {/* Sub-Sub Category Dropdown */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Brand/Type *
        </label>
        <select
          value={selectedSubSub}
          onChange={handleSubSubCategoryChange}
          disabled={!selectedSub}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <option value="">Select Brand/Type</option>
          {subSubCategories.map(brand => (
            <option key={brand} value={brand}>
              {brand}
            </option>
          ))}
        </select>
      </div>

      {/* Selected Category Display */}
      {(selectedMain || selectedSub || selectedSubSub) && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
          <div className="text-sm text-blue-800">
            <span className="font-semibold">Selected:</span> {selectedMain && selectedSub && selectedSubSub ? `${selectedMain} → ${selectedSub} → ${selectedSubSub}` : selectedMain || selectedSub || 'Please complete selection'}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryDropdown;
