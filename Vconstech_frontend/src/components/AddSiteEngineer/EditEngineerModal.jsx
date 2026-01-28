import React, { useState, useEffect } from 'react';
import { X, Upload, User, UserCircle, Lock } from 'lucide-react';

const EditEngineerModal = ({ isOpen, onClose, onSubmit, isSubmitting, engineer }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    alternatePhone: '',
    empId: '',
    address: '',
    username: '',
    password: '',
    profileImage: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (engineer) {
      console.log('Engineer data received in modal:', engineer); // Debug log
      setFormData({
        name: engineer.name || '',
        phone: engineer.phone || '',
        alternatePhone: engineer.alternatePhone || '',
        empId: engineer.empId || '',
        address: engineer.address || '',
        username: engineer.username || '', // Check if this is coming from backend
        password: '', // Leave empty - only fill if admin wants to change it
        profileImage: null
      });
      setImagePreview(engineer.profileImage || null);
      setErrors({});
    }
  }, [engineer]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          profileImage: 'Image size should be less than 5MB'
        }));
        return;
      }

      setFormData(prev => ({
        ...prev,
        profileImage: file
      }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);

      if (errors.profileImage) {
        setErrors(prev => ({
          ...prev,
          profileImage: ''
        }));
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Phone number must be 10 digits';
    }

    if (formData.alternatePhone && !/^\d{10}$/.test(formData.alternatePhone.trim())) {
      newErrors.alternatePhone = 'Alternate phone must be 10 digits';
    }

    if (!formData.empId.trim()) {
      newErrors.empId = 'Employee ID is required';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 4) {
      newErrors.username = 'Username must be at least 4 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }

    // Password validation (only if provided)
    if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Log what we're sending
    console.log('Submitting updated engineer data:', {
      ...formData,
      password: formData.password ? '***HIDDEN***' : 'NOT CHANGED'
    });

    const success = await onSubmit(engineer.id, formData);
    if (success) {
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      phone: '',
      alternatePhone: '',
      empId: '',
      address: '',
      username: '',
      password: '',
      profileImage: null
    });
    setImagePreview(null);
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">Edit Engineer</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Profile Image */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="h-24 w-24 object-cover" />
                  ) : (
                    <User className="w-12 h-12 text-blue-600" />
                  )}
                </div>
                <label
                  htmlFor="profileImage"
                  className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full cursor-pointer transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  <input
                    type="file"
                    id="profileImage"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    disabled={isSubmitting}
                  />
                </label>
              </div>
              {errors.profileImage && (
                <p className="text-red-500 text-sm mt-2">{errors.profileImage}</p>
              )}
              <p className="text-sm text-gray-500 mt-2">Click the upload icon to change image</p>
            </div>

            {/* Basic Information Section */}
            <div className="border-b pb-4">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h4>
              
              {/* Name */}
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="Enter full name"
                  disabled={isSubmitting}
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              {/* Employee ID */}
              <div className="mb-4">
                <label htmlFor="empId" className="block text-sm font-medium text-gray-700 mb-1">
                  Employee ID *
                </label>
                <input
                  type="text"
                  id="empId"
                  name="empId"
                  value={formData.empId}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border ${
                    errors.empId ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="Enter employee ID"
                  disabled={isSubmitting}
                />
                {errors.empId && <p className="text-red-500 text-sm mt-1">{errors.empId}</p>}
              </div>

              {/* Phone Numbers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="10 digit number"
                    maxLength="10"
                    disabled={isSubmitting}
                  />
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <label htmlFor="alternatePhone" className="block text-sm font-medium text-gray-700 mb-1">
                    Alternate Phone
                  </label>
                  <input
                    type="tel"
                    id="alternatePhone"
                    name="alternatePhone"
                    value={formData.alternatePhone}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border ${
                      errors.alternatePhone ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="10 digit number (optional)"
                    maxLength="10"
                    disabled={isSubmitting}
                  />
                  {errors.alternatePhone && (
                    <p className="text-red-500 text-sm mt-1">{errors.alternatePhone}</p>
                  )}
                </div>
              </div>

              {/* Address */}
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  Address *
                </label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows="3"
                  className={`w-full px-4 py-2 border ${
                    errors.address ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="Enter full address"
                  disabled={isSubmitting}
                />
                {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
              </div>
            </div>

            {/* Login Credentials Section */}
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">Login Credentials</h4>
              <p className="text-sm text-gray-600 mb-4">Update login credentials if needed</p>
              
              {/* Username */}
              <div className="mb-4">
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Username *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserCircle className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-2 border ${
                      errors.username ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="Enter username"
                    disabled={isSubmitting}
                  />
                </div>
                {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-20 py-2 border ${
                      errors.password ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="Leave blank to keep current password"
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-blue-600 hover:text-blue-800"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                <p className="text-xs text-gray-500 mt-1">Leave empty if you don't want to change the password</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex gap-3 justify-end">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-black rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#ffbe2a' }}
              onMouseEnter={(e) => !isSubmitting && (e.target.style.backgroundColor = '#e6ab25')}
              onMouseLeave={(e) => !isSubmitting && (e.target.style.backgroundColor = '#ffbe2a')}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Updating...' : 'Update Engineer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditEngineerModal;