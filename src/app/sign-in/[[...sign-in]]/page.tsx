import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-800">
      <div className="flex flex-col items-center space-y-8 p-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold genz-gradient bg-clip-text text-transparent">
            GenZ Memories
          </h1>
          <p className="text-gray-400 text-lg max-w-md">
            Preserve the voice of change. Document the movements that matter.
          </p>
        </div>
        <div className="bg-gray-800/50 p-8 rounded-2xl border border-gray-700 backdrop-blur-sm">
          <SignIn 
            appearance={{
              variables: {
                colorPrimary: '#8B5CF6',
                colorBackground: '#1f2937',
                colorInputBackground: '#374151',
                colorInputText: '#f9fafb',
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}