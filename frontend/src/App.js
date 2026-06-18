import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Moon, Sun, Plus, Trash2, Bell, LogOut, Calendar, Zap, Search, Timer, 
  Trophy, Tag, Check, User, Palette, Star, X, Settings, Info, Mail, Phone, ExternalLink, Edit3, Quote 
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

  // Form
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskDate, setTaskDate] = useState('');
  const [priority, setPriority] = useState('Medium');

  const avatars = ['Felix', 'Aneka', 'Milo', 'Buddy', 'Cookie', 'Willow', 'Jasper', 'Zoe'];
  const themes = {
    indigo: "text-indigo-500 bg-indigo-600 border-indigo-500 ring-indigo-500 shadow-indigo-500/20",
    emerald: "text-emerald-500 bg-emerald-600 border-emerald-500 ring-emerald-500 shadow-emerald-500/20",
    rose: "text-rose-500 bg-rose-600 border-rose-500 ring-rose-500 shadow-rose-500/20",
    amber: "text-amber-500 bg-amber-600 border-amber-500 ring-amber-500 shadow-amber-500/20"
  };

  const getWelcomeData = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { greet: "Good Morning", quote: "Small wins lead to big success." };
    if (hour < 17) return { greet: "Good Afternoon", quote: "Your focus determines your reality." };
    return { greet: "Good Evening", quote: "The future depends on what you do today." };
  };

  const loadTasks = useCallback(async (token) => {
    try {
      const res = await axios.get(`${API}/tasks`, { headers: { 'x-auth-token': token } });
      setTasks(res.data);
    } catch (err) { console.error(err); }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const name = localStorage.getItem('userName');
    if (token && name) {
      setUser({ name });
      setThemeColor(localStorage.getItem('themeColor') || 'indigo');
      setSelectedAvatar(localStorage.getItem('userAvatar') || 'Felix');
      loadTasks(token);
    }
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode, loadTasks]);

  const syncProfile = async (n, t, av) => {
    const token = localStorage.getItem('token');
    await axios.put(`${API}/auth/update-profile`, { name: n, themeColor: t, avatarSeed: av }, { headers: {'x-auth-token': token} });
    localStorage.setItem('userName', n); localStorage.setItem('themeColor', t); localStorage.setItem('userAvatar', av);
  };

  const handleAuth = async (e, form) => {
    e.preventDefault();
    try {
      const url = isRegister ? `${API}/auth/register` : `${API}/auth/login`;
      const res = await axios.post(url, form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('userName', res.data.user.name);
      setUser(res.data.user);
      setThemeColor(res.data.user.themeColor || 'indigo');
      setSelectedAvatar(res.data.user.avatarSeed || 'Felix');
      navigate('/');
    } catch (err) { alert("Auth Failed"); }
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
             <Link to="/about" className="hover:text-indigo-500 flex items-center gap-1"><Info size={14}/> Info</Link>
             <Link to="/contact" className="hover:text-indigo-500 flex items-center gap-1"><Mail size={14}/> Support</Link>
          </div>
          <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-xl bg-gray-100 dark:bg-slate-900 transition-all hover:scale-110">
            {darkMode ? <Sun size={20} className="text-yellow-400"/> : <Moon size={20} className="text-gray-400"/>}
          </button>
          {user && (
            <div className="relative flex items-center gap-2">
               <button onClick={() => setShowProfile(!showProfile)} className={`flex items-center gap-2 p-1 pr-4 bg-gray-100 dark:bg-slate-900 rounded-full ring-2 ${themes[themeColor].split(' ')[4]} transition-all`}>
                  <img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${selectedAvatar}`} className="w-8 h-8 rounded-full bg-slate-800" alt="me" />
                  <span className="text-[10px] font-black uppercase hidden md:block">{user.name.split(' ')[0]}</span>
               </button>
               <AnimatePresence>
                 {showProfile && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="absolute top-14 right-0 w-72 glass p-6 rounded-[2.5rem] shadow-2xl border dark:border-white/10 z-[100]">
                      <div className="flex justify-between items-center mb-4"><Settings size={14} className="text-gray-400"/><X size={16} className="cursor-pointer text-red-500" onClick={() => setShowProfile(false)}/></div>
                      <div className="mb-4 bg-slate-100 dark:bg-slate-800 p-3 rounded-2xl flex justify-between items-center">
                         {isEditingName ? (
                           <div className="flex gap-2 w-full"><input className="bg-transparent border-b border-indigo-500 outline-none text-xs font-bold w-full" value={newName} onChange={e => setNewName(e.target.value)} /><Check size={16} className="text-green-500 cursor-pointer" onClick={() => { setUser({...user, name: newName}); setIsEditingName(false); syncProfile(newName, themeColor, selectedAvatar); }}/></div>
                         ) : (
                           <><span className="text-xs font-bold">{user.name}</span><Edit3 size={12} className="text-indigo-500 cursor-pointer" onClick={() => {setNewName(user.name); setIsEditingName(true);}}/></>
                         )}
                      </div>
                      <div className="grid grid-cols-6 gap-1 mb-4">
                        {avatars.map(a => <button key={a} onClick={() => {setSelectedAvatar(a); syncProfile(user.name, themeColor, a);}} className={`p-1 rounded ${selectedAvatar === a ? 'bg-indigo-500' : 'bg-slate-700'}`}><img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${a}`} alt="a"/></button>)}
                      </div>
                      <div className="flex gap-2 mb-6">
                        {Object.keys(themes).map(c => <button key={c} onClick={() => {setThemeColor(c); syncProfile(user.name, c, selectedAvatar);}} className={`w-6 h-6 rounded-full ${themes[c].split(' ')[1]}`}/>)}
                      </div>
                      <button onClick={() => {localStorage.clear(); window.location.href="/";}} className="w-full p-3 rounded-2xl bg-red-500 text-white text-xs font-black uppercase flex items-center justify-center gap-2"><LogOut size={14}/> Sign Out</button>
                    </motion.div>
                 )}
               </AnimatePresence>
            </div>
          )}
        </div>
      </nav>

      <Routes>
        <Route path="/about" element={<div className="p-12 md:p-24 text-center max-w-4xl mx-auto flex flex-col items-center gap-6"><Rocket size={64} className="text-indigo-500 animate-bounce"/><h1 className="text-5xl font-black">Internship Project v2.0</h1><p className="text-gray-500 leading-relaxed">TaskPro is a full-stack student ecosystem built with React, Node.js, and MongoDB. It features real-time cloud synchronization, automated email dispatch, and a context-aware focus engine. It was developed to showcase full-stack proficiency during a 45-day intensive build.</p><div className="flex gap-4 items-center mt-6 text-gray-500 font-bold uppercase text-[10px] tracking-widest"><Cpu/><Shield/><Star/><Code/> MERN STACK CERTIFIED</div></div>} />
        <Route path="/contact" element={<div className="p-12 md:p-24 text-center"><Mail size={64} className="mx-auto text-indigo-500 mb-6"/><h1 className="text-5xl font-black">Developer Support</h1><p className="text-gray-500 mt-4 text-xl">Reach out to: <b>myselfadmin123@gmail.com</b></p><p className="text-gray-500 mt-2 italic">Available 24/7 for technical assistance.</p></div>} />
        
        <Route path="/login" element={
          <div className="min-h-[85vh] flex items-center justify-center p-4">
             <LoginForm handleAuth={handleAuth} isRegister={isRegister} setIsRegister={setIsRegister} themeColor={themeColor} themes={themes} />
          </div>
        } />

        <Route path="/" element={!user ? <LandingPage /> : (
          <main className="max-w-7xl mx-auto p-4 md:p-12 flex flex-col lg:flex-row gap-8 lg:gap-12">
            {/* MOBILE-READY SIDEBAR (FLEX-COL) */}
            <div className="w-full lg:w-1/3 flex flex-col gap-6">
              <div className={`p-8 md:p-10 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[250px] ${themes[themeColor].split(' ')[1]}`}>
                 <div>
                    <h2 className="text-4xl font-black italic mb-1 leading-none">{getWelcomeData().greet}!</h2>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-80 flex items-center gap-2 mb-6"><Quote size={14}/> {getWelcomeData().quote}</p>
                 </div>
                 <div>
                    <div className="w-full bg-white/20 h-2.5 rounded-full overflow-hidden mb-4"><motion.div animate={{ width: `${progress}%` }} className="bg-white h-full shadow-[0_0_15px_white]" /></div>
                    <p className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><Trophy size={14}/> {Math.round(progress)}% Mastery</p>
                 </div>
                 <Zap size={100} className="absolute -right-4 -bottom-4 opacity-10 rotate-12" />
              </div>

              <form onSubmit={addTask} className="glass p-8 rounded-[2.5rem] space-y-4 border dark:border-white/5 shadow-xl flex flex-col">
                 <h3 className="font-black text-xs uppercase tracking-widest text-indigo-500 flex items-center gap-2 mb-2"><Plus size={16}/> Create Node</h3>
                 <input className="w-full p-4 bg-gray-50 dark:bg-slate-900 rounded-2xl outline-none dark:text-white border border-transparent focus:border-indigo-500" placeholder="Task Name" value={taskTitle} onChange={e => setTaskTitle(e.target.value)} required />
                 <textarea className="w-full p-4 bg-gray-50 dark:bg-slate-900 rounded-2xl outline-none dark:text-white h-24 border border-transparent focus:border-indigo-500" placeholder="Project context/text..." value={taskDesc} onChange={e => setTaskDesc(e.target.value)} />
                 <div className="relative flex items-center"><Calendar className="absolute left-4 text-gray-500" size={16}/><input type="date" className="w-full p-4 pl-12 bg-gray-100 dark:bg-slate-900 rounded-2xl outline-none dark:text-white border border-transparent focus:border-indigo-500" value={taskDate} onChange={e => setTaskDate(e.target.value)} required /></div>
                 <button className={`w-full ${themes[themeColor].split(' ')[1]} text-white p-4 rounded-2xl font-black shadow-xl hover:scale-[1.02] active:scale-95 transition-all mt-2`}>Deploy Task</button>
              </form>
            </div>

            {/* RESPONSIVE CONTENT AREA */}
            <div className="w-full lg:w-2/3 flex flex-col gap-6">
              <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[2.5rem] shadow-xl border dark:border-white/5">
                <div className="relative w-full md:flex-1 max-w-md">
                  <Search className="absolute left-5 top-4 text-gray-500" size={20} />
                  <input placeholder="Search projects..." className="w-full pl-14 p-4 glass rounded-[2rem] outline-none dark:text-white border border-transparent focus:border-indigo-500 shadow-inner" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
                <div className="flex bg-gray-100 dark:bg-slate-800 px-6 py-3 rounded-full border dark:border-white/5 gap-6 items-center shadow-inner">
                   <div className="flex items-center gap-3">
                      <Timer size={22} className={timeLeft < 300 ? "text-red-500 animate-pulse" : "text-indigo-500"}/>
                      <span className="font-mono font-black text-2xl dark:text-white">{Math.floor(timeLeft/60)}:{timeLeft%60 < 10 ? '0' : ''}{timeLeft%60}</span>
                   </div>
                   <button onClick={() => setIsTimerRunning(!isTimerRunning)} className={`text-[10px] font-black uppercase px-4 py-1.5 rounded-lg ${themes[themeColor].split(' ')[1]} text-white shadow-xl`}>{isTimerRunning ? "Pause" : "Focus"}</button>
                </div>
              </div>

              <div className="flex bg-gray-200 dark:bg-slate-900 p-1.5 rounded-2xl w-max flex-wrap gap-1">
                  {['All', 'Pending', 'Completed'].map(f => (
                    <button key={f} onClick={() => setFilter(f)} className={`px-6 md:px-10 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${filter === f ? 'bg-white dark:bg-slate-800 shadow-2xl ' + themes[themeColor].split(' ')[0] : 'text-gray-400 hover:text-gray-200'}`}>{f}</button>
                  ))}
              </div>

              <div className="flex flex-col gap-4 pb-20">
                <AnimatePresence mode='popLayout'>
                  {filteredTasks.map(task => {
                    const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'Completed';
                    const pColor = task.priority === 'High' ? 'border-rose-500' : task.priority === 'Medium' ? 'border-amber-500' : 'border-emerald-500';
                    return (
                      <motion.div key={task._id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                        className={`glass p-6 md:p-8 rounded-[2.5rem] flex flex-col md:flex-row md:items-center justify-between gap-6 border-l-[16px] ${pColor} ${task.status === 'Completed' ? 'opacity-40 grayscale blur-[0.5px]' : ''} hover:shadow-2xl transition-all relative overflow-hidden shadow-xl`}
                      >
                         <div className="flex items-start gap-6 md:gap-8 flex-1">
                           <button onClick={async () => { const s = task.status === 'Pending' ? 'Completed' : 'Pending'; await axios.put(`${API}/tasks/${task._id}`, { status: s }, { headers: {'x-auth-token': localStorage.getItem('token')} }); loadTasks(localStorage.getItem('token')); }} 
                              className={`p-5 md:p-6 rounded-[1.8rem] transition-all shadow-inner ${task.status === 'Completed' ? themes[themeColor].split(' ')[1] + ' text-white shadow-xl' : 'bg-gray-100 dark:bg-slate-900 text-transparent hover:text-gray-400 border dark:border-white/5'}`}
                           ><Check size={28} strokeWidth={4}/></button>
                           <div className="flex flex-col flex-1">
                              <h4 className="text-xl md:text-2xl font-black dark:text-white uppercase tracking-tighter leading-tight mb-1 italic">{task.title}</h4>
                              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed mb-4">{task.description}</p>
                              <div className="flex flex-wrap gap-4 items-center">
                                 <span className={`text-[10px] font-black px-4 py-1.5 rounded-full bg-slate-100 dark:bg-slate-900 text-gray-400 border dark:border-white/5 uppercase flex items-center gap-2 ${isOverdue ? 'bg-red-500 text-white animate-pulse' : ''}`}><Tag size={12}/> {new Date(task.dueDate).toLocaleDateString()}</span>
                                 <a href={`https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(task.title)}&dates=${task.dueDate.replace(/-/g, '')}/${task.dueDate.replace(/-/g, '')}`} target="_blank" rel="noreferrer" className={`text-[10px] font-black uppercase flex items-center gap-1.5 hover:underline ${themes[themeColor].split(' ')[0]}`}><ExternalLink size={14}/> Sync Calendar</a>
                              </div>
                           </div>
                         </div>
                         <button onClick={async () => { await axios.delete(`${API}/tasks/${task._id}`, { headers: {'x-auth-token': localStorage.getItem('token')} }); loadTasks(localStorage.getItem('token')); }} className="p-4 rounded-2xl text-red-500 bg-red-500/10 hover:bg-red-500 hover:text-white transition-all self-end md:self-center shadow-xl"><Trash2 size={22}/></button>
                         <Bell className="absolute -right-4 -top-4 opacity-5 rotate-45" size={80}/>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                {filteredTasks.length === 0 && <div className="text-center py-20 text-gray-500 font-bold opacity-30 tracking-widest uppercase text-xs">No active nodes in this view</div>}
              </div>
            </div>
          </main>
        )} />
      </Routes>
      <footer className="py-20 text-center text-gray-500 text-[10px] font-black uppercase tracking-[0.8em] border-t dark:border-white/5">TASKPRO ECOSYSTEM • INTERNSHIP FINAL PROJECT</footer>
    </div>
  );
};

// --- SUB-COMPONENTS ---
const LoginForm = ({ handleAuth, isRegister, setIsRegister, themeColor, themes }) => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  return (
    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass p-10 md:p-14 rounded-[3.5rem] w-full max-w-md shadow-2xl border dark:border-white/5 relative z-10">
      <div className="text-center mb-10"><Zap size={44} className="mx-auto text-indigo-500 mb-4" fill="currentColor"/><h2 className="text-4xl font-black dark:text-white uppercase tracking-tighter">TaskPro Portal</h2><p className="text-gray-500 text-xs font-bold mt-2 uppercase tracking-widest">Connect to Workspace</p></div>
      <form onSubmit={(e) => handleAuth(e, form)} className="space-y-4">
        {isRegister && <div className="space-y-1"><label className="text-[10px] font-black uppercase text-gray-500 ml-3">Full Student Name</label><input className="w-full p-4 bg-gray-50 dark:bg-slate-900 rounded-2xl outline-none dark:text-white border border-white/5 focus:border-indigo-500" placeholder="Yesaswi" onChange={e => setForm({...form, name: e.target.value})} required /></div>}
        <div className="space-y-1"><label className="text-[10px] font-black uppercase text-gray-500 ml-3">University Email</label><input className="w-full p-4 bg-gray-50 dark:bg-slate-900 rounded-2xl outline-none dark:text-white border border-white/5 focus:border-indigo-500" placeholder="student@university.edu" type="email" onChange={e => setForm({...form, email: e.target.value})} required /></div>
        <div className="space-y-1"><label className="text-[10px] font-black uppercase text-gray-500 ml-3">Workspace Password</label><input className="w-full p-4 bg-gray-50 dark:bg-slate-900 rounded-2xl outline-none dark:text-white border border-white/5 focus:border-indigo-500" placeholder="••••••••" type="password" onChange={e => setForm({...form, password: e.target.value})} required /></div>
        <button className={`w-full ${themes[themeColor].split(' ')[1]} text-white p-5 rounded-[2rem] font-black shadow-xl mt-6 transform active:scale-95 transition-all`}>{isRegister ? "Join TaskPro" : "Access Workspace"}</button>
      </form>
      <button onClick={() => setIsRegister(!isRegister)} className="w-full text-center mt-8 text-gray-500 text-[10px] font-black uppercase tracking-widest underline decoration-indigo-500/30 decoration-2 underline-offset-4">{isRegister ? "Go to Sign In" : "Create New Profile"}</button>
    </motion.div>
  );
};

const LandingPage = () => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-[85vh] flex flex-col items-center justify-center text-center px-6">
    <div className="bg-indigo-600/10 text-indigo-500 px-6 py-2 rounded-full text-[10px] font-black mb-8 uppercase tracking-[0.3em] border border-indigo-500/20 shadow-xl">Master Student Productivity</div>
    <h1 className="text-7xl md:text-[11rem] font-black mb-8 dark:text-white tracking-tighter leading-none italic">TASK<span className="text-indigo-600">PRO</span></h1>
    <p className="max-w-2xl text-gray-500 dark:text-gray-400 text-xl md:text-3xl mb-12 font-medium leading-tight">Elevate your student workflow with a professional high-performance workspace.</p>
    <div className="flex flex-col sm:flex-row gap-6">
      <Link to="/login" className="bg-indigo-600 text-white px-14 py-7 rounded-[2.5rem] font-black text-2xl shadow-3xl hover:scale-110 transition-all flex items-center gap-3"><Zap fill="white"/> Access Portal</Link>
      <Link to="/about" className="glass dark:text-white px-14 py-7 rounded-[2.5rem] font-black text-2xl border dark:border-white/10 hover:bg-white/10 transition-all">Details</Link>
    </div>
  </motion.div>
);

export default function App() { return <Router><AppContent /></Router>; }