export default function Page() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-4">Ideation Hub API</h1>
      <p className="text-lg text-gray-600">Welcome to the Ideation Hub API service.</p>
      <div className="mt-8 p-6 bg-gray-100 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">Available Endpoints:</h2>
        <ul className="space-y-2">
          <li className="text-gray-700">• GET /api/groq/test - Test API connection</li>
          <li className="text-gray-700">• POST /api/groq/generate-idea - Generate business ideas</li>
          <li className="text-gray-700">• POST /api/groq/analyze-ideas - Analyze business ideas</li>
        </ul>
      </div>
    </main>
  );
} 