import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Moon, Sun, Plus, Trash2, Bell, LogOut, Calendar, Zap, Search, Timer, 
  Trophy, Tag, Check, User, Palette, Star, X, Settings, Info, Mail, ExternalLink, Edit3, Quote 
} from 'lucide-react';

// Replace the local URL with your new Render URL
const API = "taskpro.up.railway.app";

// --- SUB-COMPONENT: NAVIGATION ---
const Navigation = ({ user, darkMode, setDarkMode, handleLogout, selectedAvatar, themeColor, themes, setShowProfile, showProfile }) => (
  <nav className="glass sticky top-0 z-50 px-8 py-4 flex justify-between items-center border-b dark:border-white/5 shadow-xl">
    <div className="flex items-center gap-10">
      <Link to="/" className={`flex items-center gap-2 font-black text-3xl tracking-tighter ${themes[themeColor].split(' ')[0]}`}>
        <Zap fill="currentColor" size={28}/> TaskPro
      </Link>
      <div className="hidden md:flex gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
         <Link to="/" className="hover:text-indigo-500 transition flex items-center gap-2 font-bold"><Zap size={14}/> Dashboard</Link>
         <Link to="/about" className="hover:text-indigo-500 transition flex items-center gap-2 font-bold"><Info size={14}/> About</Link>
         <Link to="/contact" className="hover:text-indigo-500 transition flex items-center gap-2 font-bold"><Mail size={14}/> Support</Link>
      </div>
    </div>
    <div className="flex items-center gap-5">
      <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-xl bg-gray-100 dark:bg-slate-900 hover:scale-110 transition-all">
        {darkMode ? <Sun size={20} className="text-yellow-400"/> : <Moon size={20} className="text-gray-600"/>}
      </button>
      {user && (
        <div className="relative">
          <button onClick={() => setShowProfile(!showProfile)} className={`flex items-center gap-3 p-1 pr-4 bg-gray-100 dark:bg-slate-900 rounded-full ring-2 ${themes[themeColor].split(' ')[4]} transition-all`}>
            <img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${selectedAvatar}`} className="w-9 h-9 rounded-full bg-slate-800" alt="p" />
            <User size={14} className="sm:hidden text-gray-400" />
            <span className="text-xs font-black uppercase tracking-widest hidden sm:block dark:text-white">{user.name.split(' ')[0]}</span>
          </button>
        </div>
      )}
    </div>
  </nav>
);

// --- MAIN APP CONTENT ---
const AppContent = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    const savedName = localStorage.getItem('userName');
    return savedName ? { name: savedName } : null;
  });
  const [tasks, setTasks] = useState([]);
  const [darkMode, setDarkMode] = useState(true);
  const [themeColor, setThemeColor] = useState(localStorage.getItem('themeColor') || 'indigo');
  
  // UI & Form States
  const [showProfile, setShowProfile] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState('All');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskDate, setTaskDate] = useState('');
  const [priority, setPriority] = useState('Medium');

  // Timer & Customization
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const avatars = ['Felix', 'Aneka', 'Milo', 'Buddy', 'Cookie', 'Willow'];
  const [selectedAvatar, setSelectedAvatar] = useState(localStorage.getItem('userAvatar') || 'Felix');

  const themes = {
    indigo: "text-indigo-500 bg-indigo-600 border-indigo-500 ring-indigo-500",
    emerald: "text-emerald-500 bg-emerald-600 border-emerald-500 ring-emerald-500",
    rose: "text-rose-500 bg-rose-600 border-rose-500 ring-rose-500",
    amber: "text-amber-500 bg-amber-600 border-amber-500 ring-amber-500"
  };

  const welcomeData = {
    greet: new Date().getHours() < 12 ? "Good Morning" : new Date().getHours() < 17 ? "Good Afternoon" : "Good Evening",
    quote: "Precision is the key to student success."
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
    } else if (timeLeft === 0) { setIsTimerRunning(false); alert("Focus block complete!"); }
    return () => clearInterval(timer);
  }, [isTimerRunning, timeLeft]);

  const handleAuth = async (e, isRegister, authForm) => {
    e.preventDefault();
    try {
      const url = isRegister ? `${API}/auth/register` : `${API}/auth/login`;
      const res = await axios.post(url, authForm);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('userName', res.data.user.name);
      setUser(res.data.user);
      navigate('/');
    } catch (err) { alert("Auth Failed: Check backend"); }
  };

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    setShowProfile(false);
    navigate('/login');
  };

  const addTask = async (e) => {
    e.preventDefault();
    if (!taskTitle || !taskDate) return;
    const token = localStorage.getItem('token');
    const res = await axios.post(`${API}/tasks`, { title: taskTitle, description: taskDesc, dueDate: taskDate, priority }, { headers: { 'x-auth-token': token } });
    setTasks([res.data, ...tasks]);
    setTaskTitle(''); setTaskDesc('');
    alert("TaskPro: Notification Email Sent!");
  };

  const filteredTasks = tasks.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()) && (filter === 'All' ? true : t.status === filter));
  const progress = tasks.length > 0 ? (tasks.filter(t => t.status === 'Completed').length / tasks.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-all duration-500">
      <Navigation user={user} darkMode={darkMode} setDarkMode={setDarkMode} handleLogout={handleLogout} selectedAvatar={selectedAvatar} themeColor={themeColor} themes={themes} setShowProfile={setShowProfile} showProfile={showProfile} />
      
      <AnimatePresence>
        {showProfile && user && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="fixed top-20 right-8 w-80 glass p-8 rounded-[3rem] z-[100] shadow-2xl border dark:border-white/10">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2"><Settings size={14}/> Customization</h4>
              <X size={20} className="cursor-pointer text-gray-500 hover:text-red-500" onClick={() => setShowProfile(false)} />
            </div>

            {/* EDIT NAME */}
            <div className="mb-6 bg-slate-100 dark:bg-slate-800 p-4 rounded-2xl">
              {isEditingName ? (
                <div className="flex gap-2">
                  <input className="bg-transparent border-b border-indigo-500 outline-none text-sm w-full dark:text-white font-bold" value={newName} onChange={e => setNewName(e.target.value)} />
                  <Check size={18} className="text-green-500 cursor-pointer" onClick={async () => {
                    await axios.put(`${API}/auth/update-name`, { newName }, { headers: {'x-auth-token': localStorage.getItem('token')} });
                    setUser({...user, name: newName}); localStorage.setItem('userName', newName); setIsEditingName(false);
                  }} />
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold dark:text-white">{user.name}</span>
                  <Edit3 size={14} className="text-indigo-500 cursor-pointer" onClick={() => { setIsEditingName(true); setNewName(user.name); }} />
                </div>
              )}
            </div>

            <button onClick={() => setShowAvatarPicker(!showAvatarPicker)} className="w-full mb-4 text-[10px] font-black uppercase bg-indigo-500/10 text-indigo-500 p-2 rounded-xl flex items-center justify-center gap-2"><Star size={12}/> Change Avatar</button>
            {showAvatarPicker && (
              <div className="grid grid-cols-3 gap-2 mb-6 animate-in zoom-in">
                {avatars.map(a => <button key={a} onClick={() => {setSelectedAvatar(a); localStorage.setItem('userAvatar', a); setShowAvatarPicker(false);}} className={`p-1 rounded-xl ${selectedAvatar === a ? 'bg-indigo-500 ring-2 ring-white' : 'bg-slate-700'}`}><img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${a}`} alt="a"/></button>)}
              </div>
            )}

            <h4 className="text-[10px] font-black uppercase text-gray-400 mb-3 flex items-center gap-2"><Palette size={14}/> Dashboard Theme</h4>
            <div className="flex gap-4 mb-8">
              {Object.keys(themes).map(c => <button key={c} onClick={() => {setThemeColor(c); localStorage.setItem('themeColor', c);}} className={`w-8 h-8 rounded-full ${themes[c].split(' ')[1]} ${themeColor === c ? 'ring-4 ring-white' : ''}`} />)}
            </div>

            <button onClick={handleLogout} className="w-full p-4 rounded-2xl bg-red-500 text-white font-black flex items-center justify-center gap-2 shadow-xl shadow-red-500/20">
              <LogOut size={18}/> Sign Out
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <Routes>
        <Route path="/about" element={<div className="p-20 text-center dark:text-white"><Info size={60} className="mx-auto text-indigo-500 mb-6"/><h1 className="text-5xl font-black">Internship Final Build</h1><p className="mt-4 text-gray-500">MERN Stack • Full Database Persistence • Email Reminders</p></div>} />
        
        <Route path="/contact" element={
          <div className="max-w-4xl mx-auto py-20 px-6 grid md:grid-cols-2 gap-12">
            <div className="dark:text-white">
              <h2 className="text-5xl font-black mb-6">Support <span className="text-indigo-500">Center</span></h2>
              <div className="space-y-4 font-bold text-gray-500">
                 <p className="flex items-center gap-3"><Mail className="text-indigo-500"/> myselfadmin123@gmail.com</p>
                 <p className="flex items-center gap-3"><Zap className="text-indigo-500"/> 24/7 Digital Assistant</p>
              </div>
            </div>
            <form className="glass p-10 rounded-[3rem] space-y-4 shadow-2xl" onSubmit={(e)=>{e.preventDefault(); alert("Inquiry Sent!")}}>
              <input className="w-full p-4 glass rounded-2xl outline-none dark:text-white border border-white/5" placeholder="Full Name" required />
              <input className="w-full p-4 glass rounded-2xl outline-none dark:text-white border border-white/5" placeholder="University Email" type="email" required />
              <textarea className="w-full p-4 glass rounded-2xl outline-none dark:text-white h-32 border border-white/5" placeholder="Your Message..." required />
              <button className="w-full bg-indigo-600 text-white p-4 rounded-2xl font-black shadow-xl">Deploy Message</button>
            </form>
          </div>
        } />

        <Route path="/login" element={user ? <Navigate to="/" /> : <AuthPage handleAuth={handleAuth} themes={themes} themeColor={themeColor} />} />

        <Route path="/" element={!user ? <LandingPage /> : (
          <main className="max-w-7xl mx-auto p-6 md:p-12 grid lg:grid-cols-12 gap-12">
            <div className="lg:col-span-4 space-y-8">
              {/* WELCOME QUOTE CARD */}
              <div className={`p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden ${themes[themeColor].split(' ')[1]}`}>
                <h2 className="text-4xl font-black italic mb-2">{welcomeData.greet}!</h2>
                <p className="text-[11px] font-bold uppercase tracking-widest opacity-80 flex items-center gap-2 mb-6"><Quote size={14}/> {welcomeData.quote}</p>
                <div className="w-full bg-white/20 h-3 rounded-full overflow-hidden mb-6"><motion.div animate={{ width: `${progress}%` }} className="bg-white h-full shadow-[0_0_15px_white]" /></div>
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                  <span className="flex items-center gap-2"><Trophy size={14}/> {Math.round(progress)}% Score</span>
                  <span className="flex items-center gap-2"><Bell size={14}/> Reminders Active</span>
                </div>
                <Zap size={100} className="absolute -right-4 -bottom-4 opacity-10 rotate-12" />
              </div>

              <form onSubmit={addTask} className="glass p-8 rounded-[3rem] space-y-4 shadow-xl border dark:border-white/5">
                <h3 className="font-black text-xs uppercase tracking-widest text-indigo-500 flex items-center gap-2"><Plus size={16}/> New Task</h3>
                <input className="w-full p-4 bg-gray-50 dark:bg-slate-900 rounded-2xl outline-none dark:text-white border-2 border-transparent focus:border-indigo-500" placeholder="Task Name" value={taskTitle} onChange={e => setTaskTitle(e.target.value)} required />
                <textarea className="w-full p-4 bg-gray-50 dark:bg-slate-900 rounded-2xl outline-none dark:text-white h-20" placeholder="Project description..." value={taskDesc} onChange={e => setTaskDesc(e.target.value)} />
                <input type="date" className="w-full p-4 bg-gray-50 dark:bg-slate-900 rounded-2xl outline-none dark:text-white" value={taskDate} onChange={e => setTaskDate(e.target.value)} required />
                <button className={`w-full ${themes[themeColor].split(' ')[1]} text-white p-5 rounded-2xl font-black text-lg shadow-xl`}>Add to TaskPro</button>
              </form>
            </div>

            <div className="lg:col-span-8 space-y-8">
              <div className="flex flex-col md:flex-row gap-6 justify-between items-center bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-xl border dark:border-white/5">
                <div className="relative w-full md:w-96">
                  <Search className="absolute left-5 top-4 text-gray-500" size={20} />
                  <input placeholder="Search projects..." className="w-full pl-14 p-4 glass rounded-[2rem] outline-none dark:text-white border dark:border-white/5" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
                <div className="flex bg-gray-100 dark:bg-slate-800 px-6 py-3 rounded-2xl gap-4 items-center border dark:border-white/5 shadow-2xl">
                   <Timer size={20} className={isTimerRunning ? "animate-spin text-indigo-500" : "text-gray-500"}/>
                   <span className="font-mono font-black text-lg dark:text-white">{Math.floor(timeLeft/60)}:{timeLeft%60 < 10 ? '0' : ''}{timeLeft%60}</span>
                   <button onClick={() => setIsTimerRunning(!isTimerRunning)} className="text-[10px] font-black uppercase text-indigo-500 underline">{isTimerRunning ? "Pause" : "Focus"}</button>
                </div>
              </div>

              <div className="flex bg-gray-200 dark:bg-slate-900 p-1.5 rounded-2xl w-max shadow-inner">
                  {['All', 'Pending', 'Completed'].map(f => (
                    <button key={f} onClick={() => setFilter(f)} className={`px-8 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${filter === f ? 'bg-white dark:bg-slate-800 shadow-2xl ' + themes[themeColor].split(' ')[0] : 'text-gray-400'}`}>{f}</button>
                  ))}
              </div>

              <div className="space-y-4 pb-20">
                <AnimatePresence mode='popLayout'>
                  {filteredTasks.map(task => {
                    const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'Completed';
                    const pColor = task.priority === 'High' ? 'border-rose-500' : task.priority === 'Medium' ? 'border-amber-500' : 'border-emerald-500';
                    return (
                      <motion.div key={task._id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                        className={`glass p-8 rounded-[3rem] flex flex-col md:flex-row md:items-center justify-between gap-6 border-l-[16px] ${pColor} ${task.status === 'Completed' ? 'opacity-40 grayscale blur-[0.5px]' : ''} hover:shadow-2xl transition-all relative overflow-hidden`}
                      >
                        <div className="flex items-start gap-8">
                           <button onClick={async () => { const s = task.status === 'Pending' ? 'Completed' : 'Pending'; await axios.put(`${API}/tasks/${task._id}`, { status: s }, { headers: {'x-auth-token': localStorage.getItem('token')} }); loadTasks(localStorage.getItem('token')); }} 
                              className={`p-6 rounded-[2rem] shadow-inner ${task.status === 'Completed' ? themes[themeColor].split(' ')[1] + ' text-white shadow-xl' : 'bg-gray-100 dark:bg-slate-900 text-transparent hover:text-gray-400 border dark:border-white/10'}`}
                           ><Check size={32} strokeWidth={4}/></button>
                           <div className="flex flex-col">
                              <h4 className="text-2xl font-black italic dark:text-white uppercase">{task.title}</h4>
                              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-1 mb-4 leading-relaxed">{task.description}</p>
                              <div className="flex flex-wrap gap-4 items-center">
                                 <span className={`text-[10px] font-black px-4 py-1.5 rounded-full flex items-center gap-2 ${isOverdue ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-100 dark:bg-slate-900 text-gray-400 border dark:border-white/5'}`}><Tag size={12}/> {new Date(task.dueDate).toLocaleDateString()}</span>
                                 <a href={`https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(task.title)}&dates=${task.dueDate.replace(/-/g, '')}/${task.dueDate.replace(/-/g, '')}`} target="_blank" rel="noreferrer" className="text-[10px] font-black uppercase text-indigo-500 hover:underline flex items-center gap-1"><ExternalLink size={12}/> Sync Calendar</a>
                              </div>
                           </div>
                        </div>
                        <button onClick={async () => { await axios.delete(`${API}/tasks/${task._id}`, { headers: {'x-auth-token': localStorage.getItem('token')} }); loadTasks(localStorage.getItem('token')); }} className="p-4 rounded-2xl text-red-500 bg-red-500/10 hover:bg-red-500 hover:text-white transition-all self-center"><Trash2 size={24}/></button>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          </main>
        )} />
      </Routes>

      <footer className="py-20 text-center text-gray-500 text-[10px] font-black uppercase tracking-[0.8em] border-t dark:border-white/5">
         TASKPRO ECOSYSTEM • INTERNSHIP PROJECT • {new Date().getFullYear()}
      </footer>
    </div>
  );
};

// --- AUTH PAGE COMPONENT ---
const AuthPage = ({ handleAuth, themes, themeColor }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  return (
    <div className="min-h-[85vh] flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass p-12 rounded-[3.5rem] w-full max-w-md shadow-2xl border dark:border-white/5">
        <div className="text-center mb-8"><Zap size={40} className="mx-auto text-indigo-500" fill="currentColor"/><h2 className="text-3xl font-black dark:text-white uppercase tracking-tighter mt-2">TaskPro Portal</h2></div>
        <form onSubmit={(e) => handleAuth(e, isRegister, form)} className="space-y-4">
          {isRegister && <input className="w-full p-4 bg-gray-50 dark:bg-slate-900 rounded-2xl outline-none dark:text-white" placeholder="Student Name" onChange={e => setForm({...form, name: e.target.value})} required />}
          <input className="w-full p-4 bg-gray-50 dark:bg-slate-900 rounded-2xl outline-none dark:text-white" placeholder="Email" type="email" onChange={e => setForm({...form, email: e.target.value})} required />
          <input className="w-full p-4 bg-gray-50 dark:bg-slate-900 rounded-2xl outline-none dark:text-white" placeholder="Password" type="password" onChange={e => setForm({...form, password: e.target.value})} required />
          <button className={`w-full ${themes[themeColor].split(' ')[1]} text-white p-4 rounded-2xl font-black shadow-xl mt-4`}>Sign {isRegister ? "Up" : "In"}</button>
        </form>
        <button onClick={() => setIsRegister(!isRegister)} className="w-full text-center mt-6 text-gray-400 text-[10px] font-black uppercase tracking-widest underline">{isRegister ? "Go to Login" : "Create Profile"}</button>
      </motion.div>
    </div>
  );
};

// --- LANDING PAGE COMPONENT ---
const LandingPage = () => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-[85vh] flex flex-col items-center justify-center text-center px-6">
    <div className="bg-indigo-600/10 text-indigo-500 px-6 py-2 rounded-full text-xs font-black mb-8 uppercase tracking-[0.2em] border border-indigo-500/20 shadow-xl">High Performance Workspace</div>
    <h1 className="text-7xl md:text-[10rem] font-black mb-8 dark:text-white tracking-tighter leading-none italic">TASK<span className="text-indigo-600">PRO</span></h1>
    <p className="max-w-2xl text-gray-500 dark:text-gray-400 text-2xl mb-12 font-medium">Professional MERN Ecosystem for high-achieving students.</p>
    <Link to="/login" className="bg-indigo-600 text-white px-12 py-6 rounded-[2.5rem] font-black text-xl shadow-2xl hover:scale-110 transition-transform">Get Access</Link>
  </motion.div>
);

export default function App() { return <Router><AppContent /></Router>; }
