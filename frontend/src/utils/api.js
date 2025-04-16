import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth API
export const authAPI = {
  register: (email, provider = 'email') => 
    api.post('/auth/register', { email, provider }),
  
  login: (email, password) => 
    api.post('/auth/login', new URLSearchParams({
      'username': email,
      'password': password || 'placeholder' // For MVP, we're not using real passwords
    }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }),
  
  getCurrentUser: () => 
    api.get('/auth/me'),
};

// Books API
export const booksAPI = {
  getBooks: () => 
    api.get('/books'),
  
  getBook: (id) => 
    api.get(`/books/${id}`),
  
  uploadBook: (title, file, author = null) => {
    const formData = new FormData();
    formData.append('title', title);
    if (author) formData.append('author', author);
    formData.append('file', file);
    
    return api.post('/books', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  processBook: (id) => 
    api.post(`/books/${id}/process`),
  
  deleteBook: (id) => 
    api.delete(`/books/${id}`),
};

// Guides API
export const guidesAPI = {
  getGuide: (bookId) => 
    api.get(`/guides/${bookId}`),
  
  updateProgress: (bookId, progress) => 
    api.patch(`/guides/${bookId}/progress`, progress),
  
  getQuiz: (bookId) => 
    api.get(`/guides/${bookId}/quiz`),
  
  submitQuizResults: (bookId, results) => 
    api.post(`/guides/${bookId}/quiz/results`, results),
    
  exportGuide: (bookId, format = 'pdf') =>
    api.post(`/guides/${bookId}/export`, { format }),
};

// Chat API
export const chatAPI = {
  getMessages: (bookId) => 
    api.get(`/chat/${bookId}/messages`),
  
  sendMessage: (bookId, message) => 
    api.post(`/chat/${bookId}/messages`, message),
};

export default api;
