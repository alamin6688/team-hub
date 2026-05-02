export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#1a1a2e] relative flex items-center justify-center p-6 overflow-hidden">
      {/* Mesh Gradient Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#e94560]/10 rounded-full blur-[120px]"></div>
      
      <div className="relative z-10 w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-[#e94560] rounded-xl flex items-center justify-center shadow-lg shadow-[#e94560]/20">
              <svg className="text-white w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <span className="font-bold text-2xl tracking-tight text-white">TeamHub</span>
          </div>
        </div>
        
        <div className="bg-white rounded-3xl p-8 md:p-10 shadow-2xl">
          {children}
        </div>
      </div>
    </div>
  );
}
