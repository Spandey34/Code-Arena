import axios from 'axios';

const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api` || 'http://localhost:5000/api',
  withCredentials: true,
});

// Request interceptor to add auth token
API.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
API.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default API;

// Auth APIs
export const authAPI = {
  register: (data) => API.post('/user/register', data),
  login: (data) => API.post('/user/login', data),
  logout: () => API.post('/user/logout'),
  getCurrentUser: () => API.get('/user'),
  changePassword: (data) => API.post('/user/changePassword', data),
  getUserDetails: (id) => API.get(`/user/info/${id}`),
  getLeaderboard: () => API.get('/user/leaderboard'),
  getStats: ()=> API.get('/user/stats'),
  updateUserRole: (userId, isAdmin) => API.post(`/user/update-role/${userId}`, { isAdmin }),
  deleteUser: (userId) => API.delete(`/user/${userId}`),
};

// Problem APIs
export const problemAPI = {
  getAll: () => API.get('/problem'),
  getById: (id) => API.get(`/problem/info/${id}`),
  getSubmissions: (problemId) => API.get(`/problem/submissions/${problemId}`),
  add: (data) => API.post('/problem/add', data),
  update: (id, data) => API.post(`/problem/update/${id}`, data),
  toggleVisibility: (id) => API.post(`/problem/toggle/${id}`),
  delete: (id) => API.post(`/problem/delete/${id}`),
  
  // Admin specific - all submissions for a problem
  getProblemSubmissionsAll: (problemId) => {
    return submissionAPI.getAll().then(res => {
      return { submissions: res.submissions.filter(sub => sub.problemId === problemId) };
    });
  }
};

// Submission APIs
export const submissionAPI = {
  run: (data) => API.post('/submission/run', data),
  submit: (data) => API.post('/submission/submit', data),
  getUserSubmissions: () => API.get('/submission'),
  getAll: () => API.get('/submission/all'),
  getByProblem: (problemId) => API.get(`problem/submissions/${problemId}`),
  getSubmissionById: (id) => API.get(`/submission/${id}`), // Note: You'll need to create this endpoint
};

// Contest APIs
export const contestAPI = {
  getAll: () => API.get('/contest'),
  getById: (id) => API.get(`/contest/info/${id}`),
  create: (data) => API.post('/contest/add', data),
  register: (id) => API.post(`/contest/register/${id}`),
  delete: (id) => API.post(`/contest/delete/${id}`),
  updateStatus: (id, status) => API.post(`/contest/update/${id}`, { status }),
  getStandings: (id) => API.get(`/contest/standings/${id}`),
  getSubmissions: (id) => API.get(`/contest/submissions/${id}`),
  updateRatings: (contestId) => API.post(`/contest/admin/updateRatings/${contestId}`),
  
  // Admin specific - all contest submissions
  getAllContestSubmissions: (id) => API.get(`/contest/submissions/${id}`),
};

// Match APIs
export const matchAPI = {
  findMatch: () => API.post('/match/findMatch'),
  cancelMatch: () => API.post('/match/cancelMatch'),
  submitCode: (matchId, data) => API.post(`/match/submit/${matchId}`, data),
  getAllMatches: () => API.get('/match/all'),
  getMatchById: (matchId) => API.get(`/match/info/${matchId}`),
};

// Editorial APIs
export const editorialAPI = {
  create: (data) => API.post('/editorial/add', data),
  getByProblem: (problemId) => API.get(`/editorial/problem/${problemId}`),
  getById: (id) => API.get(`/editorial/${id}`),
  update: (id, data) => API.post(`/editorial/update/${id}`, data),
  delete: (id) => API.post(`/editorial/delete/${id}`),
  vote: (id, voteType) => API.post(`/editorial/vote/${id}`, { voteType }),
};

// Blog APIs
export const blogAPI = {
  create: (data) => API.post('/blog/add', data),
  getAll: async (cursor = null,limit=10) => {
    const response = await API.get(
        cursor
            ? `/blog?cursor=${cursor}&limit=${limit}`
            : `/blog?limit=${limit}`
    );
    return response;
},
  getById: (id) => API.get(`/blog/${id}`),
  update: (id, data) => API.post(`/blog/update/${id}`, data),
  delete: (id) => API.post(`/blog/delete/${id}`),
  vote: (id, voteType) => API.post(`/blog/vote/${id}`, { voteType }),
  
  // Admin blog management
  updateBlogStatus: (id, isPublished) => API.post(`/blog/update-status/${id}`, { isPublished }),
  getAllBlogsAdmin: () => API.get('/blog/admin/all'), // Note: You'll need to create this endpoint
};

// Admin specific APIs (grouped separately for clarity)
export const adminAPI = {
  // User management
  getAllUsers: () => authAPI.getLeaderboard(),
  updateUserRole: (userId, isAdmin) => API.post(`/user/update-role/${userId}`, { isAdmin }),
  deleteUser: (userId) => API.delete(`/user/${userId}`),
  banUser: (userId, reason) => API.post(`/user/ban/${userId}`, { reason }),
  getUserDetailedStats: (userId) => API.get(`/admin/stats/${userId}`),
  
  // Problem management
  getAllProblemsAdmin: () => API.get('/problem/admin/all'),
  getProblemStats: (problemId) => API.get(`/problem/admin/stats/${problemId}`),
  
  // Contest management
  getAllContestsAdmin: () => API.get('/contest/admin/all'),
  getContestStats: (contestId) => API.get(`/contest/admin/stats/${contestId}`),
  
  // Submission management
  getAllSubmissions: () => submissionAPI.getAll(),
  getSubmissionDetails: (submissionId) => API.get(`/submission/${submissionId}`),
  rejudgeSubmission: (submissionId) => API.post(`/submission/admin/rejudge/${submissionId}`),
  rejudgeProblem: (problemId) => API.post(`/problem/admin/rejudge/${problemId}`),
  
  // System stats
  getSystemStats: () => API.get('/admin/stats'),
  getRecentActivity: () => API.get('/admin/activity'),
  
  // Blog management
  getAllBlogsAdmin: () => API.get('/blog/admin/all'),
  updateBlogVisibility: (blogId, isPublished) => API.post(`/blog/admin/visibility/${blogId}`, { isPublished }),
  
  // Match management
  getAllMatchesAdmin: () => matchAPI.getAllMatches(),
  cancelMatchAdmin: (matchId) => API.post(`/match/admin/cancel/${matchId}`),
  
  // Editorial management
  getAllEditorialsAdmin: () => API.get('/editorial/admin/all'),
  updateEditorialStatus: (editorialId, isApproved) => API.post(`/editorial/admin/status/${editorialId}`, { isApproved }),
};

// Utility function to handle file uploads
export const uploadFile = async (file, endpoint, fieldName = 'file') => {
  const formData = new FormData();
  formData.append(fieldName, file);
  
  return API.post(endpoint, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// Socket event constants
export const SOCKET_EVENTS = {
  ONLINE_USERS: 'onlineUsers',
  WAITING_FOR_OPPONENT: 'waitingForOpponent',
  MATCH_FOUND: 'matchFound',
  CANCEL_MATCH: 'cancelMatch',
  LOGIN: 'login',
  LOGOUT: 'logout',
  CODE_UPDATE: 'code-update',
  SUBMISSION_RESULT: 'submission-result',
};

// Helper function to format API errors
export const formatApiError = (error) => {
  if (error.response) {
    return {
      message: error.response.data?.message || 'An error occurred',
      status: error.response.status,
      data: error.response.data,
    };
  } else if (error.request) {
    // The request was made but no response was received
    return {
      message: 'No response from server. Please check your connection.',
      status: null,
      data: null,
    };
  } else {
    // Something happened in setting up the request that triggered an Error
    return {
      message: error.message || 'An error occurred',
      status: null,
      data: null,
    };
  }
};

// Helper function to handle API calls with error handling
export const apiCall = async (apiFunction, ...args) => {
  try {
    const response = await apiFunction(...args);
    return { success: true, data: response };
  } catch (error) {
    const formattedError = formatApiError(error);
    console.error('API Error:', formattedError);
    return { success: false, error: formattedError };
  }
};

// Export all APIs in one object for convenience
export const api = {
  auth: authAPI,
  problem: problemAPI,
  submission: submissionAPI,
  contest: contestAPI,
  match: matchAPI,
  editorial: editorialAPI,
  blog: blogAPI,
  admin: adminAPI,
  uploadFile,
  events: SOCKET_EVENTS,
  call: apiCall,
  formatError: formatApiError,
};