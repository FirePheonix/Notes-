import { ClerkProvider, SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';
import { ChatProvider } from './contexts/ChatContext';
import DrawingApp from './DrawingApp';

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

function App() {
  if (!clerkPubKey) {
    throw new Error('Missing Clerk Publishable Key');
  }

  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <div className="h-screen bg-gray-100">
        <SignedOut>
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-800 mb-8">
                Welcome to Notesलो
              </h1>
              <p className="text-gray-600 mb-8">
                Sign in to start creating and saving your notes.
              </p>
              <SignInButton mode="modal">
                <button className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                  Sign In to Get Started.
                </button>
              </SignInButton>
            </div>
          </div>
        </SignedOut>
        
        <SignedIn>
          <ChatProvider>
            <div className="flex h-full">
              {/* User button in top right */}
              <div className="absolute top-4 right-4 z-50">
                <UserButton afterSignOutUrl="/" />
              </div>
              
              {/* Main drawing application */}
              <DrawingApp />
            </div>
          </ChatProvider>
        </SignedIn>
      </div>
    </ClerkProvider>
  );
}

export default App;
