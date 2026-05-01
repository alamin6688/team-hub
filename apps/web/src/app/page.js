import Link from "next/link";
import { ArrowRight, Layout, Users, Zap, Shield, Rocket } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 glass border-b border-slate-200/50">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <Layout className="text-white" size={22} />
            </div>
            <span className="font-bold text-2xl tracking-tight text-slate-900">TeamHub</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-indigo-600 transition-colors">Features</a>
            <a href="#solutions" className="hover:text-indigo-600 transition-colors">Solutions</a>
            <a href="#pricing" className="hover:text-indigo-600 transition-colors">Pricing</a>
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm font-semibold text-slate-700 hover:text-indigo-600">
              Log in
            </Link>
            <Link href="/dashboard" className="btn-primary py-2 px-5 text-sm">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="pt-32 pb-20 px-6">
          <div className="container mx-auto text-center max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-bold mb-8 animate-fade-in">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              NEW: REAL-TIME KANBAN BOARDS
            </div>
            <h1 className="text-6xl md:text-7xl font-extrabold text-slate-900 mb-6 tracking-tight">
              Collaborate without <span className="text-indigo-600">friction.</span>
            </h1>
            <p className="text-xl text-slate-500 mb-10 leading-relaxed max-w-2xl mx-auto">
              TeamHub brings your goals, tasks, and team together in one beautiful, 
              high-performance workspace. Build faster, together.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/dashboard" className="btn-primary text-lg group">
                Start for free
                <ArrowRight className="inline-block ml-2 group-hover:translate-x-1 transition-transform" size={20} />
              </Link>
              <button className="px-6 py-3 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-all">
                View Demo
              </button>
            </div>

            {/* App Preview Mockup */}
            <div className="mt-20 relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[2.5rem] blur opacity-20 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-white rounded-[2rem] border border-slate-200 shadow-2xl overflow-hidden p-4">
                <div className="bg-slate-50 rounded-xl aspect-[16/9] flex items-center justify-center border border-slate-100">
                   <Layout className="text-slate-200" size={120} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-24 bg-white">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Everything you need to ship</h2>
              <p className="text-slate-500">Powerful tools designed for modern product teams.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-12">
              {[
                {
                  icon: Zap,
                  title: "Real-time Sync",
                  desc: "Changes reflect instantly across all team members' screens."
                },
                {
                  icon: Users,
                  title: "Team Directory",
                  desc: "Manage roles, permissions, and profiles in one central hub."
                },
                {
                  icon: Shield,
                  title: "Secure by Design",
                  desc: "Enterprise-grade encryption for all your sensitive project data."
                }
              ].map((feature, i) => (
                <div key={i} className="group p-8 rounded-2xl hover:bg-slate-50 transition-colors">
                  <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <feature.icon size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                  <p className="text-slate-500 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 bg-slate-50 border-t border-slate-200">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 opacity-50">
            <Layout size={20} />
            <span className="font-bold">TeamHub</span>
          </div>
          <p className="text-sm text-slate-400">© 2026 TeamHub Inc. Built for the future of work.</p>
        </div>
      </footer>
    </div>
  );
}
