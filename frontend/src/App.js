import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Moon, Sun, Plus, Trash2, Bell, LogOut, Calendar, Zap, Search, Timer, 
  Trophy, Tag, Check, User, Palette, Star, X, Settings, Info, Mail, Phone, ExternalLink, Edit3, Quote, Code, Shield, Rocket, Cpu, Home as HomeIcon 
} from 'lucide-react';

const API = "https://taskpro.up.railway.app/api";

const AppContent = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    const savedName = localStorage.getItem('userName');
    return savedName ? { name: savedName } : null;
  });
  
  const [tasks, setTasks] = useState([]);
  const [darkMode, setDarkMode] = useState(true);
  const [themeColor, setThemeColor] = useState(localStorage.getItem('themeColor') || 'indigo');
  const [selectedAvatar, setSelectedAvatar] = useState(localStorage.getItem('userAvatar') || 'Felix');
  
  // UI States
  const [showProfile, setShowProfile] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState('All');
  const [isRegister, setIsRegister] = useState(false);
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });

  // Task States
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskDate, setTaskDate] = useState('');
  const [priority, setPriority] = useState('Medium');

  // Pomodoro
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const avatars = ['Felix', 'Aneka', 'Milo', 'Buddy', 'Cookie', 'Willow', 'Jasper', 'Zoe'];
  const themes = {
    indigo: "text-indigo-500 bg-indigo-600 border-indigo-500 ring-indigo-500 shadow-indigo-500/20",
    emerald: "text-emerald-500 bg-emerald-600 border-emerald-500 ring-emerald-500 shadow-emerald-500/20",
    rose: "text-rose-500 bg-rose-600 border-rose-500 ring-rose-500 shadow-rose-500/20",
    amber: "text-amber-500 bg-amber-600 border-amber-500 ring-amber-500 shadow-amber-500/20"
  };

  // --- FIXED: GREETING & QUOTE ENGINE ---
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";
  const dailyQuote = hour < 12 ? "Win the morning, win the day." : hour < 17 ? "Stay focused, stay consistent." : "Rest well, plan for tomorrow.";

  const loadTasks = useCallback(async (token) => {
    try {
      const res = await axios.get(`${API}/tasks`, { headers: { 'x-auth-token': token } });
      setTasks(res.data);
    } catch (err) { console.error("API Connection Error"); }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) { loadTasks(token); }
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode, loadTasks]);

  useEffect(() => {
    let timer;
    if (isTimerRunning && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isTimerRunning, timeLeft]);

  const syncProfile = async (n, t, a) => {
    const token = localStorage.getItem('token');
    try {
      await axios.put(`${API}/auth/update-profile`, { name: n, themeColor: t, avatarSeed: a }, { headers: {'x-auth-token': token} });
      localStorage.setItem('userName', n);
      localStorage.setItem('themeColor', t);
      localStorage.setItem('userAvatar', a);
    } catch (err) { console.log("Cloud sync skipped"); }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      const url = isRegister ? `${API}/auth/register` : `${API}/auth/login`;
      const res = await axios.post(url, authForm);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('userName', res.data.user.name);
      localStorage.setItem('themeColor', res.data.user.themeColor || 'indigo');
      localStorage.setItem('userAvatar', res.data.user.avatarSeed || 'Felix');
      setUser(res.data.user);
      navigate('/');
    } catch (err) { alert("Auth Error: Check Railway backend status."); }
  };

  const addTask = async (e) => {
    e.preventDefault();
    if (!taskTitle || !taskDate) return;
    const token = localStorage.getItem('token');
    const res = await axios.post(`${API}/tasks`, { title: taskTitle, description: taskDesc, dueDate: taskDate, priority }, { headers: { 'x-auth-token': token } });
    setTasks([res.data, ...tasks]);
    setTaskTitle(''); setTaskDesc('');
    alert("TaskPro: Node Deployed & Email Dispatched!");
  };

  const progress = tasks.length > 0 ? (tasks.filter(t => t.status === 'Completed').length / tasks.length) * 100 : 0;
  const filteredTasks = tasks.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()) && (filter === 'All' ? true : t.status === filter));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-all duration-500 font-sans text-slate-900 dark:text-white">
      {/* NAVBAR */}
      <nav className="glass sticky top-0 z-50 px-4 md:px-12 py-4 flex justify-between items-center border-b dark:border-white/5">
        <Link to="/" className={`flex items-center gap-2 font-black text-2xl md:text-3xl tracking-tighter ${themes[themeColor].split(' ')[0]}`}>
          <Zap fill="currentColor"/> TaskPro
        </Link>
        <div className="flex items-center gap-3 md:gap-6">
          <div className="hidden lg:flex gap-6 text-[10px] font-black uppercase tracking-widest text-gray-400">
             <Link to="/" className="hover:text-indigo-500 flex items-center gap-1 font-bold underline"><HomeIcon size={14}/> Dashboard</Link>
             <Link to="/about" className="hover:text-indigo-500 flex items-center gap-1 font-bold"><Info size={14}/> About</Link>
             <Link to="/contact" className="hover:text-indigo-500 flex items-center gap-1 font-bold"><Mail size={14}/> Support</Link>
          </div>
          <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-xl bg-gray-100 dark:bg-slate-900 transition-all hover:rotate-12">
            {darkMode ? <Sun size={20} className="text-yellow-400"/> : <Moon size={20} className="text-gray-400"/>}
          </button>
          {user && (
            <button onClick={() => setShowProfile(!showProfile)} className={`flex items-center gap-2 p-1 pr-4 bg-gray-100 dark:bg-slate-900 rounded-full ring-2 ${themes[themeColor].split(' ')[4]} transition-all shadow-xl`}>
              <img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${selectedAvatar}`} className="w-9 h-9 rounded-full bg-slate-800" alt="p" />
              <User size={14} className="sm:hidden text-gray-400" />
              <span className="text-[10px] font-black uppercase hidden md:block dark:text-white">{user.name.split(' ')[0]}</span>
            </button>
          )}
        </div>
      </nav>

      {/* SETTINGS OVERLAY */}
      <AnimatePresence>
        {showProfile && user && (
          <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }} className="fixed right-6 top-24 w-80 glass p-8 rounded-[3rem] z-[100] shadow-2xl border dark:border-white/10">
            <div className="flex justify-between items-center mb-6"><h4 className="text-xs font-black uppercase text-gray-400 tracking-widest flex items-center gap-2"><Settings size={14}/> Settings</h4><X size={20} className="cursor-pointer text-red-500" onClick={() => setShowProfile(false)} /></div>
            <div className="mb-6 bg-slate-100 dark:bg-slate-800 p-4 rounded-2xl">
              {isEditingName ? (
                <div className="flex gap-2"><input className="bg-transparent border-b border-indigo-500 outline-none text-sm w-full dark:text-white font-bold" value={newName} onChange={e => setNewName(e.target.value)} /><Check size={18} className="text-green-500 cursor-pointer" onClick={() => { setUser({...user, name: newName}); setIsEditingName(false); syncProfile(newName, themeColor, selectedAvatar); }} /></div>
              ) : (
                <div className="flex justify-between items-center"><span className="text-sm font-bold dark:text-white">{user.name}</span><Edit3 size={14} className="text-indigo-500 cursor-pointer" onClick={() => { setIsEditingName(true); setNewName(user.name); }} /></div>
              )}
            </div>
            <button onClick={() => setShowAvatarPicker(!showAvatarPicker)} className="w-full mb-4 text-[10px] font-black uppercase bg-indigo-500/10 text-indigo-500 p-2 rounded-xl flex items-center justify-center gap-2"><Star size={12}/> {showAvatarPicker ? "Close Gallery" : "Avatar Selection"}</button>
            {showAvatarPicker && (
              <div className="grid grid-cols-4 gap-2 mb-6 animate-in zoom-in">
                {avatars.map(a => <button key={a} onClick={() => {setSelectedAvatar(a); syncProfile(user.name, themeColor, a); setShowAvatarPicker(false);}} className={`p-1 rounded-xl ${selectedAvatar === a ? 'ring-2 ring-white bg-indigo-500 shadow-xl' : 'bg-slate-700 opacity-50'}`}><img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${a}`} alt="a"/></button>)}
              </div>
            )}
            <h4 className="text-[10px] font-black uppercase text-gray-400 mb-3 flex items-center gap-2"><Palette size={14}/> Dynamic Themes</h4>
            <div className="flex gap-4 mb-8">
              {Object.keys(themes).map(c => <button key={c} onClick={() => {setThemeColor(c); syncProfile(user.name, c, selectedAvatar);}} className={`w-8 h-8 rounded-full ${themes[c].split(' ')[1]} ${themeColor === c ? 'ring-4 ring-white shadow-2xl scale-110' : ''}`} />)}
            </div>
            <button onClick={() => {localStorage.clear(); window.location.href="/";}} className="w-full p-4 rounded-2xl bg-red-500 text-white font-black flex items-center justify-center gap-2 shadow-xl shadow-red-500/20 hover:scale-95 transition-all"><LogOut size={18}/> Sign Out</button>
          </motion.div>
        )}
      </AnimatePresence>

      <Routes>
        <Route path="/about" element={
            <div className="max-w-6xl mx-auto py-20 px-6 text-center">
                <h1 className="text-7xl font-black mb-10 tracking-tighter uppercase">Developed by <span className={themes[themeColor].split(' ')[0]}>Yesaswi</span></h1>
                <div className="grid md:grid-cols-3 gap-10">
                    <div className="glass p-10 rounded-[3.5rem] border-t-[12px] border-indigo-600 shadow-2xl"><Shield className="text-indigo-500 mb-6 mx-auto" size={40}/><h4 className="text-xl font-black mb-2">Cloud Security</h4><p className="text-sm text-gray-400 leading-relaxed font-medium">Secured with secure JWT authentication and Bcrypt hashing protocols.</p></div>
                    <div className="glass p-10 rounded-[3.5rem] border-t-[12px] border-emerald-600 shadow-2xl"><Rocket className="text-emerald-500 mb-6 mx-auto" size={40}/><h4 className="text-xl font-black mb-2">Native Engine</h4><p className="text-sm text-gray-400 leading-relaxed font-medium">Direct MongoDB Driver implementation for sub-100ms response times on Railway.</p></div>
                    <div className="glass p-10 rounded-[3.5rem] border-t-[12px] border-amber-600 shadow-2xl"><Cpu className="text-amber-500 mb-6 mx-auto" size={40}/><h4 className="text-xl font-black mb-2">Automation</h4><p className="text-sm text-gray-400 leading-relaxed font-medium">Integrated Nodemailer system dispatches beautiful HTML reminders for every task.</p></div>
                </div>
                <div className="mt-12 opacity-20"><Code size={30} className="mx-auto" /></div>
            </div>
        } />
        
        <Route path="/contact" element={<div className="max-w-xl mx-auto py-20 px-6 text-center text-white">
            <Mail size={60} className="mx-auto text-indigo-500 mb-8" />
            <h2 className="text-5xl font-black mb-4 tracking-tighter uppercase">Support</h2>
            <p className="text-gray-500 font-bold mb-10">Email: myselfadmin123@gmail.com</p>
            <form className="glass p-10 rounded-[3.5rem] space-y-4 shadow-3xl" onSubmit={(e)=>{e.preventDefault(); alert("Deployed to Support!")}}>
                <input className="w-full p-5 glass rounded-3xl outline-none" placeholder="Context Title" required />
                <textarea className="w-full p-5 glass rounded-3xl outline-none h-40" placeholder="Problem description..." required />
                <button className="w-full bg-indigo-600 text-white p-5 rounded-3xl font-black shadow-xl">Contact Admin</button>
                <Phone size={20} className="mx-auto text-gray-800 opacity-5 mt-4" />
            </form>
        </div>} />

        <Route path="/login" element={user ? <Navigate to="/" /> : (
          <div className="min-h-[85vh] flex items-center justify-center p-6 bg-[url('https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=2000')] bg-cover relative">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"></div>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="glass p-12 rounded-[3.5rem] w-full max-w-md shadow-2xl border dark:border-white/5 text-center relative z-10">
              <Zap size={40} className="mx-auto text-indigo-500 mb-4" fill="currentColor"/><h2 className="text-4xl font-black dark:text-white uppercase mb-8 tracking-tighter">TaskPro</h2>
              <form onSubmit={handleAuth} className="space-y-4 text-left">
                {isRegister && <input className="w-full p-4 bg-gray-50 dark:bg-slate-900 rounded-2xl outline-none dark:text-white border border-white/5 focus:border-indigo-500" placeholder="Student Name" onChange={e => setAuthForm({...authForm, name: e.target.value})} required />}
                <input className="w-full p-4 bg-gray-50 dark:bg-slate-900 rounded-2xl outline-none dark:text-white border border-white/5 focus:border-indigo-500" placeholder="Email" type="email" onChange={e => setAuthForm({...authForm, email: e.target.value})} required />
                <input className="w-full p-4 bg-gray-50 dark:bg-slate-900 rounded-2xl outline-none dark:text-white border border-white/5 focus:border-indigo-500" placeholder="Password" type="password" onChange={e => setAuthForm({...authForm, password: e.target.value})} required />
                <button className={`w-full ${themes[themeColor].split(' ')[1]} text-white p-4 rounded-2xl font-black shadow-xl mt-4`}>Sign {isRegister ? "Up" : "In"}</button>
              </form>
              <button onClick={() => setIsRegister(!isRegister)} className="mt-6 text-[10px] font-black uppercase text-gray-400 underline decoration-indigo-500/30 underline-offset-4 tracking-widest">{isRegister ? "Go to Login" : "Create Workspace"}</button>
            </motion.div>
          </div>
        )} />

        <Route path="/" element={!user ? (
          <div className="min-h-[85vh] flex flex-col items-center justify-center text-center px-6 relative overflow-hidden">
            <h1 className="text-9xl font-black mb-8 dark:text-white tracking-tighter leading-none italic uppercase">TASK<span className="text-indigo-600">PRO</span></h1>
            <div className="bg-indigo-500/10 p-8 rounded-[2.5rem] border border-indigo-500/20 mb-12 flex items-center gap-4 max-w-2xl shadow-inner">
               <Quote className="text-indigo-500" size={32}/><p className="text-2xl italic font-medium">"{dailyQuote}"</p>
            </div>
            <Link to="/login" className="bg-indigo-600 text-white px-14 py-7 rounded-[2.5rem] font-black text-2xl shadow-3xl hover:scale-110 transition-all border border-white/10 shadow-indigo-500/20">Access Portal</Link>
          </div>
        ) : (
          <main className="max-w-7xl mx-auto p-4 md:p-12 flex flex-col lg:flex-row gap-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="w-full lg:w-1/3 flex flex-col gap-8">
              <div className={`p-10 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[300px] ${themes[themeColor].split(' ')[1]}`}>
                <div><h2 className="text-4xl font-black italic mb-2 tracking-tighter leading-none">{greeting}!</h2><p className="text-[11px] font-bold uppercase tracking-widest opacity-80 flex items-center gap-2 mb-6 leading-relaxed"><Quote size={14}/> {dailyQuote}</p></div>
                <div><div className="w-full bg-white/20 h-3 rounded-full overflow-hidden mb-6"><motion.div animate={{ width: `${progress}%` }} className="bg-white h-full shadow-[0_0_20px_white]" /></div><p className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><Trophy size={14}/> {Math.round(progress)}% Mastery</p></div>
                <Zap size={120} className="absolute -right-6 -bottom-6 opacity-10 rotate-12" />
              </div>
              <form onSubmit={addTask} className="glass p-8 rounded-[3.5rem] space-y-4 border dark:border-white/5 shadow-2xl">
                <h3 className="font-black text-xs uppercase tracking-widest text-indigo-500 flex items-center gap-2 mb-2"><Plus size={16}/> New Task</h3>
                <input className="w-full p-5 bg-gray-50 dark:bg-slate-900 rounded-3xl outline-none dark:text-white border-2 border-transparent focus:border-indigo-500 transition-all" placeholder="Project Name" value={taskTitle} onChange={e => setTaskTitle(e.target.value)} required />
                <textarea className="w-full p-5 bg-gray-50 dark:bg-slate-900 rounded-3xl outline-none dark:text-white h-24 border-2 border-transparent focus:border-indigo-500 transition-all" placeholder="Project details & context..." value={taskDesc} onChange={e => setTaskDesc(e.target.value)} />
                <div className="relative flex items-center"><Calendar className="absolute left-5 top-5 text-indigo-500" size={18}/><input type="date" className="w-full p-5 pl-14 bg-gray-50 dark:bg-slate-900 rounded-3xl outline-none dark:text-white border-2 border-transparent focus:border-indigo-500" value={taskDate} onChange={e => setTaskDate(e.target.value)} required /></div>
                <button className={`w-full ${themes[themeColor].split(' ')[1]} text-white p-5 rounded-[2.5rem] font-black text-lg shadow-xl mt-4`}>Deploy Node</button>
              </form>
            </div>

            <div className="lg:col-span-8 space-y-8">
              <div className="flex flex-col md:flex-row gap-6 justify-between items-center bg-white dark:bg-slate-900 p-8 rounded-[3rem] shadow-xl border dark:border-white/5">
                <div className="relative w-full md:w-[24rem]"><Search className="absolute left-6 top-5 text-gray-500" size={20} /><input placeholder="Search projects..." className="w-full pl-16 p-5 glass rounded-full outline-none dark:text-white border-2 border-transparent focus:border-indigo-500 shadow-inner" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div>
                <div className="flex bg-gray-100 dark:bg-slate-800 px-8 py-4 rounded-full border dark:border-white/5 gap-6 items-center shadow-inner">
                   <div className="flex items-center gap-3"><Timer size={24} className={isTimerRunning ? "animate-pulse text-indigo-500" : "text-gray-500"}/><span className="font-mono font-black text-2xl leading-none dark:text-white">{Math.floor(timeLeft/60)}:{timeLeft%60 < 10 ? '0' : ''}{timeLeft%60}</span></div>
                   <button onClick={() => setIsTimerRunning(!isTimerRunning)} className={`text-[10px] font-black uppercase py-2 px-4 rounded-xl ${themes[themeColor].split(' ')[1]} text-white shadow-xl shadow-current/20`}>{isTimerRunning ? "Hold" : "Focus"}</button>
                </div>
              </div>
              <div className="flex bg-gray-200 dark:bg-slate-900 p-2 rounded-3xl w-max">
                  {['All', 'To-Do', 'Completed'].map(f => (
                    <button key={f} onClick={() => setFilter(f)} className={`px-10 py-3 rounded-2xl text-[10px] font-black uppercase transition-all ${filter === f ? 'bg-white dark:bg-slate-800 shadow-3xl ' + themes[themeColor].split(' ')[0] : 'text-gray-400 hover:text-gray-200'}`}>{f}</button>
                  ))}
              </div>
              <div className="space-y-6 pb-20">
                <AnimatePresence mode='popLayout'>
                  {filteredTasks.map(task => {
                    const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'Completed';
                    const pColor = task.priority === 'High' ? 'border-rose-500' : task.priority === 'Medium' ? 'border-amber-500' : 'border-emerald-500';
                    const gUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(task.title)}&dates=${task.dueDate.replace(/-/g, '')}/${task.dueDate.replace(/-/g, '')}`;
                    return (
                      <motion.div key={task._id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className={`glass p-10 rounded-[3.5rem] flex flex-col md:flex-row md:items-center justify-between gap-8 border-l-[18px] ${pColor} ${task.status === 'Completed' ? 'opacity-40 grayscale blur-[0.5px]' : ''} hover:shadow-4xl transition-all relative overflow-hidden shadow-2xl`}>
                        <div className="flex items-start gap-10 flex-1">
                           <button onClick={async () => { const s = task.status === 'Completed' ? 'To-Do' : 'Completed'; await axios.put(`${API}/tasks/${task._id}`, { status: s }, { headers: {'x-auth-token': localStorage.getItem('token')} }); loadTasks(localStorage.getItem('token')); }} className={`p-7 rounded-[2.5rem] shadow-2xl transition-all ${task.status === 'Completed' ? themes[themeColor].split(' ')[1] + ' text-white scale-90' : 'bg-gray-100 dark:bg-slate-900 text-transparent border-2 dark:border-white/5 hover:text-indigo-400 shadow-inner'}`}><Check size={40} strokeWidth={5}/></button>
                           <div className="flex flex-col flex-1"><div className="flex items-center gap-3 mb-1"><h4 className="text-3xl font-black italic dark:text-white uppercase tracking-tighter leading-none">{task.title}</h4><span className="text-[9px] font-black uppercase px-2 py-0.5 bg-slate-100 dark:bg-slate-900 rounded">{task.status}</span></div><p className="text-sm text-slate-500 dark:text-slate-400 font-bold mb-6 leading-relaxed max-w-lg">{task.description || "Project node objective pending..."}</p><div className="flex flex-wrap gap-5 items-center"><span className={`text-[10px] font-black px-5 py-2 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-500 border dark:border-white/5 uppercase tracking-widest flex items-center gap-2 ${isOverdue ? 'bg-red-500 text-white animate-pulse' : ''}`}><Tag size={12}/> Due: {new Date(task.dueDate).toLocaleDateString()}</span><a href={gUrl} target="_blank" rel="noreferrer" className={`text-[10px] font-black uppercase text-indigo-500 hover:underline flex items-center gap-1.5`}><ExternalLink size={14}/> Sync Calendar</a></div></div>
                        </div>
                        <button onClick={async () => { await axios.delete(`${API}/tasks/${task._id}`, { headers: {'x-auth-token': localStorage.getItem('token')} }); loadTasks(localStorage.getItem('token')); }} className="p-4 rounded-2xl text-red-600 bg-red-500/10 hover:bg-red-600 hover:text-white transition-all self-center shadow-xl shadow-red-500/10 active:scale-90"><Trash2 size={28}/></button>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          </main>
        )} />
      </Routes>
      <footer className="py-10 text-center text-slate-400 text-[10px] font-black uppercase tracking-[0.8em] border-t dark:border-white/5 shadow-inner bg-white dark:bg-slate-950">TASKPRO ECOSYSTEM • INTERNSHIP FINAL PROJECT</footer>
    </div>
  );
};

export default function App() { return <Router><AppContent /></Router>; }