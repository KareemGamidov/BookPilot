import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useDropzone } from 'react-dropzone';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { useAuth } from '../../contexts/AuthContext';
import { booksAPI } from '../../utils/api';

const Upload = () => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const onDrop = (acceptedFiles) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      // If no title is set, use the filename without extension
      if (!title) {
        const fileName = acceptedFiles[0].name.split('.').slice(0, -1).join('.');
        setTitle(fileName);
      }
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/epub+zip': ['.epub'],
      'text/plain': ['.txt']
    },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024, // 50MB
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await booksAPI.uploadBook(title, file, author || null);
      router.push('/books');
    } catch (err) {
      console.error('Error uploading book:', err);
      setError('Failed to upload book. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Upload a Book</h1>
        <Card>
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">
                {error}
              </div>
            )}
            
            <Input
              label="Book Title"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter book title"
              required
            />
            
            <Input
              label="Author (optional)"
              id="author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Enter author name"
            />
            
            <div className="mb-4">
              <label className="label">Book File</label>
              <div 
                {...getRootProps()} 
                className={`border-2 border-dashed rounded-md p-6 text-center cursor-pointer transition-colors ${
                  isDragActive 
                    ? 'border-primary-500 bg-primary-50' 
                    : file 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-secondary-300 hover:border-primary-500 hover:bg-primary-50'
                }`}
              >
                <input {...getInputProps()} />
                {file ? (
                  <div>
                    <p className="text-green-600 font-medium">{file.name}</p>
                    <p className="text-secondary-500 text-sm mt-1">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                ) : isDragActive ? (
                  <p className="text-primary-600">Drop the file here...</p>
                ) : (
                  <div>
                    <p className="text-secondary-600">
                      Drag & drop a book file here, or click to select
                    </p>
                    <p className="text-secondary-500 text-sm mt-1">
                      Supported formats: PDF, EPUB, TXT (max 50MB)
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/books')}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={loading || !title || !file}
              >
                {loading ? 'Uploading...' : 'Upload Book'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </Layout>
  );
};

export default Upload;
