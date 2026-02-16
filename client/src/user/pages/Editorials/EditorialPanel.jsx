import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { editorialAPI } from '../../../shared/services/api';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  ThumbsUp, ThumbsDown, MessageSquare, 
  Calendar, User, Code, Filter, ChevronDown, ChevronUp 
} from 'lucide-react';

const EditorialPanel = ({ problemId }) => {
  const { user } = useAuth();
  
  const [editorials, setEditorials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('votes');
  const [filterLanguage, setFilterLanguage] = useState('all');
  const [expandedId, setExpandedId] = useState(null);

  const navigate = useNavigate();
  useEffect(() => {
    if (problemId) {
      fetchData();
    }
  }, [problemId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await editorialAPI.getByProblem(problemId);
      setEditorials(response || []);
    } catch (error) {
      console.error('Failed to fetch editorials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (e, editorialId, voteType) => {
    e.stopPropagation();
    if (!user) return;

    try {
      await editorialAPI.vote(editorialId, voteType);
      fetchData(); 
    } catch (error) {
      console.error('Failed to vote:', error);
    }
  };

  const sortedEditorials = [...editorials].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.createdAt) - new Date(a.createdAt);
    } else if (sortBy === 'votes') {
      const aScore = (a.upVotes?.length || 0) - (a.downVotes?.length || 0);
      const bScore = (b.upVotes?.length || 0) - (b.downVotes?.length || 0);
      return bScore - aScore;
    }
    return 0;
  });

  const filteredEditorials = filterLanguage === 'all' 
    ? sortedEditorials
    : sortedEditorials.filter(e => e.language === filterLanguage);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full text-gray-500">
        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
        Loading editorials...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] text-gray-300">
      
      <div className="p-4 border-b border-[#333] bg-[#252526] space-y-3">
        <div className="flex items-center justify-between">
            <h3 className="font-medium text-white">Community Solutions</h3>
            <button onClick={() => navigate(`/editorials/${problemId}/new`)} className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded transition-colors">
                Write Editorial
            </button>
            
        </div>

        <div className="flex gap-2">
            <div className="relative flex-1">
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full bg-[#333] text-xs text-gray-300 border border-transparent focus:border-blue-500 rounded px-2 py-1.5 appearance-none outline-none cursor-pointer"
                >
                    <option value="votes">Top Voted</option>
                    <option value="newest">Newest</option>
                </select>
                <ChevronDown size={12} className="absolute right-2 top-2 text-gray-500 pointer-events-none" />
            </div>
            <div className="relative flex-1">
                <select
                    value={filterLanguage}
                    onChange={(e) => setFilterLanguage(e.target.value)}
                    className="w-full bg-[#333] text-xs text-gray-300 border border-transparent focus:border-blue-500 rounded px-2 py-1.5 appearance-none outline-none cursor-pointer"
                >
                    <option value="all">All Langs</option>
                    <option value="JavaScript">JavaScript</option>
                    <option value="Python">Python</option>
                    <option value="Java">Java</option>
                    <option value="C++">C++</option>
                </select>
                <Filter size={10} className="absolute right-2 top-2.5 text-gray-500 pointer-events-none" />
            </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {filteredEditorials.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
             <Code size={32} className="mx-auto mb-2 opacity-50"/>
             <p className="text-sm">No editorials found.</p>
          </div>
        ) : (
          filteredEditorials.map((editorial) => {
            const voteScore = (editorial.upVotes?.length || 0) - (editorial.downVotes?.length || 0);
            const userVoteStatus = editorial.userVoteStatus || 'none';
            const isExpanded = expandedId === editorial._id;

            return (
              <div 
                key={editorial._id} 
                className={`bg-[#262626] border rounded-lg transition-all overflow-hidden ${isExpanded ? 'border-blue-500/50 ring-1 ring-blue-500/20' : 'border-[#333] hover:border-[#444]'}`}
              >
                <div 
                    onClick={() => setExpandedId(isExpanded ? null : editorial._id)}
                    className="p-3 cursor-pointer"
                >
                    <div className="flex justify-between items-start gap-3">
                        <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm text-gray-200 truncate pr-2">
                                {editorial.title}
                            </h4>
                            <div className="flex items-center gap-2 mt-1.5">
                                <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                                    editorial.language === 'Python' ? 'border-yellow-900/50 text-yellow-500 bg-yellow-900/10' :
                                    editorial.language === 'Java' ? 'border-orange-900/50 text-orange-500 bg-orange-900/10' :
                                    'border-blue-900/50 text-blue-500 bg-blue-900/10'
                                }`}>
                                    {editorial.language}
                                </span>
                                <span className="text-[10px] text-gray-500 flex items-center gap-1">
                                    <User size={10} /> {editorial.userId?.username || 'User'}
                                </span>
                                <span className="text-[10px] text-gray-500 flex items-center gap-1">
                                    <Calendar size={10} /> {new Date(editorial.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-col items-center gap-1 bg-[#1e1e1e] p-1 rounded border border-[#333]">
                             <button 
                                onClick={(e) => handleVote(e, editorial._id, 'up')}
                                className={`p-0.5 hover:text-green-400 ${userVoteStatus === 'up' ? 'text-green-500' : 'text-gray-500'}`}
                             >
                                <ChevronUp size={14} strokeWidth={3} />
                             </button>
                             <span className={`text-xs font-bold ${voteScore > 0 ? 'text-green-500' : voteScore < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                                {voteScore}
                             </span>
                             <button 
                                onClick={(e) => handleVote(e, editorial._id, 'down')}
                                className={`p-0.5 hover:text-red-400 ${userVoteStatus === 'down' ? 'text-red-500' : 'text-gray-500'}`}
                             >
                                <ChevronDown size={14} strokeWidth={3} />
                             </button>
                        </div>
                    </div>
                </div>

                {isExpanded && (
                    <div className="border-t border-[#333] bg-[#1e1e1e]">
                        <div className="p-3 text-sm text-gray-300 whitespace-pre-line leading-relaxed border-b border-[#333]">
                            {editorial.content}
                        </div>
                        <div className="h-64 relative">
                            <Editor
                                height="100%"
                                theme="vs-dark"
                                language={editorial.language.toLowerCase()}
                                value={editorial.code}
                                options={{
                                    readOnly: true,
                                    minimap: { enabled: false },
                                    fontSize: 12,
                                    scrollBeyondLastLine: false,
                                    padding: { top: 10 },
                                    fontFamily: "'Fira Code', monospace"
                                }}
                            />
                        </div>
                        <div className="p-2 bg-[#252526] border-t border-[#333] flex items-center gap-4 text-xs text-gray-500">
                             <div className="flex items-center gap-1.5">
                                 <MessageSquare size={12} />
                                 <span>{editorial.comments?.length || 0} Comments</span>
                             </div>
                        </div>
                    </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default EditorialPanel;