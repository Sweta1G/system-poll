import { useEffect, useState } from 'react';
import { getSocket } from '../lib/socket';
import AppLayout from '../components/AppLayout';
import ChatWidget from '../components/ui/ChatWidget';

export default function Student() {
  const [studentName, setStudentName] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [currentPoll, setCurrentPoll] = useState<any>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [isKicked, setIsKicked] = useState(false);
  const [pollResult, setPollResult] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [liveVotes, setLiveVotes] = useState<number[]>([]); // Track live vote counts
  const [totalSubmissions, setTotalSubmissions] = useState<number>(0); // Track total submissions

  useEffect(() => {
    const socket = getSocket();
    
    const handlePollUpdate = (state: any) => {
      if (state.phase === 'active') {
        // Only reset voting state if this is a NEW poll (different question)
        const isNewPoll = !currentPoll || currentPoll.question !== state.question;
        
        setCurrentPoll({
          question: state.question,
          options: state.options
        });
        
        // Update live vote data
        setLiveVotes(state.votes || []);
        setTotalSubmissions(state.submissions || 0);
        
        if (isNewPoll) {
          setSelectedOption(null);
        }
        setPollResult(null);
        
        // Use server's hasVoted status instead of local state
        setHasVoted(state.hasVoted || false);
        
        setTimeLeft(state.deadline ? Math.max(0, Math.ceil((state.deadline - Date.now()) / 1000)) : 0);
      } else if (state.phase === 'results') {
        setCurrentPoll(null);
        setLiveVotes([]);
        setTotalSubmissions(0);
        setTimeLeft(0);
        // Only show results if the student has voted
        if (state.hasVoted) {
          setPollResult({
            question: state.question,
            options: state.options,
            votes: state.votes,
            totalVotes: state.submissions,
            correctAnswers: state.correctAnswers
          });
        } else {
          setPollResult(null);
        }
        // Keep the hasVoted status from server
        setHasVoted(state.hasVoted || false);
      } else {
        setCurrentPoll(null);
        setLiveVotes([]);
        setTotalSubmissions(0);
        setPollResult(null);
        setHasVoted(false);
        setTimeLeft(0);
      }
    };

    const handleKicked = () => {
      setIsKicked(true);
      setCurrentPoll(null);
      setPollResult(null);
    };

    socket.on('poll:update', handlePollUpdate);
    socket.on('system:kicked', handleKicked);

    return () => {
      socket.off('poll:update', handlePollUpdate);
      socket.off('system:kicked', handleKicked);
    };
  }, []);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const handleJoinSession = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted');
    console.log('studentName state:', studentName);
    console.log('studentName length:', studentName.length);
    console.log('trimmed name:', studentName.trim());
    console.log('trimmed length:', studentName.trim().length);
    
    if (studentName.trim()) {
      const socket = getSocket();
      const nameToSend = studentName.trim();
      console.log('About to emit student:join with:', nameToSend);
      console.log('Type of nameToSend:', typeof nameToSend);
      socket.emit('student:join', nameToSend);
      // Set joined state immediately after emitting
      setIsJoined(true);
    } else {
      console.log('Name is empty after trim');
    }
  };

  const handleOptionSelect = (index: number) => {
    if (selectedOption === null && currentPoll) {
      setSelectedOption(index);
      const socket = getSocket();
      socket.emit('student:submit', { optionIndex: index });
      // Set hasVoted immediately for instant UI feedback
      setHasVoted(true);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (isKicked) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center">
            <div className="bg-white rounded-2xl shadow-lg p-12">
              <div className="mb-8">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                  📋 Intervue Poll
                </span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">You've been Kicked out !</h1>
              <p className="text-gray-600 mb-8">
                Looks like the teacher had removed you from the poll system. Please try again sometime.
              </p>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!studentName || !isJoined) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full">
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <div className="mb-8">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                  📋 Intervue Poll
                </span>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Let's Get Started</h1>
              <p className="text-gray-600 mb-8">
                If you're a student, you'll be able to <strong>submit your answers</strong>, participate in live polls, and see how your responses compare with your classmates
              </p>

              <form onSubmit={handleJoinSession} className="space-y-6">
                <div className="text-left">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enter your Name
                  </label>
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => {
                      console.log('Input changing to:', e.target.value);
                      setStudentName(e.target.value);
                    }}
                    placeholder="Rahul Bajaj"
                    className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg focus:ring-2 focus:ring-purple-500 focus:bg-white outline-none text-gray-900"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
                >
                  Continue
                </button>
              </form>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (currentPoll && !hasVoted) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* Header */}
              <div className="bg-gray-800 text-white p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-xl font-semibold">Question</h1>
                  </div>
                  <div className="text-red-400 font-mono">
                    ⏱ {formatTime(timeLeft)}
                  </div>
                </div>
                <p className="text-gray-300 mt-2">{currentPoll.question}</p>
              </div>

              {/* Options */}
              <div className="p-6 space-y-3">
                {currentPoll.options.map((option: string, index: number) => (
                  <label
                    key={index}
                    className={`flex items-center p-4 rounded-lg cursor-pointer transition-all border-2 ${
                      selectedOption === index
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 bg-gray-50 hover:border-purple-300'
                    }`}
                    onClick={() => handleOptionSelect(index)}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center ${
                      selectedOption === index
                        ? 'border-purple-500 bg-purple-500'
                        : 'border-gray-400'
                    }`}>
                      {selectedOption === index && (
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      )}
                    </div>
                    <span className="text-gray-900 font-medium">{option}</span>
                    <input
                      type="radio"
                      name="poll-option"
                      value={index}
                      checked={selectedOption === index}
                      onChange={() => {}} // Disabled - handled by onClick
                      className="hidden"
                    />
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
        <ChatWidget role="student" />
      </AppLayout>
    );
  }

  // Show live poll results for students who have voted during active phase
  if (hasVoted && currentPoll && timeLeft > 0) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* Question Header */}
              <div className="bg-gray-800 text-white p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Question</h2>
                  {timeLeft > 0 && (
                    <div className="text-red-400 font-mono">
                      ⏱ {formatTime(timeLeft)}
                    </div>
                  )}
                </div>
                <p className="text-gray-300 mt-2">{currentPoll.question}</p>
              </div>

              {/* Live Results - Same as Teacher View */}
              <div className="p-6 space-y-4">
                {currentPoll.options.map((opt: string, i: number) => {
                  // Use same calculation as teacher: total votes cast, not submissions count
                  const total = Math.max(1, liveVotes.reduce((a, b) => a + b, 0));
                  const votes = liveVotes[i] || 0;
                  const pct = Math.round((votes / total) * 100);
                  
                  return (
                    <div key={i} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium text-white ${
                            selectedOption === i ? 'bg-green-500' : 'bg-primary'
                          }`}>
                            {i + 1}
                          </div>
                          <span className="font-medium">{opt}</span>
                          {selectedOption === i && (
                            <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                              Your Choice
                            </span>
                          )}
                        </div>
                        <span className="text-lg font-bold">{pct}%</span>
                      </div>
                      <div className="h-3 w-full rounded-full bg-gray-200 overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-500 ${
                            selectedOption === i ? 'bg-green-500' : 'bg-primary'
                          }`} 
                          style={{ width: `${pct}%` }} 
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        <ChatWidget role="student" />
      </AppLayout>
    );
  }

  if (pollResult) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="bg-gray-800 text-white p-6">
                <div className="flex items-center justify-between">
                  <h1 className="text-xl font-semibold">Question</h1>
                  <div className="text-red-400 font-mono">⏱ 00:00</div>
                </div>
                <p className="text-gray-300 mt-2">{pollResult.question}</p>
              </div>

              <div className="p-6 space-y-4">
                {pollResult.options.map((option: string, index: number) => {
                  const votes = pollResult.votes[index] || 0;
                  const percentage = pollResult.totalVotes > 0 
                    ? Math.round((votes / pollResult.totalVotes) * 100) 
                    : 0;
                  const isCorrect = pollResult.correctAnswers?.includes(index);

                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`w-6 h-6 rounded-full mr-3 flex items-center justify-center text-white text-sm font-bold ${
                            isCorrect ? 'bg-green-500' : 'bg-purple-600'
                          }`}>
                            {String.fromCharCode(65 + index)}
                          </div>
                          <span className="text-gray-900 font-medium">{option}</span>
                        </div>
                        <span className="text-sm font-bold text-gray-900">{percentage}%</span>
                      </div>
                      <div className="ml-9">
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className={`h-3 rounded-full ${
                              isCorrect ? 'bg-green-500' : 'bg-purple-600'
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-6 pt-0">
                <p className="text-center text-gray-600">Wait for the teacher to ask a new question.</p>
              </div>
            </div>
          </div>
        </div>
        <ChatWidget role="student" />
      </AppLayout>
    );
  }

  // Show message for students who didn't vote when poll ended
  if (!hasVoted && !currentPoll && !pollResult) {
    // This could be either waiting for new poll or they missed the previous one
    // We need to check if we just came from a results phase
    // For now, let's show a generic waiting message
    return (
      <AppLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center">
            <div className="bg-white rounded-2xl shadow-lg p-12">
              <div className="mb-6">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                  📋 Intervue Poll
                </span>
              </div>
              <div className="animate-spin w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full mx-auto mb-6"></div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Wait for the teacher to ask questions..</h2>
              <div className="text-sm text-gray-500 mt-8">
                Connected as: <span className="font-medium text-purple-600">{studentName}</span>
              </div>
            </div>
          </div>
        </div>
        <ChatWidget role="student" />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-2xl shadow-lg p-12">
            <div className="mb-6">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                📋 Intervue Poll
              </span>
            </div>
            <div className="animate-spin w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Wait for the teacher to ask questions..</h2>
            <div className="text-sm text-gray-500 mt-8">
              Connected as: <span className="font-medium text-purple-600">{studentName}</span>
            </div>
          </div>
        </div>
      </div>
      <ChatWidget role="student" />
    </AppLayout>
  );
}
