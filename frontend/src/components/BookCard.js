import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Card from './Card';

const BookCard = ({ book }) => {
  const statusColors = {
    uploaded: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    processed: 'bg-green-100 text-green-800',
    error: 'bg-red-100 text-red-800'
  };

  return (
    <Card className="h-full flex flex-col">
      <div className="relative h-40 bg-secondary-100 rounded-t-lg mb-4">
        {book.status === 'processed' ? (
          <div className="w-full h-full flex items-center justify-center">
            <Image 
              src="/book-cover.svg" 
              alt={book.title}
              width={100}
              height={120}
              className="object-cover"
            />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg 
              className="w-16 h-16 text-secondary-300" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" 
              />
            </svg>
          </div>
        )}
      </div>
      
      <div className="flex-grow">
        <h3 className="text-lg font-semibold mb-1 line-clamp-1">{book.title}</h3>
        {book.author && (
          <p className="text-sm text-secondary-600 mb-2">by {book.author}</p>
        )}
        
        <div className="flex items-center mb-3">
          <span className={`text-xs px-2 py-1 rounded-full ${statusColors[book.status] || 'bg-secondary-100 text-secondary-800'}`}>
            {book.status.charAt(0).toUpperCase() + book.status.slice(1)}
          </span>
        </div>
      </div>
      
      <div className="mt-4">
        {book.status === 'processed' ? (
          <Link 
            href={`/guides/${book.id}`}
            className="btn btn-primary w-full py-2"
          >
            View Guide
          </Link>
        ) : book.status === 'error' ? (
          <Link 
            href={`/books/${book.id}/process`}
            className="btn btn-outline w-full py-2"
          >
            Retry Processing
          </Link>
        ) : (
          <button 
            className="btn btn-secondary w-full py-2 opacity-75 cursor-not-allowed"
            disabled
          >
            {book.status === 'processing' ? 'Processing...' : 'Awaiting Processing'}
          </button>
        )}
      </div>
    </Card>
  );
};

export default BookCard;
