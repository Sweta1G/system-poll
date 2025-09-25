import { useEffect, useState } from 'react';import { useEffect, useState } from 'react';

import { getSocket } from '../lib/socket';import { getSocket } from '../lib/socket';

import AppLayout from '../components/AppLayout';import AppLayout from '../components/AppLayout';



export default function Student() {export default function Student() {

  const [studentName, setStudentName] = useState('');  const [studentName, setStudentName] = useState('');

  const [currentPoll, setCurrentPoll] = useState<any>(null);  const [currentPoll, setCurrentPoll] = useState<any>(null);

  const [selectedOption, setSelectedOption] = useState<number | null>(null);  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const [hasVoted, setHasVoted] = useState(false);  const [hasVoted, setHasVoted] = useState(false);

  const [isKicked, setIsKicked] = useState(false);  const [isKicked, setIsKicked] = useState(false);

  const [pollResult, setPollResult] = useState<any>(null);  const [pollResult, setPollResult] = useState<any>(null);



  useEffect(() => {  useEffect(() => {

    const socket = getSocket();    const socket = getSocket();

        

    const handleNewPoll = (poll: any) => {    const handleNewPoll = (poll: any) => {

      setCurrentPoll(poll);      setCurrentPoll(poll);

      setSelectedOption(null);      setSelectedOption(null);

      setHasVoted(false);      setHasVoted(false);

      setPollResult(null);      setPollResult(null);

    };    };



    const handlePollEnded = (result: any) => {    const handlePollEnded = (result: any) => {

      setCurrentPoll(null);      setCurrentPoll(null);

      setPollResult(result);      setPollResult(result);

      setHasVoted(false);      setHasVoted(false);

    };    };



    const handleKicked = () => {    const handleKicked = () => {

      setIsKicked(true);      setIsKicked(true);

      setCurrentPoll(null);      setCurrentPoll(null);

      setPollResult(null);      setPollResult(null);

    };    };



    socket.on('poll:new', handleNewPoll);    socket.on('poll:new', handleNewPoll);

    socket.on('poll:ended', handlePollEnded);    socket.on('poll:ended', handlePollEnded);

    socket.on('student:kicked', handleKicked);    socket.on('student:kicked', handleKicked);



    return () => {    return () => {

      socket.off('poll:new', handleNewPoll);      socket.off('poll:new', handleNewPoll);

      socket.off('poll:ended', handlePollEnded);      socket.off('poll:ended', handlePollEnded);

      socket.off('student:kicked', handleKicked);      socket.off('student:kicked', handleKicked);

    };    };

  }, []);  }, []);



  const handleJoinSession = (e: React.FormEvent) => {  const handleJoinSession = (e: React.FormEvent) => {

    e.preventDefault();    e.preventDefault();

    if (studentName.trim()) {    if (studentName.trim()) {

      const socket = getSocket();      const socket = getSocket();

      socket.emit('student:join', { name: studentName.trim() });      socket.emit('student:join', { name: studentName.trim() });

    }    }

  };  };



  const handleVote = () => {  const handleVote = () => {

    if (selectedOption !== null && currentPoll) {    if (selectedOption !== null && currentPoll) {

      const socket = getSocket();      const socket = getSocket();

      socket.emit('poll:vote', { optionIndex: selectedOption });      socket.emit('poll:vote', { optionIndex: selectedOption });

      setHasVoted(true);      setHasVoted(true);

    }    }

  };  };



  if (isKicked) {  if (isKicked) {

    return (    return (

      <AppLayout>      <AppLayout>

        <div className="min-h-screen bg-purple-50 flex items-center justify-center px-4">        <div className="min-h-screen bg-purple-50 flex items-center justify-center px-4">

          <div className="max-w-md w-full text-center">          <div className="max-w-md w-full text-center">

            <div className="bg-white rounded-xl shadow-lg border border-purple-200 p-8">            <div className="bg-white rounded-xl shadow-lg border border-purple-200 p-8">

              <h2 className="text-2xl font-bold text-gray-900 mb-4">Session Ended</h2>              <h2 className="text-2xl font-bold text-gray-900 mb-4">Session Ended</h2>

              <p className="text-gray-600 mb-6">You have been removed from the session</p>              <p className="text-gray-600 mb-6">You have been removed from the session</p>

              <button              <button

                onClick={() => window.location.reload()}                onClick={() => window.location.reload()}

                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"

              >              >

                Rejoin Session                Rejoin Session

              </button>              </button>

            </div>            </div>

          </div>          </div>

        </div>        </div>

      </AppLayout>      </AppLayout>

    );    );

  }  }



  if (!studentName) {  if (!studentName) {

    return (    return (

      <AppLayout>      <AppLayout>

        <div className="max-w-md mx-auto mt-20">        <div className="max-w-md mx-auto mt-20">

          <form onSubmit={handleJoinSession} className="space-y-6">          <form onSubmit={handleJoinSession} className="space-y-6">

            <div>            <div>

              <h1 className="text-2xl font-bold mb-2">Student Poll</h1>              <h1 className="text-2xl font-bold mb-2">Student Poll</h1>

              <p className="text-gray-600 mb-6">Enter your name to participate</p>              <p className="text-gray-600 mb-6">Enter your name to participate</p>

              <input              <input

                type="text"                type="text"

                value={studentName}                value={studentName}

                onChange={(e) => setStudentName(e.target.value)}                onChange={(e) => setStudentName(e.target.value)}

                placeholder="Your name"                placeholder="Your name"

                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"

                required                required

              />              />

            </div>            </div>

            <button            <button

              type="submit"              type="submit"

              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-medium transition-colors"              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-medium transition-colors"

            >            >

              Join Session              Join Session

            </button>            </button>

          </form>          </form>

        </div>        </div>

      </AppLayout>      </AppLayout>

    );    );

  }  }



  if (currentPoll && !hasVoted) {  if (currentPoll && !hasVoted) {

    return (    return (

      <AppLayout>      <AppLayout>

        <div className="max-w-2xl mx-auto mt-10">        <div className="max-w-2xl mx-auto mt-10">

          <div className="bg-white rounded-xl shadow-lg p-8">          <div className="bg-white rounded-xl shadow-lg p-8">

            <h1 className="text-2xl font-bold text-center mb-8">Live Poll</h1>            <h1 className="text-2xl font-bold text-center mb-8">Live Poll</h1>

            <h2 className="text-xl font-semibold mb-6 text-center">{currentPoll.question}</h2>            <h2 className="text-xl font-semibold mb-6 text-center">{currentPoll.question}</h2>

                        

            <div className="space-y-4 mb-8">            <div className="space-y-4 mb-8">

              {currentPoll.options.map((option: string, index: number) => (              {currentPoll.options.map((option: string, index: number) => (

                <label                <label

                  key={index}                  key={index}

                  className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${                  className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${

                    selectedOption === index                    selectedOption === index

                      ? 'border-purple-500 bg-purple-50'                      ? 'border-purple-500 bg-purple-50'

                      : 'border-gray-200 hover:border-purple-300'                      : 'border-gray-200 hover:border-purple-300'

                  }`}                  }`}

                >                >

                  <div className="flex items-center">                  <div className="flex items-center">

                    <input                    <input

                      type="radio"                      type="radio"

                      name="poll-option"                      name="poll-option"

                      value={index}                      value={index}

                      checked={selectedOption === index}                      checked={selectedOption === index}

                      onChange={() => setSelectedOption(index)}                      onChange={() => setSelectedOption(index)}

                      className="hidden"                      className="hidden"

                    />                    />

                    <div className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center ${                    <div className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center ${

                      selectedOption === index                      selectedOption === index

                        ? 'border-purple-500 bg-purple-500'                        ? 'border-purple-500 bg-purple-500'

                        : 'border-gray-300'                        : 'border-gray-300'

                    }`}>                    }`}>

                      {selectedOption === index && (                      {selectedOption === index && (

                        <div className="w-2 h-2 rounded-full bg-white"></div>                        <div className="w-2 h-2 rounded-full bg-white"></div>

                      )}                      )}

                    </div>                    </div>

                    <span className="text-lg">{option}</span>                    <span className="text-lg">{option}</span>

                  </div>                  </div>

                </label>                </label>

              ))}              ))}

            </div>            </div>



            <div className="text-center">            <div className="text-center">

              <button              <button

                onClick={handleVote}                onClick={handleVote}

                disabled={selectedOption === null}                disabled={selectedOption === null}

                className="px-8 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white rounded-lg font-medium"                className="px-8 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white rounded-lg font-medium"

              >              >

                Submit Vote                Submit Vote

              </button>              </button>

            </div>            </div>

          </div>          </div>

        </div>        </div>

      </AppLayout>      </AppLayout>

    );    );

  }  }



  if (hasVoted && currentPoll) {  if (hasVoted && currentPoll) {

    return (    return (

      <AppLayout>      <AppLayout>

        <div className="max-w-md mx-auto mt-20 text-center">        <div className="max-w-md mx-auto mt-20 text-center">

          <div className="bg-white rounded-xl shadow-lg p-8">          <div className="bg-white rounded-xl shadow-lg p-8">

            <h2 className="text-2xl font-bold text-gray-900 mb-4">Vote Submitted!</h2>            <h2 className="text-2xl font-bold text-gray-900 mb-4">Vote Submitted!</h2>

            <p className="text-gray-600 mb-6">Waiting for other students...</p>            <p className="text-gray-600 mb-6">Waiting for other students...</p>

            <div className="text-sm text-gray-500">            <div className="text-sm text-gray-500">

              Your answer: <span className="font-medium text-purple-600">              Your answer: <span className="font-medium text-purple-600">

                {currentPoll.options[selectedOption!]}                {currentPoll.options[selectedOption!]}

              </span>              </span>

            </div>            </div>

          </div>          </div>

        </div>        </div>

      </AppLayout>      </AppLayout>

    );    );

  }  }



  if (pollResult) {  if (pollResult) {

    return (    return (

      <AppLayout>      <AppLayout>

        <div className="max-w-2xl mx-auto mt-10">        <div className="max-w-2xl mx-auto mt-10">

          <div className="bg-white rounded-xl shadow-lg p-8">          <div className="bg-white rounded-xl shadow-lg p-8">

            <h1 className="text-2xl font-bold text-center mb-8">Poll Results</h1>            <h1 className="text-2xl font-bold text-center mb-8">Poll Results</h1>

            <h2 className="text-xl font-semibold mb-6 text-center">{pollResult.question}</h2>            <h2 className="text-xl font-semibold mb-6 text-center">{pollResult.question}</h2>

                        

            <div className="space-y-4 mb-8">            <div className="space-y-4 mb-8">

              {pollResult.options.map((option: string, index: number) => {              {pollResult.options.map((option: string, index: number) => {

                const votes = pollResult.votes[index] || 0;                const votes = pollResult.votes[index] || 0;

                const percentage = pollResult.totalVotes > 0                 const percentage = pollResult.totalVotes > 0 

                  ? Math.round((votes / pollResult.totalVotes) * 100)                   ? Math.round((votes / pollResult.totalVotes) * 100) 

                  : 0;                  : 0;

                const isCorrect = pollResult.correctAnswers?.includes(index);                const isCorrect = pollResult.correctAnswers?.includes(index);



                return (                return (

                  <div                  <div

                    key={index}                    key={index}

                    className={`p-4 border-2 rounded-lg ${                    className={`p-4 border-2 rounded-lg ${

                      isCorrect                      isCorrect

                        ? 'border-green-500 bg-green-50'                        ? 'border-green-500 bg-green-50'

                        : 'border-gray-200 bg-gray-50'                        : 'border-gray-200 bg-gray-50'

                    }`}                    }`}

                  >                  >

                    <div className="flex items-center justify-between mb-2">                    <div className="flex items-center justify-between mb-2">

                      <div className="flex items-center">                      <div className="flex items-center">

                        <span className="text-lg mr-2">{option}</span>                        <span className="text-lg mr-2">{option}</span>

                        {isCorrect && (                        {isCorrect && (

                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">

                            Correct                            Correct

                          </span>                          </span>

                        )}                        )}

                      </div>                      </div>

                      <span className="text-sm font-medium text-gray-600">                      <span className="text-sm font-medium text-gray-600">

                        {votes} votes ({percentage}%)                        {votes} votes ({percentage}%)

                      </span>                      </span>

                    </div>                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2">                    <div className="w-full bg-gray-200 rounded-full h-2">

                      <div                      <div

                        className={`h-2 rounded-full ${                        className={`h-2 rounded-full ${

                          isCorrect ? 'bg-green-500' : 'bg-purple-500'                          isCorrect ? 'bg-green-500' : 'bg-purple-500'

                        }`}                        }`}

                        style={{ width: `${percentage}%` }}                        style={{ width: `${percentage}%` }}

                      />                      />

                    </div>                    </div>

                  </div>                  </div>

                );                );

              })}              })}

            </div>            </div>



            <div className="text-center text-sm text-gray-500">            <div className="text-center text-sm text-gray-500">

              Total votes: {pollResult.totalVotes}              Total votes: {pollResult.totalVotes}

            </div>            </div>

          </div>          </div>

        </div>        </div>

      </AppLayout>      </AppLayout>

    );    );

  }  }



  return (  return (

    <AppLayout>    <AppLayout>

      <div className="max-w-md mx-auto mt-20 text-center">      <div className="max-w-md mx-auto mt-20 text-center">

        <div className="bg-white rounded-xl shadow-lg p-8">        <div className="bg-white rounded-xl shadow-lg p-8">

          <h2 className="text-2xl font-bold text-gray-900 mb-4">Waiting for Poll</h2>          <h2 className="text-2xl font-bold text-gray-900 mb-4">Waiting for Poll</h2>

          <p className="text-gray-600 mb-6">Your teacher will start a poll soon...</p>          <p className="text-gray-600 mb-6">Your teacher will start a poll soon...</p>

          <div className="text-sm text-gray-500">          <div className="text-sm text-gray-500">

            Connected as: <span className="font-medium text-purple-600">{studentName}</span>            Connected as: <span className="font-medium text-purple-600">{studentName}</span>

          </div>          </div>

        </div>        </div>

      </div>      </div>

    </AppLayout>    </AppLayout>

  );  );

}}

  // Kicked State - Purple themed error screen
  if (isKicked) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-purple-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full">
            <div className="bg-white rounded-xl shadow-lg border border-purple-200 p-8 text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Session Ended</h2>
              <p className="text-gray-600 mb-6">{kickReason}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Join New Session
              </button>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Join Session State - Clean input form
  if (!isConnected || !studentName) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Join Polling Session</h1>
                <p className="text-gray-600">Enter your name to participate in live polls</p>
              </div>
              
              <form onSubmit={handleJoinSession} className="space-y-6">
                <div>
                  <label htmlFor="studentName" className="block text-sm font-medium text-gray-700 mb-2">
                    Your Name
                  </label>
                  <input
                    id="studentName"
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-colors"
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={!studentName.trim()}
                  className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition-colors"
                >
                  Join Session
                </button>
              </form>
              
              <div className="mt-6 text-center">
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                  isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    isConnected ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  {isConnected ? 'Connected' : 'Connecting...'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Waiting State - No active poll
  if (!currentPoll && !pollResult) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full">
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-blue-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Waiting for Poll</h2>
              <p className="text-gray-600 mb-6">Your teacher will start a poll soon. Please wait...</p>
              <div className="text-sm text-gray-500">
                Connected as: <span className="font-medium text-purple-600">{studentName}</span>
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Active Poll State - Student can vote
  if (currentPoll && !hasVoted) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-gray-50 py-8 px-4">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Live Poll</h1>
                <p className="text-gray-600">Select your answer below</p>
              </div>

              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">
                  {currentPoll.question}
                </h2>

                <div className="space-y-4">
                  {currentPoll.options.map((option, index) => (
                    <label
                      key={index}
                      className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedOption === index
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300 hover:bg-purple-25'
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
                        <span className="text-lg text-gray-800">{option}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="text-center">
                <button
                  onClick={handleVote}
                  disabled={selectedOption === null}
                  className="px-8 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                >
                  Submit Vote
                </button>
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Voted State - Waiting for results
  if (currentPoll && hasVoted) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full">
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Vote Submitted!</h2>
              <p className="text-gray-600 mb-6">Thank you for voting. Waiting for other students...</p>
              <div className="text-sm text-gray-500">
                Your answer: <span className="font-medium text-purple-600">
                  {currentPoll.options[selectedOption!]}
                </span>
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Results State - Show poll results with correct answers
  if (pollResult) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-gray-50 py-8 px-4">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Poll Results</h1>
                <p className="text-gray-600">Here's how everyone voted</p>
              </div>

              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">
                  {pollResult.question}
                </h2>

                <div className="space-y-4">
                  {pollResult.options.map((option, index) => {
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
                            <span className="text-lg text-gray-800 mr-2">{option}</span>
                            {isCorrect && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Correct
                              </span>
                            )}
                          </div>
                          <span className="text-sm font-medium text-gray-600">
                            {votes} vote{votes !== 1 ? 's' : ''} ({percentage}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-500 ${
                              isCorrect ? 'bg-green-500' : 'bg-purple-500'
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="text-center text-sm text-gray-500">
                Total votes: {pollResult.totalVotes}
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return null;
}
