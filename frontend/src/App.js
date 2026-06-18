import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Moon, Sun, Plus, Trash2, Bell, LogOut, Calendar, Zap, Search, Timer, 
  Trophy, Tag, Check, User, Palette, Star, X, Settings, Info, Mail, ExternalLink, Edit3, Quote, Rocket, Shield, Cpu, Code
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
  
  // UI & Form States
  const [showProfile, setShowProfile] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState('All');

  // Form States
  const [isRegister, setIsRegister] = useState(false);
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskDate, setTaskDate] = useState('');
  const [priority, setPriority] = useState('Medium');

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
    quote: "Precision and consistency are the hallmarks of a professional developer."
  };

  const loadTasks = useCallback(async (token) => {
    try {
      const res = await axios.get(`${API}/tasks`, { headers: { 'x-auth-token': token } });
      setTasks(res.data);
    } catch (err) { console.error(err); }
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

  const syncProfileToCloud = async (n, t, a) => {
    const token = localStorage.getItem('token');
    try {
      await axios.put(`${API}/auth/update-profile`, { name: n, themeColor: t, avatarSeed: a }, { headers: {'x-auth-token': token} });
      localStorage.setItem('userName', n);
      localStorage.setItem('themeColor', t);
      localStorage.setItem('userAvatar', a);
    } catch (err) { console.log("Cloud sync error"); }
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
      setThemeColor(res.data.user.themeColor || 'indigo');
      setSelectedAvatar(res.data.user.avatarSeed || 'Felix');
      navigate('/');
    } catch (err) { alert("Auth Failed: Connect Workspace First!"); }
  };

  const addTask = async (e) => {
    e.preventDefault();
    if (!taskTitle || !taskDate) return;
    const token = localStorage.getItem('token');
    await axios.post(`${API}/tasks`, { title: taskTitle, description: taskDesc, dueDate: taskDate, priority }, { headers: { 'x-auth-token': token } });
    loadTasks(token);
    setTaskTitle(''); setTaskDesc('');
    alert("TaskPro: Deployment Successful & Email Notification Dispatched!");
  };

  const filteredTasks = tasks.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()) && (filter === 'All' ? true : t.status === filter));
  const progress = tasks.length > 0 ? (tasks.filter(t => t.status === 'Completed').length / tasks.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-all duration-500 font-sans">
      <nav className="glass sticky top-0 z-50 px-8 py-4 flex justify-between items-center border-b dark:border-white/5 shadow-xl">
        <div className="flex items-center gap-10">
          <Link to="/" className={`flex items-center gap-2 font-black text-3xl tracking-tighter ${themes[themeColor].split(' ')[0]}`}>
            <Zap fill="currentColor" size={28}/> TaskPro
          </Link>
          <div className="hidden md:flex gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
             <Link to="/" className="hover:text-indigo-500 transition flex items-center gap-2 font-bold"><Zap size={14}/> Dashboard</Link>
             <Link to="/about" className="hover:text-indigo-500 transition flex items-center gap-2 font-bold"><Info size={14}/> Info</Link>
             <Link to="/contact" className="hover:text-indigo-500 transition flex items-center gap-2 font-bold"><Mail size={14}/> Support</Link>
          </div>
        </div>
        <div className="flex items-center gap-5">
          <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-xl bg-gray-100 dark:bg-slate-900 transition-all hover:scale-110">
            {darkMode ? <Sun size={20} className="text-yellow-400"/> : <Moon size={20} className="text-gray-400"/>}
          </button>
          {user && (
            <button onClick={() => setShowProfile(!showProfile)} className={`flex items-center gap-3 p-1 pr-4 bg-gray-100 dark:bg-slate-900 rounded-full ring-2 ${themes[themeColor].split(' ')[4]} transition-all shadow-xl`}>
              <img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${selectedAvatar}`} className="w-9 h-9 rounded-full bg-slate-800" alt="p" />
              <User size={14} className="sm:hidden text-gray-400" />
              <span className="text-xs font-black uppercase tracking-widest hidden sm:block dark:text-white">{user.name.split(' ')[0]}</span>
            </button>
          )}
        </div>
      </nav>

      {/* SETTINGS OVERLAY */}
      <AnimatePresence>
        {showProfile && user && (
          <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }} className="fixed right-6 top-24 w-80 glass p-8 rounded-[3rem] z-[100] shadow-2xl border dark:border-white/10">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-xs font-black uppercase text-gray-400 flex items-center gap-2"><Settings size={14}/> Profile Node</h4>
              <X size={20} className="cursor-pointer text-gray-500 hover:text-red-500" onClick={() => setShowProfile(false)} />
            </div>
            <div className="mb-6 bg-slate-100 dark:bg-slate-800 p-4 rounded-2xl text-white">
              {isEditingName ? (
                <div className="flex gap-2">
                  <input className="bg-transparent border-b border-indigo-500 outline-none text-sm w-full font-bold" value={newName} onChange={e => setNewName(e.target.value)} />
                  <Check size={18} className="text-green-500 cursor-pointer" onClick={() => { setUser({...user, name: newName}); setIsEditingName(false); syncProfileToCloud(newName, themeColor, selectedAvatar); }} />
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold">{user.name}</span>
                  <Edit3 size={14} className="text-indigo-500 cursor-pointer" onClick={() => { setIsEditingName(true); setNewName(user.name); }} />
                </div>
              )}
            </div>
            <button onClick={() => setShowAvatarPicker(!showAvatarPicker)} className="w-full mb-4 text-[10px] font-black uppercase bg-indigo-500/10 text-indigo-500 p-2 rounded-xl flex items-center justify-center gap-2 tracking-widest border border-indigo-500/20 shadow-lg">
              <Star size={12} fill="currentColor"/> {showAvatarPicker ? "Lock Gallery" : "Avatar Selection"}
            </button>
            {showAvatarPicker && (
              <div className="grid grid-cols-4 gap-2 mb-6 animate-in zoom-in slide-in-from-top-4 duration-300">
                {avatars.map(a => <button key={a} onClick={() => {setSelectedAvatar(a); syncProfileToCloud(user.name, themeColor, a); setShowAvatarPicker(false);}} className={`p-1 rounded-xl transition-all ${selectedAvatar === a ? 'ring-2 ring-white bg-indigo-500 shadow-xl' : 'bg-slate-700 opacity-50 hover:opacity-100'}`}><img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${a}`} alt="a"/></button>)}
              </div>
            )}
            <h4 className="text-[10px] font-black uppercase text-gray-400 mb-3 flex items-center gap-2"><Palette size={14}/> Dynamic Theme</h4>
            <div className="flex gap-4 mb-8">
              {Object.keys(themes).map(c => <button key={c} onClick={() => {setThemeColor(c); syncProfileToCloud(user.name, c, selectedAvatar);}} className={`w-8 h-8 rounded-full transition-transform hover:scale-125 ${themes[c].split(' ')[1]} ${themeColor === c ? 'ring-4 ring-white shadow-2xl scale-110' : ''}`} />)}
            </div>
            <button onClick={() => {localStorage.clear(); window.location.href="/";}} className="w-full p-4 rounded-2xl bg-red-500 text-white font-black flex items-center justify-center gap-2 shadow-xl shadow-red-500/20 hover:scale-95 transition-all"><LogOut size={18}/> End Session</button>
          </motion.div>
        )}
      </AnimatePresence>

      <Routes>
        {/* --- INFO / ABOUT PAGE (ENRICHED) --- */}
        <Route path="/about" element={
          <div className="max-w-6xl mx-auto py-20 px-6">
            <div className="text-center mb-16">
              <motion.div initial={{scale: 0}} animate={{scale: 1}} className="inline-block p-4 bg-indigo-500/10 rounded-full mb-4"><Cpu size={48} className="text-indigo-500"/></motion.div>
              <h1 className="text-7xl font-black dark:text-white tracking-tighter">PROJECT <span className="text-indigo-500 italic">INFO</span></h1>
              <p className="text-gray-500 mt-4 text-xl max-w-2xl mx-auto font-medium tracking-tight">TaskPro: Convergence of behavioral psychology and full-stack engineering.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-10">
              <div className="glass p-10 rounded-[3.5rem] border-t-[12px] border-indigo-600 shadow-2xl">
                <Shield className="text-indigo-500 mb-6" size={32}/>
                <h4 className="text-xl font-black dark:text-white mb-2">High Integrity</h4>
                <p className="text-sm text-gray-400 leading-relaxed font-medium">Built with secure JWT authentication and Bcrypt hashing, ensuring student data stays encrypted at all times in the MongoDB Cloud.</p>
              </div>
              <div className="glass p-10 rounded-[3.5rem] border-t-[12px] border-emerald-600 shadow-2xl">
                <Rocket className="text-emerald-500 mb-6" size={32}/>
                <h4 className="text-xl font-black dark:text-white mb-2">MERN Performance</h4>
                <p className="text-sm text-gray-400 leading-relaxed font-medium">Utilizing the native MongoDB Driver for ultra-low latency response. Backend is containerized and hosted on the Railway cloud.</p>
              </div>
              <div className="glass p-10 rounded-[3.5rem] border-t-[12px] border-amber-600 shadow-2xl">
                <Code className="text-amber-500 mb-6" size={32}/>
                <h4 className="text-xl font-black dark:text-white mb-2">Automated Flows</h4>
                <p className="text-sm text-gray-400 leading-relaxed font-medium">Nodemailer integrated system ensures that task assignments trigger a real-time email dispatch to the student with a calendar sync node.</p>
              </div>
            </div>
          </div>
        } />
        
        <Route path="/contact" element={
          <div className="max-w-4xl mx-auto py-20 px-6 grid md:grid-cols-2 gap-12 text-white items-center">
            <div>
              <h2 className="text-7xl font-black mb-6 tracking-tighter leading-none">SUPPORT<br/><span className="text-indigo-500 italic">CENTER</span></h2>
              <p className="text-gray-500 text-lg mb-8 font-bold leading-relaxed tracking-tight">Technical documentation and developer support available 24/7 via the TaskPro admin network.</p>
              <div className="p-6 glass rounded-3xl border-l-[8px] border-indigo-500">
                <p className="flex items-center gap-3 font-black text-gray-400 text-xs uppercase tracking-widest"><Mail className="text-indigo-500"/> myselfadmin123@gmail.com</p>
              </div>
            </div>
            <form className="glass p-10 rounded-[3.5rem] space-y-4 shadow-3xl border border-white/5" onSubmit={(e)=>{e.preventDefault(); alert("Inquiry Deployed!")}}>
              <input className="w-full p-5 glass rounded-2xl outline-none border border-transparent focus:border-indigo-500 transition-all" placeholder="Full Student Name" required />
              <input className="w-full p-5 glass rounded-2xl outline-none border border-transparent focus:border-indigo-500 transition-all" placeholder="University Email" type="email" required />
              <textarea className="w-full p-5 glass rounded-2xl outline-none h-40 border border-transparent focus:border-indigo-500 transition-all" placeholder="Describe the technical issue or project context..." required />
              <button className="w-full bg-indigo-600 text-white p-5 rounded-2xl font-black text-lg shadow-xl shadow-indigo-500/30 hover:scale-[1.02] transition-transform">Submit Feedback</button>
            </form>
          </div>
        } />

        <Route path="/login" element={user ? <Navigate to="/" /> : (
          <div className="min-h-[85vh] flex items-center justify-center p-6 bg-[url('https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=2000')] bg-cover">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"></div>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="glass p-12 rounded-[3.5rem] w-full max-w-md shadow-2xl border dark:border-white/5 text-center relative z-10">
              <Zap size={40} className="mx-auto text-indigo-500 mb-4" fill="currentColor"/><h2 className="text-4xl font-black dark:text-white uppercase mb-8 tracking-tighter">TaskPro</h2>
              <form onSubmit={handleAuth} className="space-y-4 text-left">
                {isRegister && <input className="w-full p-4 bg-gray-50 dark:bg-slate-900 rounded-2xl outline-none dark:text-white border border-white/5 focus:border-indigo-500" placeholder="Student Name" onChange={e => setAuthForm({...authForm, name: e.target.value})} required />}
                <input className="w-full p-4 bg-gray-50 dark:bg-slate-900 rounded-2xl outline-none dark:text-white border border-white/5 focus:border-indigo-500" placeholder="Email" type="email" onChange={e => setAuthForm({...authForm, email: e.target.value})} required />
                <input className="w-full p-4 bg-gray-50 dark:bg-slate-900 rounded-2xl outline-none dark:text-white border border-white/5 focus:border-indigo-500" placeholder="Password" type="password" onChange={e => setAuthForm({...authForm, password: e.target.value})} required />
                <button className={`w-full ${themes[themeColor].split(' ')[1]} text-white p-4 rounded-2xl font-black shadow-xl mt-4`}>{isRegister ? "Join" : "Sign In"}</button>
              </form>
              <button onClick={() => setIsRegister(!isRegister)} className="mt-6 text-[10px] font-black uppercase text-gray-400 underline tracking-[0.2em]">{isRegister ? "Connect with existing" : "Create New Workspace"}</button>
            </motion.div>
          </div>
        )} />

        <Route path="/" element={!user ? (
          <div className="min-h-[85vh] flex flex-col items-center justify-center text-center px-6 relative overflow-hidden">
            <motion.h1 initial={{y: -50}} animate={{y: 0}} className="text-9xl md:text-[14rem] font-black mb-6 dark:text-white tracking-tighter leading-none italic">TASK<span className="text-indigo-600">PRO</span></motion.h1>
            <p className="max-w-3xl text-gray-500 dark:text-gray-400 text-3xl mb-12 font-medium tracking-tight italic">"The definitive high-performance workspace for the modern student developer."</p>
            <Link to="/login" className="bg-indigo-600 text-white px-14 py-7 rounded-[2.5rem] font-black text-2xl shadow-3xl hover:scale-110 transition-all border border-white/10">Access Dashboard</Link>
            <img src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=2000" alt="bg" className="absolute -bottom-1/2 left-0 w-full opacity-10 pointer-events-none" />
          </div>
        ) : (
          <main className="max-w-7xl mx-auto p-6 md:p-12 grid lg:grid-cols-12 gap-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="lg:col-span-4 space-y-8">
              {/* WELCOME QUOTE CARD */}
              <div className={`p-10 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden ${themes[themeColor].split(' ')[1]}`}>
                <h2 className="text-4xl font-black italic mb-2 tracking-tighter">{welcomeData.greet}!</h2>
                <p className="text-[11px] font-bold uppercase tracking-widest opacity-80 mb-6 flex items-center gap-2"><Quote size={14}/> {welcomeData.quote}</p>
                <div className="w-full bg-white/20 h-3 rounded-full overflow-hidden mb-6 shadow-inner"><motion.div animate={{ width: `${progress}%` }} className="bg-white h-full shadow-[0_0_20px_white]" /></div>
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest opacity-90"><span className="flex items-center gap-2"><Trophy size={14}/> {Math.round(progress)}% Mastery</span><span className="flex items-center gap-2"><Bell size={14}/> Notify Active</span></div>
                <Zap size={120} className="absolute -right-6 -bottom-6 opacity-10 rotate-12" />
              </div>
              <form onSubmit={addTask} className="glass p-8 rounded-[3.5rem] space-y-4 border dark:border-white/5 shadow-2xl">
                <h3 className="font-black text-xs uppercase tracking-widest text-indigo-500 flex items-center gap-2 mb-4"><Plus size={16} strokeWidth={4}/> New Task</h3>
                <input className="w-full p-5 bg-gray-50 dark:bg-slate-900 rounded-3xl outline-none dark:text-white border-2 border-transparent focus:border-indigo-500 transition-all" placeholder="Project Node Name" value={taskTitle} onChange={e => setTaskTitle(e.target.value)} required />
                <textarea className="w-full p-5 bg-gray-50 dark:bg-slate-900 rounded-3xl outline-none dark:text-white h-28 border-2 border-transparent focus:border-indigo-500 transition-all" placeholder="Technical description & requirements..." value={taskDesc} onChange={e => setTaskDesc(e.target.value)} />
                <div className="relative">
                   <Calendar className="absolute left-5 top-5 text-indigo-500" size={18}/>
                   <input type="date" className="w-full p-5 pl-14 bg-gray-50 dark:bg-slate-900 rounded-3xl outline-none dark:text-white border-2 border-transparent focus:border-indigo-500" value={taskDate} onChange={e => setTaskDate(e.target.value)} required />
                </div>
                <button className={`w-full ${themes[themeColor].split(' ')[1]} text-white p-5 rounded-[2.5rem] font-black text-xl shadow-2xl shadow-current/40 hover:opacity-90 active:scale-95 transition-all mt-4`}>Deploy to Cloud</button>
              </form>
            </div>

            <div className="lg:col-span-8 space-y-8">
              <div className="flex flex-col md:flex-row gap-6 justify-between items-center bg-white dark:bg-slate-900 p-8 rounded-[3rem] shadow-2xl border dark:border-white/5 relative overflow-hidden">
                <div className="relative w-full md:w-[24rem] z-10">
                  <Search className="absolute left-6 top-5 text-gray-500" size={20} />
                  <input placeholder="Search internship tasks..." className="w-full pl-16 p-5 glass rounded-full outline-none dark:text-white border-2 border-transparent focus:border-indigo-500 shadow-inner" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
                <div className="flex bg-gray-100 dark:bg-slate-800 px-8 py-4 rounded-full border dark:border-white/5 gap-6 shadow-inner relative z-10">
                   <div className="flex items-center gap-3">
                      <Timer size={24} className={isTimerRunning ? "animate-pulse text-indigo-500" : "text-gray-500"}/>
                      <span className="font-mono font-black text-2xl dark:text-white leading-none">{Math.floor(timeLeft/60)}:{timeLeft%60 < 10 ? '0' : ''}{timeLeft%60}</span>
                   </div>
                   <button onClick={() => setIsTimerRunning(!isTimerRunning)} className={`text-xs font-black uppercase py-2 px-4 rounded-xl ${themes[themeColor].split(' ')[1]} text-white shadow-xl shadow-current/20`}>{isTimerRunning ? "Hold" : "Focus"}</button>
                </div>
              </div>
              <div className="flex bg-gray-200 dark:bg-slate-900 p-2 rounded-3xl w-max shadow-inner border dark:border-white/10">
                  {['All', 'Pending', 'Completed'].map(f => (
                    <button key={f} onClick={() => setFilter(f)} className={`px-10 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-white dark:bg-slate-800 shadow-3xl ' + themes[themeColor].split(' ')[0] : 'text-gray-400 hover:text-gray-200'}`}>{f}</button>
                  ))}
              </div>
              <div className="space-y-6 pb-20">
                <AnimatePresence mode='popLayout'>
                  {filteredTasks.map(task => {
                    const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'Completed';
                    const pColor = task.priority === 'High' ? 'border-rose-500' : task.priority === 'Medium' ? 'border-amber-500' : 'border-emerald-500';
                    const gUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(task.title)}&dates=${task.dueDate.replace(/-/g, '')}/${task.dueDate.replace(/-/g, '')}`;
                    return (
                      <motion.div key={task._id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                        className={`glass p-10 rounded-[3.5rem] flex flex-col md:flex-row md:items-center justify-between gap-8 border-l-[18px] ${pColor} ${task.status === 'Completed' ? 'opacity-40 grayscale blur-[0.5px]' : ''} hover:shadow-4xl transition-all relative overflow-hidden group shadow-2xl`}
                      >
                        <div className="flex items-start gap-10">
                           <button onClick={async () => { const s = task.status === 'Pending' ? 'Completed' : 'Pending'; await axios.put(`${API}/tasks/${task._id}`, { status: s }, { headers: {'x-auth-token': localStorage.getItem('token')} }); loadTasks(localStorage.getItem('token')); }} 
                              className={`p-7 rounded-[2.5rem] shadow-2xl transition-all ${task.status === 'Completed' ? themes[themeColor].split(' ')[1] + ' text-white scale-90' : 'bg-gray-100 dark:bg-slate-900 text-transparent hover:text-gray-400 border-2 dark:border-white/5'}`}
                           ><Check size={40} strokeWidth={5}/></button>
                           <div className="flex flex-col">
                              <h4 className="text-3xl font-black italic dark:text-white uppercase tracking-tighter leading-none mb-1">{task.title}</h4>
                              <p className="text-sm text-gray-500 dark:text-gray-400 font-bold mt-2 mb-6 leading-relaxed max-w-lg">{task.description}</p>
                              <div className="flex flex-wrap gap-5 items-center">
                                 <span className={`text-[10px] font-black px-5 py-2 rounded-full bg-slate-100 dark:bg-slate-900 text-gray-400 border dark:border-white/5 uppercase tracking-widest flex items-center gap-2 ${isOverdue ? 'bg-red-500 text-white animate-pulse' : ''}`}><Tag size={12}/> {new Date(task.dueDate).toLocaleDateString()}</span>
                                 <a href={gUrl} target="_blank" rel="noreferrer" className="text-[10px] font-black uppercase text-indigo-500 hover:underline flex items-center gap-1.5"><ExternalLink size={14}/> Sync Calendar</a>
                              </div>
                           </div>
                        </div>
                        <button onClick={async () => { await axios.delete(`${API}/tasks/${task._id}`, { headers: {'x-auth-token': localStorage.getItem('token')} }); loadTasks(localStorage.getItem('token')); }} className="p-5 rounded-[2rem] text-red-500 bg-red-500/10 hover:bg-red-500 hover:text-white transition-all self-center shadow-2xl shadow-red-500/10 group-hover:scale-110 active:scale-90"><Trash2 size={28}/></button>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                {filteredTasks.length === 0 && <div className="text-center py-20 italic text-gray-500 font-bold opacity-30 tracking-[0.4em] uppercase text-xs">Project Workspace is Empty</div>}
              </div>
            </div>
          </main>
        )} />
      </Routes>
      <footer className="py-20 text-center text-gray-500 text-[10px] font-black uppercase tracking-[0.8em] border-t dark:border-white/5 bg-white dark:bg-slate-950 shadow-inner">TASKPRO ECOSYSTEM • INTERNSHIP PROJECT • {new Date().getFullYear()}</footer>
    </div>
  );
};

export default function App() { return <Router><AppContent /></Router>; }