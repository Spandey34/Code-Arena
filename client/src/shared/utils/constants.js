export const LANGUAGES = [
  { value: 'JavaScript', label: 'JavaScript' },
  { value: 'Python', label: 'Python' },
  { value: 'Java', label: 'Java' },
  { value: 'C++', label: 'C++' },
];

export const VERDICT_COLORS = {
  'ACCEPTED': 'text-green-600',
  'WRONG_ANSWER': 'text-red-600',
  'TIME_LIMIT_EXCEEDED': 'text-yellow-600',
  'RUNTIME_ERROR': 'text-orange-600',
  'COMPILATION_ERROR': 'text-red-700',
  'QUEUED': 'text-blue-600',
  'PROCESSING': 'text-purple-600',
};

export const CONTEST_STATUS = {
  UPCOMING: 'upcoming',
  ONGOING: 'ongoing',
  COMPLETED: 'completed',
};

export const CONTEST_STATUS_COLORS = {
  [CONTEST_STATUS.UPCOMING]: 'bg-blue-100 text-blue-800',
  [CONTEST_STATUS.ONGOING]: 'bg-green-100 text-green-800',
  [CONTEST_STATUS.COMPLETED]: 'bg-gray-100 text-gray-800',
};