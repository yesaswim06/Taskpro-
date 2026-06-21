import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Moon, Sun, Plus, Trash2, Bell, LogOut, Calendar, Zap, Search, Timer, 
  Trophy, Tag, Check, User, Palette, Star, X, Settings, Info, Mail, ExternalLink, 
  Edit3, Quote, ChevronRight, MessageSquare, Users, Shield, Rocket, Cpu, Code, 
  ChevronDown, Fingerprint, Laptop, Phone, CheckCircle, Activity, Globe, RotateCcw
} from 'lucide-react';

const API = "https://taskpro.up.railway.app/api";

const AppContent = () => {
  const navigate = useNavigate();
  
  // --- USER STATE ---
  const [user, setUser] = useState(() => {
    const savedName = localStorage.getItem('userName');
    return savedName ? { name: savedName } : null;
  });
  const [tasks, setTasks] = useState([]);
  const [darkMode, setDarkMode] = useState(true);
  const [themeColor, setThemeColor] = useState(localStorage.getItem('themeColor') || 'indigo');
  const [selectedAvatar, setSelectedAvatar] = useState(localStorage.getItem('userAvatar') || 'Felix');
  
  // --- UI STATES ---
  const [showProfile, setShowProfile] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState('All');

  // --- TASK STATES ---
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskDate, setTaskDate] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [assignedTo, setAssignedTo] = useState('');
  const [commentText, setCommentText] = useState({});

  // --- FOCUS TIMER ---
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const avatars = ['Felix', 'Aneka', 'Milo', 'Buddy', 'Cookie', 'Willow', 'Jasper', 'Zoe'];
  const themes = {
    indigo: "text-indigo-500 bg-indigo-600 border-indigo-500 ring-indigo-500 shadow-indigo-500/20",
    emerald: "text-emerald-500 bg-emerald-600 border-emerald-500 ring-emerald-500 shadow-emerald-500/20",
    rose: "text-rose-500 bg-rose-600 border-rose-500 ring-rose-500 shadow-rose-500/20",
    amber: "text-amber-500 bg-amber-600 border-amber-500 ring-amber-500 shadow-amber-500/20"
  };

  const welcomeData = {
    greet: new Date().getHours() < 12 ? "Good Morning" : new Date().getHours() < 17 ? "Good Afternoon" : "Good Evening",
    quote: "Precision is the hallmark of student success."
  };

  const loadTasks = useCallback(async (token) => {
    try {
      const res = await axios.get(`${API}/tasks`, { headers: { 'x-auth-token': token } });
      setTasks(res.data);
    } catch (err) { console.error("Railway node offline"); }
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

  // --- LOGIC HANDLERS ---
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
      setIsAuthOpen(false);
      navigate('/');
    } catch (err) { alert("Auth Failed: Check credentials"); }
  };

  const syncProfile = useCallback(async (n, t, a) => {
    const token = localStorage.getItem('token');
    try {
      await axios.put(`${API}/auth/update-profile`, { name: n, themeColor: t, avatarSeed: a }, { headers: {'x-auth-token': token} });
      localStorage.setItem('userName', n); localStorage.setItem('themeColor', t); localStorage.setItem('userAvatar', a);
    } catch (err) { console.log("Cloud sync error"); }
  }, []);

  const addTask = async (e) => {
    e.preventDefault();
    if (!taskTitle || !taskDate) return;
    const token = localStorage.getItem('token');
    const res = await axios.post(`${API}/tasks`, { title: taskTitle, description: taskDesc, dueDate: taskDate, priority, assignedTo }, { headers: { 'x-auth-token': token } });
    setTasks([res.data, ...tasks]);
    setTaskTitle(''); setTaskDesc(''); setAssignedTo('');
  };

  const toggleStatus = async (id, currentStatus) => {
    const s = currentStatus === 'Completed' ? 'Pending' : 'Completed';
    const token = localStorage.getItem('token');
    await axios.put(`${API}/tasks/${id}`, { status: s }, { headers: { 'x-auth-token': token } });
    loadTasks(token);
  };

  const progress = tasks.length > 0 ? (tasks.filter(t => t.status === 'Completed').length / tasks.length) * 100 : 0;
  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
    let matchesFilter = true;
    if (filter === 'Pending') matchesFilter = t.status !== 'Completed';
    else if (filter === 'Completed') matchesFilter = t.status === 'Completed';
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-black transition-all duration-500 font-sans text-slate-900 dark:text-zinc-100 overflow-x-hidden">
      
      {/* --- FLEX NAVBAR --- */}
      <nav className="glass sticky top-0 z-[150] px-6 md:px-12 py-4 flex flex-row justify-between items-center border-b dark:border-zinc-800 bg-white/80 dark:bg-black/80 backdrop-blur-md">
        <Link to="/" className={`flex items-center gap-2 font-black text-3xl tracking-tighter ${themes[themeColor].split(' ')[0]}`}>
          <Zap fill="currentColor" size={28}/> TaskPro
        </Link>
        
        <div className="flex items-center gap-5">
          {!user ? (
            <div className="flex gap-4 items-center">
              <Link to="/contact" className="text-xs font-black uppercase text-gray-500 dark:text-zinc-400 hover:text-indigo-500 transition-all flex items-center gap-1 tracking-widest"><Mail size={14}/> Support</Link>
              <button onClick={() => {setIsRegister(false); setIsAuthOpen(true);}} className="text-xs font-black uppercase text-gray-500 dark:text-zinc-400 hover:text-white transition-all tracking-widest">Login</button>
              <button onClick={() => {setIsRegister(true); setIsAuthOpen(true);}} className="bg-indigo-600 text-white px-6 py-2.5 rounded-2xl font-black text-xs uppercase shadow-xl hover:scale-105 active:scale-95 transition-all">GET STARTED</button>
            </div>
          ) : (
            <div className="relative">
              <button onClick={() => setShowProfile(!showProfile)} className={`flex items-center gap-3 p-1 pr-4 bg-gray-100 dark:bg-zinc-900 rounded-full ring-2 ${themes[themeColor].split(' ')[4]} transition-all shadow-xl`}>
                <img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${selectedAvatar}`} className="w-9 h-9 rounded-full bg-slate-800" alt="avatar" />
                <User size={14} className="sm:hidden text-gray-400" />
                <span className="text-[11px] font-black uppercase tracking-widest hidden sm:block">{user.name.split(' ')[0]}</span>
              </button>

              {/* --- COMPACT PROFILE CARD --- */}
              <AnimatePresence>
                {showProfile && (
                  <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="absolute right-0 mt-4 w-72 glass p-6 rounded-[2.5rem] shadow-2xl border dark:border-zinc-800 dark:bg-zinc-900 z-[200]">
                    <div className="flex justify-between items-center mb-4"><h4 className="text-[10px] font-black uppercase text-gray-400">Settings Hub</h4><X size={16} className="cursor-pointer text-red-500" onClick={() => setShowProfile(false)} /></div>
                    
                    <div className="space-y-4">
                       <div className="flex justify-between items-center bg-black/20 p-3 rounded-2xl">
                         {isEditingName ? (
                           <div className="flex gap-2"><input className="bg-transparent border-b border-indigo-500 outline-none text-xs w-full text-white font-bold" value={newName} onChange={e => setNewName(e.target.value)} /><Check size={16} className="text-green-500 cursor-pointer" onClick={() => { setUser({...user, name: newName}); setIsEditingName(false); syncProfile(newName, themeColor, selectedAvatar); }} /></div>
                         ) : (
                           <><span className="text-xs font-bold text-white">{user.name}</span><Edit3 size={14} className="text-indigo-500 cursor-pointer" onClick={() => {setNewName(user.name); setIsEditingName(true);}}/></>
                         )}
                       </div>
                       
                       <button onClick={() => setShowAvatarPicker(!showAvatarPicker)} className="w-full p-2 bg-indigo-500/10 text-indigo-500 rounded-xl text-[9px] font-black uppercase flex items-center justify-center gap-2 tracking-widest border border-indigo-500/20 shadow-lg">{showAvatarPicker ? "Hide Avatars" : "Change Cartoon"}</button>
                       {showAvatarPicker && (
                         <div className="grid grid-cols-4 gap-1 animate-in zoom-in">
                           {avatars.map(a => <button key={a} onClick={() => {setSelectedAvatar(a); syncProfile(user.name, themeColor, a);}} className={`p-1 rounded-lg ${selectedAvatar === a ? 'bg-indigo-500' : 'bg-zinc-800'}`}><img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${a}`} alt="a"/></button>)}
                         </div>
                       )}

                       <div className="flex gap-3 justify-center">
                         {Object.keys(themes).map(c => <button key={c} onClick={() => {setThemeColor(c); syncProfile(user.name, c, selectedAvatar);}} className={`w-6 h-6 rounded-full ${themes[c].split(' ')[1]} ${themeColor === c ? 'ring-2 ring-white scale-110' : ''}`} />)}
                       </div>

                       <button onClick={() => {localStorage.clear(); window.location.href="/";}} className="w-full p-3 rounded-2xl bg-red-600/10 text-red-500 font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-red-600 hover:text-white transition-all"><LogOut size={14}/> Sign Out</button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
          <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-xl bg-white dark:bg-zinc-900 shadow-sm border dark:border-zinc-800 transition-all hover:scale-110">
            {darkMode ? <Sun size={20} className="text-yellow-400"/> : <Moon size={20} className="text-slate-600"/>}
          </button>
        </div>
      </nav>

      {/* --- AUTH MODAL --- */}
      <AnimatePresence>
        {isAuthOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAuthOpen(false)} className="absolute inset-0 bg-black/90 backdrop-blur-xl" />
            <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }} className="glass p-12 rounded-[3.5rem] w-full max-w-md shadow-2xl border dark:border-zinc-800 text-center dark:bg-zinc-950 relative z-[210]">
              <X className="absolute right-8 top-8 cursor-pointer text-gray-500 hover:text-red-500" onClick={() => setIsAuthOpen(false)} />
              <Zap size={44} className="mx-auto text-indigo-500 mb-4" fill="currentColor"/><h2 className="text-4xl font-black dark:text-white uppercase mb-8">TaskPro</h2>
              <form onSubmit={handleAuth} className="space-y-4 text-left">
                {isRegister && <input className="w-full p-5 bg-gray-100/10 dark:bg-black rounded-3xl outline-none dark:text-white border border-white/10 focus:border-indigo-500 transition-all shadow-inner font-bold" placeholder="Student Name" onChange={e => setAuthForm({...authForm, name: e.target.value})} required />}
                <input className="w-full p-5 bg-gray-100/10 dark:bg-black rounded-3xl outline-none dark:text-white border border-white/10 focus:border-indigo-500 transition-all shadow-inner font-bold" placeholder="Email" type="email" onChange={e => setAuthForm({...authForm, email: e.target.value})} required />
                <input className="w-full p-5 bg-gray-100/10 dark:bg-black rounded-3xl outline-none dark:text-white border border-white/10 focus:border-indigo-500 transition-all shadow-inner font-bold" placeholder="Password" type="password" onChange={e => setAuthForm({...authForm, password: e.target.value})} required />
                <button className={`w-full ${themes[themeColor].split(' ')[1]} text-white p-5 rounded-[2rem] font-black shadow-xl mt-6 active:scale-95 transition-all tracking-widest uppercase text-xs`}>{isRegister ? "Join" : "Login"}</button>
              </form>
              <button onClick={() => setIsRegister(!isRegister)} className="mt-8 text-[10px] font-black uppercase text-gray-400 underline decoration-indigo-500/50 underline-offset-8 tracking-[0.2em] w-full">{isRegister ? "Use Existing account" : "GET STARTED"}</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- CONTENT --- */}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={!user ? (
            <div className="flex flex-col items-center">
              <section className="min-h-screen w-full flex flex-col items-center justify-center text-center px-6 relative overflow-hidden bg-white dark:bg-black">
                 <div className="absolute inset-0 pointer-events-none opacity-20">
                    <motion.div animate={{ scale: [1, 1.3, 1], rotate: [0, 90, 0] }} transition={{ duration: 25, repeat: Infinity }} className="absolute -top-1/2 -left-1/4 w-[100%] h-[100%] bg-indigo-600 rounded-full blur-[160px]" />
                    <motion.div animate={{ scale: [1.3, 1, 1.3], rotate: [0, -90, 0] }} transition={{ duration: 20, repeat: Infinity }} className="absolute -bottom-1/2 -right-1/4 w-[100%] h-[100%] bg-rose-600 rounded-full blur-[160px]" />
                 </div>
                 <motion.div initial={{ y: 60, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} transition={{ duration: 1.2 }}>
                    <h1 className="text-[10rem] md:text-[16rem] font-black tracking-tighter leading-none italic dark:text-white uppercase mb-4">TASK<span className={themes[themeColor].split(' ')[0]}>PRO</span></h1>
                    <p className="max-w-2xl mx-auto text-gray-500 dark:text-zinc-500 text-3xl font-bold tracking-tight italic mb-16 leading-tight">"{welcomeData.quote}"</p>
                    <div className="flex flex-col sm:flex-row gap-6 justify-center">
                       <button onClick={() => {setIsAuthOpen(true); setIsRegister(true);}} className="bg-indigo-600 text-white px-16 py-8 rounded-[2.5rem] font-black text-2xl shadow-3xl hover:scale-110 transition-all border border-white/10 shadow-indigo-500/30 tracking-widest uppercase font-bold">GET STARTED</button>
                       <button onClick={() => window.scrollTo({ top: 1000, behavior: 'smooth' })} className="glass dark:text-white px-16 py-8 rounded-[2.5rem] font-black text-2xl border dark:border-white/10 flex items-center gap-3 hover:bg-white/5 font-bold"><Info size={24}/> System Logic</button>
                    </div>
                 </motion.div>
                 <motion.div animate={{y: [0, 10, 0]}} transition={{repeat: Infinity}} className="absolute bottom-10 left-1/2 -translate-x-1/2 text-gray-400"><ChevronDown size={32}/></motion.div>
              </section>

              {/* Breakdown */}
              <section className="min-h-screen py-32 px-6 max-w-7xl mx-auto flex flex-col gap-32">
                 <div className="grid md:grid-cols-2 gap-20 items-center">
                    <div className="space-y-6 text-slate-900 dark:text-white">
                      <h3 className="text-7xl font-black uppercase tracking-tighter">Secure <span className="text-indigo-500 italic text-5xl tracking-widest">ENCRYPTION</span></h3>
                      <p className="text-gray-500 dark:text-zinc-400 text-xl leading-relaxed font-bold">Stateless JWT authorized sessions and industrial Bcrypt hashing ensure total data integrity.</p>
                      <div className="flex gap-4"><Fingerprint size={40} className="text-indigo-500"/><Shield size={40} className="text-indigo-500"/><Activity size={40} className="text-indigo-500"/></div>
                    </div>
                    <img src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800" className="rounded-[4rem] shadow-4xl grayscale hover:grayscale-0 border dark:border-white/5" alt="sec" />
                 </div>
                 <div className="grid md:grid-cols-2 gap-20 items-center">
                    <img src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800" className="rounded-[4rem] shadow-4xl order-2 border dark:border-white/5" alt="cpu" />
                    <div className="space-y-6 order-1 text-slate-900 dark:text-white">
                      <h3 className="text-7xl font-black uppercase tracking-tighter">Cloud <span className="text-emerald-500 italic text-5xl tracking-widest">VELOCITY</span></h3>
                      <p className="text-gray-500 dark:text-zinc-400 text-xl leading-relaxed font-bold">Sub-20ms latency via Native MongoDB Driver and high-performance Railway cloud nodes.</p>
                      <div className="flex gap-4"><Cpu size={40} className="text-emerald-500"/><Rocket size={40} className="text-emerald-500"/><Globe size={40} className="text-emerald-500"/><Laptop size={40} className="text-emerald-500"/></div>
                    </div>
                 </div>
                 <div className="text-center pb-20"><Code size={60} className="mx-auto text-gray-500 opacity-20" /><p className="mt-24 text-[9px] font-black uppercase tracking-[1em] text-gray-500 opacity-60">Developed by Yesaswi</p></div>
              </section>
            </div>
          ) : (
            /* --- WORKSPACE DASHBOARD --- */
            <main className="max-w-7xl mx-auto p-4 md:p-12 flex flex-col lg:flex-row gap-12 animate-in fade-in duration-1000">
              <div className="w-full lg:w-1/3 flex flex-col gap-8">
                <div className={`p-10 rounded-[3.5rem] text-white shadow-3xl relative overflow-hidden flex flex-col justify-between min-h-[300px] ${themes[themeColor].split(' ')[1]}`}>
                  <div><h2 className="text-4xl font-black italic mb-2 tracking-tighter leading-none">{welcomeData.greet}!</h2><p className="text-[11px] font-bold uppercase tracking-widest opacity-80 flex items-center gap-2 mb-10 leading-relaxed"><Quote size={14}/> {welcomeData.quote}</p></div>
                  <div><div className="w-full bg-white/20 h-2.5 rounded-full overflow-hidden mb-4 shadow-inner"><motion.div animate={{ width: `${progress}%` }} className="bg-white h-full shadow-[0_0_20px_white]" /></div><p className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><Trophy size={14} /> Mastery: {Math.round(progress)}%</p></div>
                  <Zap size={140} className="absolute -right-6 -bottom-6 opacity-10 rotate-12" />
                </div>
                <form onSubmit={addTask} className="glass p-8 rounded-[3.5rem] space-y-4 border dark:border-white/5 shadow-2xl dark:bg-zinc-950 flex-1">
                  <h3 className="font-black text-xs uppercase tracking-widest text-indigo-500 flex items-center gap-2 mb-2"><Plus size={16}/> New Task</h3>
                  <input className="w-full p-5 bg-gray-50 dark:bg-black rounded-3xl outline-none dark:text-white border-2 border-transparent focus:border-indigo-500 transition-all font-bold" placeholder="Task Name" value={taskTitle} onChange={e => setTaskTitle(e.target.value)} required />
                  <textarea className="w-full p-5 bg-gray-50 dark:bg-black rounded-3xl outline-none dark:text-white h-24 border-2 border-transparent focus:border-indigo-500 transition-all shadow-inner font-bold" placeholder="Description..." value={taskDesc} onChange={e => setTaskDesc(e.target.value)} />
                  <div className="flex items-center gap-2 p-4 bg-gray-50 dark:bg-black rounded-3xl border dark:border-zinc-800 shadow-inner"><Users size={16} className="text-gray-400"/><input className="bg-transparent outline-none text-xs w-full dark:text-white font-bold" placeholder="Delegate Email" value={assignedTo} onChange={e => setAssignedTo(e.target.value)} /></div>
                  <div className="relative flex items-center font-bold text-white"><Calendar size={18} className="absolute left-5 top-5 text-indigo-500"/><input type="date" className="w-full p-5 pl-14 bg-gray-50 dark:bg-black rounded-3xl outline-none dark:text-white border-2 border-transparent focus:border-indigo-500 transition-all shadow-inner font-bold" value={taskDate} onChange={e => setTaskDate(e.target.value)} required /></div>
                  <div className="flex gap-2">
                     {['Low', 'Medium', 'High'].map(p => (
                       <button key={p} type="button" onClick={() => setPriority(p)} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${priority === p ? themes[themeColor].split(' ')[1] + ' text-white shadow-xl scale-105' : 'bg-gray-100 dark:bg-zinc-900 text-slate-500'}`}>{p}</button>
                     ))}
                  </div>
                  <button className={`w-full ${themes[themeColor].split(' ')[1]} text-white p-5 rounded-[2.5rem] font-black text-lg shadow-xl shadow-current/30 mt-4 active:scale-95 transition-all tracking-widest uppercase`}>Deploy Node</button>
                </form>
              </div>

              <div className="lg:col-span-8 space-y-10 flex-1">
                <div className="flex flex-col md:flex-row gap-8 justify-between items-center bg-white dark:bg-zinc-900/50 p-10 rounded-[4rem] shadow-2xl border dark:border-zinc-800">
                  <div className="relative w-full md:w-[30rem]"><Search className="absolute left-8 top-6 text-slate-400" size={24} /><input placeholder="Search projects..." className="w-full pl-20 p-6 glass rounded-full outline-none dark:text-white border-2 border-transparent focus:border-indigo-500 shadow-inner dark:bg-black" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div>
                  
                  {/* --- TIMER WITH ADJUSTMENTS & RESET --- */}
                  <div className="flex bg-gray-100 dark:bg-zinc-800 px-8 py-4 rounded-full border dark:border-white/5 gap-6 items-center shadow-inner">
                     <div className="flex items-center gap-3">
                        <button onClick={() => setTimeLeft(prev => Math.max(0, prev - 300))} className="text-gray-500 hover:text-red-500 font-bold">-</button>
                        <Timer size={26} className={isTimerRunning ? "animate-pulse text-indigo-500" : "text-gray-500"}/>
                        <span className="font-mono font-black text-2xl dark:text-white">{Math.floor(timeLeft/60)}:{timeLeft%60 < 10 ? '0' : ''}{timeLeft%60}</span>
                        <button onClick={() => setTimeLeft(prev => prev + 300)} className="text-gray-500 hover:text-green-500 font-bold">+</button>
                        <button onClick={() => {setIsTimerRunning(false); setTimeLeft(25*60);}} className="text-gray-500 hover:text-amber-500 ml-2"><RotateCcw size={16}/></button>
                     </div>
                     <button onClick={() => setIsTimerRunning(!isTimerRunning)} className={`text-[10px] font-black uppercase px-5 py-2 rounded-xl ${themes[themeColor].split(' ')[1]} text-white shadow-xl`}>{isTimerRunning ? "Stop" : "Focus"}</button>
                  </div>
                </div>

                <div className="flex bg-gray-200 dark:bg-zinc-900 p-2 rounded-3xl w-max shadow-inner border dark:border-white/5">
                    {['All', 'Pending', 'Completed'].map(f => (
                      <button key={f} onClick={() => setFilter(f)} className={`px-10 py-3 rounded-2xl text-[10px] font-black uppercase transition-all ${filter === f ? 'bg-white dark:bg-zinc-700 shadow-3xl ' + themes[themeColor].split(' ')[0] : 'text-slate-500 hover:text-slate-200'}`}>{f}</button>
                    ))}
                </div>

                <div className="space-y-6 pb-20">
                  <AnimatePresence mode='popLayout'>
                    {filteredTasks.map(task => {
                      const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'Completed';
                      const pColor = task.priority === 'High' ? 'border-rose-500' : task.priority === 'Medium' ? 'border-amber-500' : 'border-emerald-500';
                      return (
                        <motion.div key={task._id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className={`glass p-10 rounded-[3.5rem] flex flex-col md:flex-row md:items-center justify-between gap-8 border-l-[18px] ${pColor} ${task.status === 'Completed' ? 'opacity-40 grayscale blur-[0.5px]' : ''} hover:shadow-4xl transition-all relative overflow-hidden shadow-2xl dark:bg-zinc-900`}>
                          <div className="flex items-start gap-10 flex-1">
                             <button onClick={() => toggleStatus(task._id, task.status)} className={`p-7 rounded-[2.5rem] shadow-2xl transition-all ${task.status === 'Completed' ? themes[themeColor].split(' ')[1] + ' text-white scale-90 shadow-current/40' : 'bg-gray-100 dark:bg-black text-transparent border-2 dark:border-zinc-800 hover:text-indigo-400 shadow-inner'}`}><CheckCircle size={40} strokeWidth={2}/></button>
                             <div className="flex flex-col flex-1"><div className="flex items-center gap-3 mb-1"><h4 className="text-3xl font-black italic dark:text-white uppercase tracking-tighter leading-none">{task.title}</h4><span className="text-[10px] font-black uppercase px-2 py-0.5 bg-slate-100 dark:bg-black rounded dark:text-zinc-600">{task.status}</span></div><p className="text-sm text-slate-500 dark:text-zinc-400 font-bold mb-6 leading-relaxed max-w-lg">{task.description}</p><div className="flex flex-wrap gap-5 items-center"><span className={`text-[10px] font-black px-5 py-2 rounded-full bg-slate-100 dark:bg-black text-slate-500 border dark:border-zinc-800 uppercase tracking-widest flex items-center gap-2 ${isOverdue ? 'bg-red-500 text-white animate-pulse shadow-xl shadow-red-500/20' : ''}`}><Tag size={12}/> Due: {new Date(task.dueDate).toLocaleDateString()}</span><a href={`https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(task.title)}&dates=${task.dueDate.replace(/-/g, '')}/${task.dueDate.replace(/-/g, '')}`} target="_blank" rel="noreferrer" className={`text-[10px] font-black uppercase text-indigo-500 hover:underline flex items-center gap-1.5 font-bold`}><ExternalLink size={14}/> Sync Calendar</a></div></div>
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

          <Route path="/contact" element={<div className="max-w-xl mx-auto py-20 px-6 text-center text-white">
            <Mail size={60} className="mx-auto text-indigo-500 mb-8" />
            <h2 className="text-5xl font-black dark:text-white mb-4 uppercase transition-colors duration-500 tracking-tighter">Support Center</h2>
            <p className="font-bold text-slate-500 mb-10 tracking-widest uppercase text-xs">EMAIL 📧: myselfadmin123@gmail.com</p>
            <form className="glass p-10 rounded-[3.5rem] space-y-4 shadow-3xl border dark:border-zinc-800 dark:bg-zinc-900" onSubmit={(e)=>{e.preventDefault(); alert("Signal Sent!")}}>
               <input className="w-full p-5 glass rounded-3xl outline-none dark:bg-black dark:text-white border dark:border-zinc-800" placeholder="Student Context" required />
               <textarea className="w-full p-5 glass rounded-3xl outline-none dark:text-white dark:bg-black border dark:border-zinc-800 h-40 font-bold" placeholder="Technical details..." required />
               <button className="w-full bg-indigo-600 text-white p-5 rounded-3xl font-black shadow-xl uppercase tracking-widest text-sm flex items-center justify-center gap-2"><Phone size={18}/> Contact</button>
            </form>
          </div>} />
          
          <Route path="/about" element={<Navigate to="/" />} />
        </Routes>
      </main>

      <footer className="py-20 text-center text-slate-400 text-[10px] font-black uppercase tracking-[0.8em] border-t dark:border-zinc-900 bg-white dark:bg-black shadow-inner">TASKPRO ECOSYSTEM • {new Date().getFullYear()} • DEVELOPED BY YESASWI</footer>
    </div>
  );
};

export default function App() { return <Router><AppContent /></Router>; }