import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { blogAPI } from '../../../shared/services/api';
import { useAuth } from '../../../contexts/AuthContext';

const CreateBlog = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    picture: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        picture: file
      });

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.title.trim() || !formData.content.trim()) {
      setError('Title and content are required');
      setLoading(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('content', formData.content);
      if (formData.picture) {
        formDataToSend.append('picture', formData.picture);
      }

      const response = await blogAPI.create(formDataToSend);
      
      if (response.status === 201) {
        navigate('/blogs', {
          state: { message: 'Blog published successfully!' }
        });
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create blog');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            Write a Blog
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Share your knowledge and experiences with the community
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Author Info */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                {user.username[0].toUpperCase()}
              </div>
              <div>
                <div className="font-bold text-gray-800 dark:text-white">
                  {user.username}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {user.email}
                </div>
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Blog Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="input-field text-xl"
              placeholder="Enter a compelling title..."
            />
          </div>

          {/* Featured Image */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Featured Image (Optional)
            </label>
            
            <div className="mt-2">
              {preview ? (
                <div className="mb-4">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, picture: null });
                      setPreview('');
                    }}
                    className="mt-2 text-red-600 hover:text-red-700 text-sm"
                  >
                    Remove image
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                  <div className="text-4xl mb-2">📷</div>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Add a featured image to make your blog stand out
                  </p>
                  <label className="cursor-pointer">
                    <span className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      Choose Image
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Blog Content *
              </label>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Supports Markdown formatting
              </div>
            </div>
            
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              required
              rows="15"
              className="input-field font-mono"
              placeholder="Write your blog content here...
              
You can use Markdown for formatting:
# Heading 1
## Heading 2
**Bold text**
*Italic text*
- List item
1. Numbered item

```javascript
// Code blocks
console.log('Hello World');
```"
            />
            
            <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              Character count: {formData.content.length}
            </div>
          </div>

          {/* Preview & Submit */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
              Preview
            </h2>
            
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-6">
              <div className="prose dark:prose-invert max-w-none">
                <h1 className="text-2xl font-bold mb-4">{formData.title || 'Your Title Here'}</h1>
                {preview && (
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                )}
                <div className="text-gray-600 dark:text-gray-400">
                  {formData.content || 'Your content will appear here...'}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/blogs')}
                className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Publishing...' : 'Publish Blog'}
              </button>
            </div>
          </div>
        </form>

        {/* Writing Tips */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
          <h3 className="font-bold text-gray-800 dark:text-white mb-3">Writing Tips</h3>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li>• Start with an engaging introduction</li>
            <li>• Use clear headings and subheadings</li>
            <li>• Include code examples when relevant</li>
            <li>• Add images or diagrams to explain complex concepts</li>
            <li>• End with a conclusion or call-to-action</li>
            <li>• Proofread before publishing</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CreateBlog;