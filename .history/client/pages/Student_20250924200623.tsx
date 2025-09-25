import { useEffect, useState } from 'react';
import { getSocket } from '../lib/socket';
import AppLayout from '../components/AppLayout';

export default function Student() {
  const [studentName, setStudentName] = useState('');
  const [currentPoll, setCurrentPoll] = useState<any>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [isKicked, setIsKicked] = useState(false);
  const [pollResult, setPollResult] = useState<any>(null);

  useEffect(() => {
    const socket = getSocket();
    
    const handleNewPoll = (poll: any) => {
      setCurrentPoll(poll);
      setSelectedOption(null);
      setHasVoted(false);
      setPollResult(null);
    };

    const handlePollEnded = (result: any) => {
      setCurrentPoll(null);
      setPollResult(result);
      setHasVoted(false);
    };

    const handleKicked = () => {
      setIsKicked(true);
      setCurrentPoll(null);
      setPollResult(null);
    };

    socket.on('poll:new', handleNewPoll);
    socket.on('poll:ended', handlePollEnded);
    socket.on('student:kicked', handleKicked);

    return () => {
      socket.off('poll:new', handleNewPoll);
      socket.off('poll:ended', handlePollEnded);
      socket.off('student:kicked', handleKicked);
    };
  }, []);

  const handleJoinSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (studentName.trim()) {
      const socket = getSocket();
      socket.emit('student:join', studentName.trim());
    }
  };

  const handleVote = () => {
    if (selectedOption !== null && currentPoll) {
      const socket = getSocket();
      socket.emit('poll:vote', { optionIndex: selectedOption });
      setHasVoted(true);
    }
  };

  if (isKicked) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-purple-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center">
            <div className="bg-white rounded-xl shadow-lg border border-purple-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Session Ended</h2>
              <p className="text-gray-600 mb-6">You have been removed from the session</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Rejoin Session
              </button>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!studentName) {
    return (
      <AppLayout>
        <div className="max-w-md mx-auto mt-20">
          <form onSubmit={handleJoinSession} className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold mb-2">Student Poll</h1>
              <p className="text-gray-600 mb-6">Enter your name to participate</p>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Your name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-medium transition-colors"
            >
              Join Session
            </button>
          </form>
        </div>
      </AppLayout>
    );
  }

  if (currentPoll && !hasVoted) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto mt-10">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h1 className="text-2xl font-bold text-center mb-8">Live Poll</h1>
            <h2 className="text-xl font-semibold mb-6 text-center">{currentPoll.question}</h2>
            
            <div className="space-y-4 mb-8">
              {currentPoll.options.map((option: string, index: number) => (
                <label
                  key={index}
                  className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedOption === index
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="poll-option"
                      value={index}
                      checked={selectedOption === index}
                      onChange={() => setSelectedOption(index)}
                      className="hidden"
                    />
                    <div className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center ${
                      selectedOption === index
                        ? 'border-purple-500 bg-purple-500'
                        : 'border-gray-300'
                    }`}>
                      {selectedOption === index && (
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      )}
                    </div>
                    <span className="text-lg">{option}</span>
                  </div>
                </label>
              ))}
            </div>

            <div className="text-center">
              <button
                onClick={handleVote}
                disabled={selectedOption === null}
                className="px-8 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white rounded-lg font-medium"
              >
                Submit Vote
              </button>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (hasVoted && currentPoll) {
    return (
      <AppLayout>
        <div className="max-w-md mx-auto mt-20 text-center">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Vote Submitted!</h2>
            <p className="text-gray-600 mb-6">Waiting for other students...</p>
            <div className="text-sm text-gray-500">
              Your answer: <span className="font-medium text-purple-600">
                {currentPoll.options[selectedOption!]}
              </span>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (pollResult) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto mt-10">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h1 className="text-2xl font-bold text-center mb-8">Poll Results</h1>
            <h2 className="text-xl font-semibold mb-6 text-center">{pollResult.question}</h2>
            
            <div className="space-y-4 mb-8">
              {pollResult.options.map((option: string, index: number) => {
                const votes = pollResult.votes[index] || 0;
                const percentage = pollResult.totalVotes > 0 
                  ? Math.round((votes / pollResult.totalVotes) * 100) 
                  : 0;
                const isCorrect = pollResult.correctAnswers?.includes(index);

                return (
                  <div
                    key={index}
                    className={`p-4 border-2 rounded-lg ${
                      isCorrect
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <span className="text-lg mr-2">{option}</span>
                        {isCorrect && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                            Correct
                          </span>
                        )}
                      </div>
                      <span className="text-sm font-medium text-gray-600">
                        {votes} votes ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          isCorrect ? 'bg-green-500' : 'bg-purple-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="text-center text-sm text-gray-500">
              Total votes: {pollResult.totalVotes}
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-md mx-auto mt-20 text-center">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Waiting for Poll</h2>
          <p className="text-gray-600 mb-6">Your teacher will start a poll soon...</p>
          <div className="text-sm text-gray-500">
            Connected as: <span className="font-medium text-purple-600">{studentName}</span>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
