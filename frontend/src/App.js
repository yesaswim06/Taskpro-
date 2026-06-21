import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Moon, Sun, Plus, Trash2, Bell, LogOut, Calendar, Zap, Search, Timer, 
  Trophy, Tag, Check, User, Palette, Star, X, Settings, Info, Mail, Phone, ExternalLink, Edit3, Quote, Rocket, Shield, Cpu, Code
} from 'lucide-react';

const API = "https://taskpro.up.railway.app/api";

const AppContent = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [darkMode, setDarkMode] = useState(true);
  const [themeColor, setThemeColor] = useState('indigo');
  const [selectedAvatar, setSelectedAvatar] = useState('Felix');
  
  // UI States
  const [showProfile, setShowProfile] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState('All');
  const [isRegister, setIsRegister] = useState(false);

  // Task States
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskDate, setTaskDate] = useState('');
  const [priority, setPriority] = useState('Medium');

  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const avatars = ['Felix', 'Aneka', 'Milo', 'Buddy', 'Cookie', 'Willow', 'Jasper', 'Zoe'];

  const themes = {
    indigo: "text-indigo-500 bg-indigo-600 border-indigo-500 ring-indigo-500",
    emerald: "text-emerald-500 bg-emerald-600 border-emerald-500 ring-emerald-500",
    rose: "text-rose-500 bg-rose-600 border-rose-500 ring-rose-500",
    amber: "text-amber-500 bg-amber-600 border-amber-500 ring-amber-500"
  };

  const loadTasks = useCallback(async (token) => {
    try {
      const res = await axios.get(`${API}/tasks`, { headers: { 'x-auth-token': token } });
      setTasks(res.data);
    } catch (err) { console.error(err); }
  }, []);

  // Restore State from DB/Local on Start
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
        setUser({ name: localStorage.getItem('userName') });
        setThemeColor(localStorage.getItem('themeColor') || 'indigo');
        setSelectedAvatar(localStorage.getItem('userAvatar') || 'Felix');
        loadTasks(token);
    }
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode, loadTasks]);

  // --- SAVE TO DATABASE FUNCTION ---
  const saveToCloud = async (n, t, a) => {
    const token = localStorage.getItem('token');
    try {
      await axios.put(`${API}/auth/update-profile`, { name: n, themeColor: t, avatarSeed: a }, { headers: {'x-auth-token': token} });
      localStorage.setItem('userName', n);
      localStorage.setItem('themeColor', t);
      localStorage.setItem('userAvatar', a);
    } catch (err) { console.log("Database Sync Failed"); }
  };

  const handleAuth = async (e, form) => {
    e.preventDefault();
    try {
      const url = isRegister ? `${API}/auth/register` : `${API}/auth/login`;
      const res = await axios.post(url, form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('userName', res.data.user.name);
      localStorage.setItem('themeColor', res.data.user.themeColor || 'indigo');
      localStorage.setItem('userAvatar', res.data.user.avatarSeed || 'Felix');
      window.location.href = "/dashboard";
    } catch (err) { alert("Auth Error: Is Railway Running?"); }
  };

  const addTask = async (e) => {
    e.preventDefault();
    if (!taskTitle || !taskDate) return;
    const token = localStorage.getItem('token');
    await axios.post(`${API}/tasks`, { title: taskTitle, description: taskDesc, dueDate: taskDate, priority }, { headers: { 'x-auth-token': token } });
    loadTasks(token);
    setTaskTitle(''); setTaskDesc('');
    alert("Deployed! Email Confirmation Sent.");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-all duration-500 font-sans text-slate-900 dark:text-white">
      {/* --- RE-ENABLED NAVBAR --- */}
      <nav className="glass sticky top-0 z-50 px-6 md:px-12 py-4 flex justify-between items-center border-b dark:border-white/5 shadow-xl">
        <div className="flex items-center gap-10">
          <Link to="/" className={`flex items-center gap-2 font-black text-3xl tracking-tighter ${themes[themeColor].split(' ')[0]}`}>
            <Zap fill="currentColor" size={28}/> TaskPro
          </Link>
          <div className="hidden md:flex gap-8 text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400">
             <Link to="/" className="hover:text-indigo-500 transition flex items-center gap-2"><HomeIcon size={14}/> Home</Link>
             <Link to="/about" className="hover:text-indigo-500 transition flex items-center gap-2"><Info size={14}/> About</Link>
             <Link to="/contact" className="hover:text-indigo-500 transition flex items-center gap-2"><Mail size={14}/> Support</Link>
             {user && <Link to="/dashboard" className="text-indigo-500 underline">Dashboard</Link>}
          </div>
        </div>
        <div className="flex items-center gap-5">
          <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-xl bg-gray-100 dark:bg-slate-900 hover:rotate-12 transition-all">
            {darkMode ? <Sun size={20} className="text-yellow-400"/> : <Moon size={20}/>}
          </button>
          {user && (
            <button onClick={() => setShowProfile(!showProfile)} className={`flex items-center gap-2 p-1 pr-4 bg-gray-100 dark:bg-slate-900 rounded-full ring-2 ${themes[themeColor].split(' ')[4]} transition-all`}>
              <img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${selectedAvatar}`} className="w-9 h-9 rounded-full bg-slate-800" alt="p" />
              <User size={14} className="sm:hidden text-gray-400" />
              <span className="text-[10px] font-black uppercase hidden md:block">{user.name.split(' ')[0]}</span>
            </button>
          )}
        </div>
      </nav>

      {/* --- SETTINGS SIDEBAR (PROFILE SYNC) --- */}
      <AnimatePresence>
        {showProfile && user && (
          <motion.div initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 100 }} className="fixed right-6 top-24 w-80 glass p-8 rounded-[3rem] z-[100] shadow-2xl border dark:border-white/10">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-xs font-black uppercase text-gray-400 flex items-center gap-2"><Settings size={14}/> Profile Cloud</h4>
              <X size={20} className="cursor-pointer text-red-500" onClick={() => setShowProfile(false)} />
            </div>
            <div className="mb-6 bg-slate-100 dark:bg-slate-800 p-4 rounded-2xl">
              {isEditingName ? (
                <div className="flex gap-2">
                  <input className="bg-transparent border-b border-indigo-500 outline-none text-sm w-full dark:text-white font-bold" value={newName} onChange={e => setNewName(e.target.value)} />
                  <Check size={18} className="text-green-500 cursor-pointer" onClick={() => { setUser({...user, name: newName}); setIsEditingName(false); saveToCloud(newName, themeColor, selectedAvatar); }} />
                </div>
              ) : (
                <div className="flex justify-between items-center text-white">
                  <span className="text-sm font-bold">{user.name}</span>
                  <Edit3 size={14} className="text-indigo-500 cursor-pointer" onClick={() => { setIsEditingName(true); setNewName(user.name); }} />
                </div>
              )}
            </div>
            <div className="grid grid-cols-4 gap-2 mb-6">
               {avatars.map(a => <button key={a} onClick={() => {setSelectedAvatar(a); saveToCloud(user.name, themeColor, a);}} className={`p-1 rounded-xl ${selectedAvatar === a ? 'ring-2 ring-white bg-indigo-500 shadow-xl' : 'bg-slate-700'}`}><img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${a}`} alt="a"/></button>)}
            </div>
            <div className="flex gap-4 mb-8">
              {Object.keys(themes).map(c => <button key={c} onClick={() => {setThemeColor(c); saveToCloud(user.name, c, selectedAvatar);}} className={`w-8 h-8 rounded-full ${themes[c].split(' ')[1]} ${themeColor === c ? 'ring-4 ring-white' : ''}`} />)}
            </div>
            <button onClick={() => {localStorage.clear(); window.location.href="/";}} className="w-full p-4 rounded-2xl bg-red-500 text-white font-black flex items-center justify-center gap-2 shadow-xl shadow-red-500/20"><LogOut size={18}/> End Session</button>
          </motion.div>
        )}
      </AnimatePresence>

      <Routes>
        {/* --- HOME PAGE --- */}
        <Route path="/" element={
            <div className="min-h-[85vh] flex flex-col items-center justify-center text-center px-6">
                <div className="bg-indigo-600/10 text-indigo-500 px-6 py-2 rounded-full text-xs font-black mb-8 uppercase tracking-[0.3em] border border-indigo-500/20">The Productivity Standard</div>
                <h1 className="text-9xl font-black mb-6 dark:text-white tracking-tighter italic">TASK<span className="text-indigo-600">PRO</span></h1>
                <p className="max-w-2xl text-gray-500 text-3xl mb-12 font-medium italic">"Win the morning, win the day."</p>
                <Link to={user ? "/dashboard" : "/login"} className="bg-indigo-600 text-white px-14 py-7 rounded-[2.5rem] font-black text-2xl shadow-3xl hover:scale-110 transition-all">Get Access</Link>
                <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80" className="w-full max-w-4xl rounded-[4rem] mt-20 opacity-20 grayscale pointer-events-none" alt="home-bg" />
            </div>
        } />

        {/* --- ABOUT PAGE (CREDITING YESASWI) --- */}
        <Route path="/about" element={
            <div className="max-w-6xl mx-auto py-20 px-6 text-center">
                <h1 className="text-7xl font-black mb-10 tracking-tighter uppercase">Developed by <span className="text-indigo-500">Yesaswi</span></h1>
                <div className="grid md:grid-cols-3 gap-10">
                    <div className="glass p-10 rounded-[3.5rem] border-t-[12px] border-indigo-600 shadow-2xl"><Shield className="text-indigo-500 mb-6 mx-auto" size={40}/><h4 className="text-xl font-black mb-2">JWT Security</h4><p className="text-sm text-gray-400 leading-relaxed font-medium">Secured with RSA encryption protocols.</p></div>
                    <div className="glass p-10 rounded-[3.5rem] border-t-[12px] border-emerald-600 shadow-2xl"><Rocket className="text-emerald-500 mb-6 mx-auto" size={40}/><h4 className="text-xl font-black mb-2">Cloud Native</h4><p className="text-sm text-gray-400 leading-relaxed font-medium">Native MongoDB Atlas cluster integration.</p></div>
                    <div className="glass p-10 rounded-[3.5rem] border-t-[12px] border-amber-600 shadow-2xl"><Cpu className="text-amber-500 mb-6 mx-auto" size={40}/><h4 className="text-xl font-black mb-2">Automation</h4><p className="text-sm text-gray-400 leading-relaxed font-medium">Nodemailer real-time task dispatches.</p></div>
                </div>
                <div className="mt-20"><Palette size={40} className="mx-auto text-gray-500 opacity-20" /><Code size={40} className="mx-auto text-gray-500 opacity-20 mt-4" /><Star size={40} className="mx-auto text-gray-500 opacity-20 mt-4" /></div>
            </div>
        } />

        {/* --- CONTACT PAGE --- */}
        <Route path="/contact" element={
            <div className="max-w-xl mx-auto py-20 px-6 text-center">
                <Mail size={60} className="mx-auto text-indigo-500 mb-8" />
                <h2 className="text-5xl font-black mb-4 tracking-tighter uppercase">Support</h2>
                <p className="text-gray-500 font-bold mb-10">myselfadmin123@gmail.com</p>
                <form className="glass p-10 rounded-[3.5rem] space-y-4 shadow-2xl" onSubmit={(e)=>{e.preventDefault(); alert("Deployed to Support!")}}>
                    <input className="w-full p-5 glass rounded-3xl outline-none" placeholder="Context Title" required />
                    <textarea className="w-full p-5 glass rounded-3xl outline-none h-40" placeholder="Problem description..." required />
                    <button className="w-full bg-indigo-600 text-white p-5 rounded-3xl font-black">Contact Admin</button>
                    <Phone size={20} className="mx-auto text-gray-800 opacity-5 mt-4" />
                </form>
            </div>
        } />

        <Route path="/login" element={<div className="min-h-[85vh] flex items-center justify-center p-6"><AuthPage handleAuth={handleAuth} themes={themes} themeColor={themeColor} isRegister={isRegister} setIsRegister={setIsRegister} /></div>} />

        <Route path="/dashboard" element={!user ? <Navigate to="/login" /> : (
          <main className="max-w-7xl mx-auto p-4 md:p-12 grid lg:grid-cols-12 gap-12">
            <div className="lg:col-span-4 space-y-8">
              <div className={`p-10 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[300px] ${themes[themeColor].split(' ')[1]}`}>
                <div><h2 className="text-4xl font-black italic mb-2 tracking-tighter leading-none">Hello {user.name.split(' ')[0]}!</h2><p className="text-[11px] font-bold uppercase tracking-widest opacity-80 flex items-center gap-2 mb-6 leading-relaxed"><Quote size={14}/> High performance, low latency.</p></div>
                <div><div className="w-full bg-white/20 h-3 rounded-full overflow-hidden mb-6"><motion.div animate={{ width: `${progress}%` }} className="bg-white h-full shadow-[0_0_20px_white]" /></div><p className="text-[10px] font-black uppercase tracking-widest"><Trophy size={14} className="inline mr-1"/> {Math.round(progress)}% Mastery</p></div>
                <Zap size={120} className="absolute -right-6 -bottom-6 opacity-10 rotate-12" />
              </div>
              <form onSubmit={addTask} className="glass p-8 rounded-[3.5rem] space-y-4 border dark:border-white/5 shadow-2xl">
                <h3 className="font-black text-xs uppercase tracking-widest text-indigo-500 flex items-center gap-2 mb-2"><Plus size={16}/> New Task</h3>
                <input className="w-full p-5 bg-gray-50 dark:bg-slate-900 rounded-3xl outline-none dark:text-white focus:ring-2 ring-indigo-500 transition-all" placeholder="Project Name" value={taskTitle} onChange={e => setTaskTitle(e.target.value)} required />
                <textarea className="w-full p-5 bg-gray-50 dark:bg-slate-900 rounded-3xl outline-none dark:text-white h-24" placeholder="Description..." value={taskDesc} onChange={e => setTaskDesc(e.target.value)} />
                <div className="relative flex items-center"><Calendar className="absolute left-5 top-5 text-indigo-500" size={18}/><input type="date" className="w-full p-5 pl-14 bg-gray-50 dark:bg-slate-900 rounded-3xl outline-none dark:text-white" value={taskDate} onChange={e => setTaskDate(e.target.value)} required /></div>
                <button className={`w-full ${themes[themeColor].split(' ')[1]} text-white p-5 rounded-[2.5rem] font-black text-lg shadow-xl`}>Deploy Task</button>
              </form>
            </div>
            <div className="lg:col-span-8 space-y-8">
              <div className="flex flex-col md:flex-row gap-6 justify-between items-center bg-white dark:bg-slate-900 p-8 rounded-[3rem] shadow-xl border dark:border-white/5">
                <div className="relative w-full md:w-[24rem]"><Search className="absolute left-6 top-5 text-gray-500" size={20} /><input placeholder="Search projects..." className="w-full pl-16 p-5 glass rounded-full outline-none dark:text-white border-2 border-transparent focus:border-indigo-500 shadow-inner" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div>
                <div className="flex bg-gray-100 dark:bg-slate-800 px-8 py-4 rounded-full border dark:border-white/5 gap-6 items-center shadow-inner"><div className="flex items-center gap-3"><Timer size={24} className={isTimerRunning ? "animate-pulse text-indigo-500" : "text-gray-500"}/><span className="font-mono font-black text-2xl leading-none dark:text-white">25:00</span></div><button onClick={() => setTimeLeft(25*60)} className={`text-[10px] font-black uppercase py-2 px-4 rounded-xl ${themes[themeColor].split(' ')[1]} text-white shadow-xl shadow-current/20`}>Focus</button></div>
              </div>
              <div className="space-y-6 pb-20">
                <AnimatePresence mode='popLayout'>
                  {tasks.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()) && (filter === 'All' ? true : t.status === filter)).map(task => (
                    <motion.div key={task._id} layout className={`glass p-10 rounded-[3.5rem] flex flex-col md:flex-row md:items-center justify-between gap-8 border-l-[18px] border-indigo-600 shadow-4xl relative overflow-hidden`}>
                      <div className="flex items-start gap-10 flex-1">
                         <div className={`p-7 rounded-[2.5rem] shadow-2xl ${task.status === 'Completed' ? themes[themeColor].split(' ')[1] : 'bg-gray-100 dark:bg-slate-900'}`}><Check size={40}/></div>
                         <div>
                            <h4 className="text-3xl font-black italic dark:text-white uppercase tracking-tighter">{task.title}</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-bold mt-2 leading-relaxed">{task.description}</p>
                            <div className="flex gap-4 mt-6"><span className="text-[10px] font-black px-5 py-2 rounded-full bg-slate-100 dark:bg-slate-900 text-gray-500 uppercase tracking-widest"><Tag size={12} className="inline mr-1"/> Node</span><a href={`https://calendar.google.com`} target="_blank" rel="noreferrer" className="text-[10px] font-black uppercase text-indigo-500 hover:underline"><ExternalLink size={14} className="inline mr-1"/> Sync</a></div>
                         </div>
                      </div>
                      <button onClick={async () => { await axios.delete(`${API}/tasks/${task._id}`, { headers: {'x-auth-token': localStorage.getItem('token')} }); loadTasks(localStorage.getItem('token')); }} className="p-4 rounded-2xl text-red-500 bg-red-500/10 hover:bg-red-500 hover:text-white transition-all self-center"><Trash2 size={28}/></button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </main>
        )} />
      </Routes>
      <footer className="py-20 text-center text-gray-500 text-[10px] font-black uppercase tracking-[0.8em] border-t dark:border-white/5">TASKPRO ECOSYSTEM • INTERNSHIP PROJECT • 2026</footer>
    </div>
  );
};

// --- AUTH UI ---
const AuthPage = ({ handleAuth, themes, themeColor, isRegister, setIsRegister }) => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  return (
    <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="glass p-12 rounded-[3.5rem] w-full max-w-md shadow-2xl border dark:border-white/5 text-center relative z-10">
      <Zap size={40} className="mx-auto text-indigo-500 mb-4" fill="currentColor"/><h2 className="text-4xl font-black dark:text-white uppercase mb-8">TaskPro</h2>
      <form onSubmit={(e) => handleAuth(e, form)} className="space-y-4 text-left">
        {isRegister && <input className="w-full p-4 bg-gray-50 dark:bg-slate-900 rounded-2xl outline-none dark:text-white border border-white/10" placeholder="Student Name" onChange={e => setForm({...form, name: e.target.value})} required />}
        <input className="w-full p-4 bg-gray-100/10 dark:bg-slate-900 rounded-2xl outline-none dark:text-white border border-white/10" placeholder="Email" type="email" onChange={e => setForm({...form, email: e.target.value})} required />
        <input className="w-full p-4 bg-gray-100/10 dark:bg-slate-900 rounded-2xl outline-none dark:text-white border border-white/10" placeholder="Password" type="password" onChange={e => setForm({...form, password: e.target.value})} required />
        <button className={`w-full ${themes[themeColor].split(' ')[1]} text-white p-4 rounded-2xl font-black shadow-xl mt-4`}>Continue</button>
      </form>
      <button onClick={() => setIsRegister(!isRegister)} className="mt-6 text-[10px] font-black uppercase text-gray-400 underline">{isRegister ? "Login here" : "Create Account"}</button>
    </motion.div>
  );
};

export default function App() { return <Router><AppContent /></Router>; }