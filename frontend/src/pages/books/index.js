import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import BookCard from '../../components/BookCard';
import { useAuth } from '../../contexts/AuthContext';
import { booksAPI } from '../../utils/api';

const Books = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    fetchBooks();
  }, [isAuthenticated, router]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await booksAPI.getBooks();
      setBooks(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching books:', err);
      setError('Failed to load books. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">My Books</h1>
        <Button
          onClick={() => router.push('/books/upload')}
          variant="primary"
        >
          Upload Book
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-secondary-500">Loading books...</p>
        </div>
      ) : books.length === 0 ? (
        <Card className="text-center py-12">
          <h3 className="text-xl font-medium text-secondary-700 mb-2">No books yet</h3>
          <p className="text-secondary-500 mb-6">
            Upload your first book to get started with BookPilot.
          </p>
          <Button
            onClick={() => router.push('/books/upload')}
            variant="primary"
          >
            Upload Book
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}
    </Layout>
  );
};

export default Books;
