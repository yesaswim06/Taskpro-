import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Moon, Sun, Plus, Trash2, Bell, LogOut, Calendar, Zap, Search, Timer, 
  Trophy, Tag, Check, User, Palette, Star, X, Settings, Info, Mail, ExternalLink, Edit3, Quote, ChevronRight, MessageSquare, Users, Shield, Rocket, Cpu, Code
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
  
  // UI & Form
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
  const [assignedTo, setAssignedTo] = useState('');
  const [commentText, setCommentText] = useState({});

  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const avatars = ['Felix', 'Aneka', 'Milo', 'Buddy', 'Cookie', 'Willow', 'Jasper', 'Zoe'];

  const themes = {
    indigo: "text-indigo-500 bg-indigo-600 border-indigo-500 ring-indigo-500",
    emerald: "text-emerald-500 bg-emerald-600 border-emerald-500 ring-emerald-500",
    rose: "text-rose-500 bg-rose-600 border-rose-500 ring-rose-500",
    amber: "text-amber-500 bg-amber-600 border-amber-500 ring-amber-500"
  };

  const welcomeData = {
    greet: new Date().getHours() < 12 ? "Good Morning" : new Date().getHours() < 17 ? "Good Afternoon" : "Good Evening",
    quote: "Win the morning, win the day."
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

  const syncProfile = async (n, t, a) => {
    const token = localStorage.getItem('token');
    try {
      await axios.put(`${API}/auth/update-profile`, { name: n, themeColor: t, avatarSeed: a }, { headers: {'x-auth-token': token} });
      localStorage.setItem('userName', n); localStorage.setItem('themeColor', t); localStorage.setItem('userAvatar', a);
    } catch (err) { console.log("Sync Error"); }
  };

  const handleAuth = async (e, isRegister, form) => {
    e.preventDefault();
    try {
      const url = isRegister ? `${API}/auth/register` : `${API}/auth/login`;
      const res = await axios.post(url, form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('userName', res.data.user.name);
      localStorage.setItem('themeColor', res.data.user.themeColor || 'indigo');
      localStorage.setItem('userAvatar', res.data.user.avatarSeed || 'Felix');
      setUser(res.data.user);
      setThemeColor(res.data.user.themeColor || 'indigo');
      setSelectedAvatar(res.data.user.avatarSeed || 'Felix');
      navigate('/');
    } catch (err) { alert("Auth Error: Check backend"); }
  };

  const addTask = async (e) => {
    e.preventDefault();
    if (!taskTitle || !taskDate) return;
    const token = localStorage.getItem('token');
    const res = await axios.post(`${API}/tasks`, { title: taskTitle, description: taskDesc, dueDate: taskDate, priority, assignedTo }, { headers: { 'x-auth-token': token } });
    setTasks([res.data, ...tasks]);
    setTaskTitle(''); setTaskDesc(''); setAssignedTo('');
    alert("TaskPro: Notification Email Dispatched!");
  };

  const progress = tasks.length > 0 ? (tasks.filter(t => t.status === 'Completed').length / tasks.length) * 100 : 0;
  const filteredTasks = tasks.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()) && (filter === 'All' ? true : t.status === filter));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-all duration-500 font-sans text-slate-900 dark:text-white">
      {/* NAVBAR */}
      <nav className="glass sticky top-0 z-50 px-4 md:px-12 py-4 flex justify-between items-center border-b dark:border-white/5">
        <Link to="/" className={`flex items-center gap-2 font-black text-2xl md:text-3xl tracking-tighter ${themes[themeColor].split(' ')[0]}`}><Zap fill="currentColor"/> TaskPro</Link>
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex gap-6 text-[10px] font-black uppercase tracking-widest text-gray-400">
             <Link to="/about" className="hover:text-indigo-500 flex items-center gap-1 font-bold underline"><Info size={14}/> Info</Link>
             <Link to="/contact" className="hover:text-indigo-500 flex items-center gap-1 font-bold underline"><Mail size={14}/> Support</Link>
          </div>
          <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-xl bg-gray-100 dark:bg-slate-900 hover:rotate-12 transition-all">
            {darkMode ? <Sun size={20} className="text-yellow-400"/> : <Moon size={20} className="text-gray-400"/>}
          </button>
          {user && (
            <button onClick={() => setShowProfile(!showProfile)} className={`flex items-center gap-2 p-1 pr-4 bg-gray-100 dark:bg-slate-900 rounded-full ring-2 ${themes[themeColor].split(' ')[4]} transition-all`}>
              <img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${selectedAvatar}`} className="w-8 h-8 rounded-full bg-slate-800" alt="p" />
              <span className="text-[10px] font-black uppercase hidden md:block">{user.name.split(' ')[0]}</span>
            </button>
          )}
        </div>
      </nav>

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
            <button onClick={() => setShowAvatarPicker(!showAvatarPicker)} className="w-full mb-4 text-[10px] font-black uppercase bg-indigo-500/10 text-indigo-500 p-2 rounded-xl flex items-center justify-center gap-2"><Star size={12}/> Avatar Gallery</button>
            {showAvatarPicker && (
              <div className="grid grid-cols-4 gap-2 mb-6">
                {avatars.map(a => <button key={a} onClick={() => {setSelectedAvatar(a); syncProfile(user.name, themeColor, a); setShowAvatarPicker(false);}} className={`p-1 rounded-xl ${selectedAvatar === a ? 'ring-2 ring-white bg-indigo-500 shadow-lg' : 'bg-slate-700'}`}><img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${a}`} alt="a"/></button>)}
              </div>
            )}
            <h4 className="text-[10px] font-black uppercase text-gray-400 mb-3 flex items-center gap-2"><Palette size={14}/> Themes</h4>
            <div className="flex gap-4 mb-8">
              {Object.keys(themes).map(c => <button key={c} onClick={() => {setThemeColor(c); syncProfile(user.name, c, selectedAvatar);}} className={`w-8 h-8 rounded-full ${themes[c].split(' ')[1]} ${themeColor === c ? 'ring-4 ring-white scale-110 shadow-xl' : ''}`} />)}
            </div>
            <button onClick={() => {localStorage.clear(); window.location.href="/";}} className="w-full p-4 rounded-2xl bg-red-500 text-white font-black flex items-center justify-center gap-2 shadow-xl shadow-red-500/20 hover:scale-95 transition-all"><LogOut size={18}/> End Session</button>
          </motion.div>
        )}
      </AnimatePresence>

      <Routes>
        <Route path="/about" element={<div className="max-w-6xl mx-auto py-20 px-6"><div className="text-center mb-16"><h1 className="text-7xl font-black tracking-tighter uppercase">Project <span className="text-indigo-500">Core</span></h1><p className="text-gray-500 mt-4 text-xl font-medium tracking-tight italic">Internship Performance Workspace.</p></div><div className="grid md:grid-cols-3 gap-10"><div className="glass p-10 rounded-[3.5rem] border-t-[12px] border-indigo-600 shadow-2xl"><Shield className="text-indigo-500 mb-6" size={32}/><h4 className="text-xl font-black mb-2">Cloud Node</h4><p className="text-sm text-gray-400 leading-relaxed font-medium">Secured with JWT-RSA authentication and full MongoDB Atlas cloud clustering.</p></div><div className="glass p-10 rounded-[3.5rem] border-t-[12px] border-emerald-600 shadow-2xl"><Rocket className="text-emerald-500 mb-6" size={32}/><h4 className="text-xl font-black mb-2">Native Flow</h4><p className="text-sm text-gray-400 leading-relaxed font-medium">Built with the Native MongoDB Driver to achieve sub-50ms query cycles on Railway infrastructure.</p></div><div className="glass p-10 rounded-[3.5rem] border-t-[12px] border-amber-600 shadow-2xl"><Cpu className="text-amber-500 mb-6" size={32}/><h4 className="text-xl font-black mb-2">Automation</h4><p className="text-sm text-gray-400 leading-relaxed font-medium">Nodemailer integrated system for real-time task dispatches and Google Calendar template generation.</p></div></div></div>} />
        <Route path="/contact" element={<div className="max-w-4xl mx-auto py-20 px-6 grid md:grid-cols-2 gap-12 text-white items-center"><div><h2 className="text-7xl font-black mb-6 tracking-tighter leading-none">HELP<br/><span className="text-indigo-500 italic">DESK</span></h2><p className="text-gray-500 text-lg mb-8 font-bold leading-relaxed tracking-tight">System admin support available at <b>myselfadmin123@gmail.com</b></p><div className="flex gap-4"><Code className="text-indigo-500"/><Cpu className="text-emerald-500"/><Star className="text-amber-500"/></div></div><form className="glass p-10 rounded-[3.5rem] space-y-4 shadow-3xl border border-white/5" onSubmit={(e)=>{e.preventDefault(); alert("Deployed!")}}><input className="w-full p-5 glass rounded-2xl outline-none" placeholder="Context" required /><textarea className="w-full p-5 glass rounded-2xl outline-none h-40" placeholder="Details..." required /><button className="w-full bg-indigo-600 text-white p-5 rounded-2xl font-black shadow-xl shadow-indigo-500/20">Send Signal</button></form></div>} />
        <Route path="/login" element={user ? <Navigate to="/" /> : <AuthPage handleAuth={handleAuth} themes={themes} themeColor={themeColor} />} />
        <Route path="/" element={!user ? <LandingPage /> : (
          <main className="max-w-7xl mx-auto p-4 md:p-12 flex flex-col lg:flex-row gap-8 lg:gap-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="w-full lg:w-1/3 flex flex-col gap-6">
              <div className={`p-10 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[300px] ${themes[themeColor].split(' ')[1]}`}>
                <div><h2 className="text-4xl font-black italic mb-2 tracking-tighter leading-none">{welcomeData.greet}!</h2><p className="text-[11px] font-bold uppercase tracking-widest opacity-80 flex items-center gap-2 mb-6 leading-relaxed"><Quote size={14}/> {welcomeData.quote}</p></div>
                <div><div className="w-full bg-white/20 h-2.5 rounded-full overflow-hidden mb-6"><motion.div animate={{ width: `${progress}%` }} className="bg-white h-full shadow-[0_0_20px_white]" /></div><p className="text-[10px] font-black uppercase tracking-widest"><Trophy size={14} className="inline mr-1"/> {Math.round(progress)}% Mastery</p></div>
                <Zap size={120} className="absolute -right-6 -bottom-6 opacity-10 rotate-12" />
              </div>
              <form onSubmit={addTask} className="glass p-8 rounded-[3.5rem] space-y-4 border dark:border-white/5 shadow-2xl">
                <h3 className="font-black text-xs uppercase tracking-widest text-indigo-500 flex items-center gap-2 mb-2"><Plus size={16}/> New Task</h3>
                <input className="w-full p-5 bg-gray-50 dark:bg-slate-900 rounded-3xl outline-none dark:text-white border border-transparent focus:border-indigo-500 transition-all" placeholder="Objective Name" value={taskTitle} onChange={e => setTaskTitle(e.target.value)} required />
                <textarea className="w-full p-5 bg-gray-50 dark:bg-slate-900 rounded-3xl outline-none dark:text-white h-24 border border-transparent focus:border-indigo-500 transition-all" placeholder="Project details & objectives..." value={taskDesc} onChange={e => setTaskDesc(e.target.value)} />
                <div className="flex items-center gap-2 p-4 bg-gray-50 dark:bg-slate-900 rounded-2xl border border-transparent focus-within:border-indigo-500"><Users size={16} className="text-gray-500"/><input className="bg-transparent outline-none text-sm w-full dark:text-white" placeholder="Delegation (Name)" value={assignedTo} onChange={e => setAssignedTo(e.target.value)} /></div>
                <div className="relative flex items-center"><Calendar className="absolute left-5 top-5 text-indigo-500" size={18}/><input type="date" className="w-full p-5 pl-14 bg-gray-50 dark:bg-slate-900 rounded-3xl outline-none dark:text-white" value={taskDate} onChange={e => setTaskDate(e.target.value)} required /></div>
                <button className={`w-full ${themes[themeColor].split(' ')[1]} text-white p-5 rounded-[2.5rem] font-black text-lg shadow-xl mt-4`}>Deploy Task</button>
              </form>
            </div>
            <div className="w-full lg:w-2/3 space-y-8">
              <div className="flex flex-col md:flex-row gap-6 justify-between items-center bg-white dark:bg-slate-900 p-8 rounded-[3rem] shadow-xl border dark:border-white/5">
                <div className="relative w-full md:w-[24rem]"><Search className="absolute left-6 top-5 text-gray-500" size={20} /><input placeholder="Search projects..." className="w-full pl-16 p-5 glass rounded-full outline-none dark:text-white border-2 border-transparent focus:border-indigo-500 shadow-inner" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div>
                <div className="flex bg-gray-100 dark:bg-slate-800 px-8 py-4 rounded-full border dark:border-white/5 gap-6 items-center">
                   <div className="flex items-center gap-3"><Timer size={24} className={isTimerRunning ? "animate-pulse text-indigo-500" : "text-gray-500"}/><span className="font-mono font-black text-2xl dark:text-white leading-none">{Math.floor(timeLeft/60)}:{timeLeft%60 < 10 ? '0' : ''}{timeLeft%60}</span></div>
                   <button onClick={() => setIsTimerRunning(!isTimerRunning)} className={`text-[10px] font-black uppercase py-2 px-4 rounded-xl ${themes[themeColor].split(' ')[1]} text-white shadow-xl`}>{isTimerRunning ? "Hold" : "Focus"}</button>
                </div>
              </div>
              <div className="flex bg-gray-200 dark:bg-slate-900 p-2 rounded-3xl w-max shadow-inner">
                  {['All', 'To-Do', 'In Progress', 'Review', 'Completed'].map(f => (
                    <button key={f} onClick={() => setFilter(f)} className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase transition-all ${filter === f ? 'bg-white dark:bg-slate-800 shadow-3xl ' + themes[themeColor].split(' ')[0] : 'text-gray-400'}`}>{f}</button>
                  ))}
              </div>
              <div className="space-y-6 pb-20">
                <AnimatePresence mode='popLayout'>
                  {tasks.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()) && (filter === 'All' ? true : t.status === filter)).map(task => {
                    const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'Completed';
                    const pColor = task.priority === 'High' ? 'border-rose-500' : task.priority === 'Medium' ? 'border-amber-500' : 'border-emerald-500';
                    return (
                      <motion.div key={task._id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className={`glass p-10 rounded-[3.5rem] flex flex-col gap-8 border-l-[18px] ${pColor} ${task.status === 'Completed' ? 'opacity-40 grayscale blur-[0.5px]' : ''} hover:shadow-4xl transition-all relative overflow-hidden shadow-2xl`}>
                        <div className="flex flex-col md:flex-row justify-between gap-6">
                           <div className="flex items-start gap-10 flex-1">
                              <button onClick={async () => { const s = task.status === 'Pending' || task.status === 'To-Do' ? 'Completed' : 'To-Do'; await axios.put(`${API}/tasks/${task._id}`, { status: s }, { headers: {'x-auth-token': localStorage.getItem('token')} }); loadTasks(localStorage.getItem('token')); }} 
                                 className={`p-7 rounded-[2.5rem] shadow-2xl transition-all ${task.status === 'Completed' ? themes[themeColor].split(' ')[1] + ' text-white' : 'bg-gray-100 dark:bg-slate-900 text-transparent border-2 dark:border-white/5 hover:text-gray-400'}`}
                              ><Check size={36} strokeWidth={5}/></button>
                              <div className="flex flex-col flex-1"><div className="flex items-center gap-3"><h4 className="text-3xl font-black italic dark:text-white uppercase tracking-tighter leading-none">{task.title}</h4><span className="text-[10px] font-black uppercase text-gray-500 bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded">{task.status}</span></div><p className="text-sm text-gray-500 dark:text-gray-400 font-bold mt-2 leading-relaxed">{task.description}</p>
                              <div className="flex flex-wrap gap-4 mt-6"><span className="text-[10px] font-black px-4 py-1.5 rounded-full bg-slate-100 dark:bg-slate-900 text-gray-400 flex items-center gap-2"><Users size={12}/> Delegate: {task.assignedTo || "Self"}</span><span className={`text-[10px] font-black px-4 py-1.5 rounded-full bg-slate-100 dark:bg-slate-900 text-gray-400 flex items-center gap-2 ${isOverdue ? 'bg-red-500 text-white animate-pulse' : ''}`}><Tag size={12}/> Due: {new Date(task.dueDate).toLocaleDateString()}</span><a href={`https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(task.title)}&dates=${task.dueDate.replace(/-/g, '')}/${task.dueDate.replace(/-/g, '')}`} target="_blank" rel="noreferrer" className="text-[10px] font-black uppercase text-indigo-500 hover:underline flex items-center gap-1.5"><ExternalLink size={14}/> Sync Calendar</a></div></div>
                           </div>
                           <div className="flex md:flex-col gap-2 self-center">
                              <button onClick={() => axios.put(`${API}/tasks/${task._id}`, { status: 'In Progress' }, { headers: {'x-auth-token': localStorage.getItem('token')} }).then(()=>loadTasks(localStorage.getItem('token')))} className="p-3 bg-indigo-500/10 text-indigo-500 rounded-xl hover:bg-indigo-500 hover:text-white transition-all"><ChevronRight size={20}/></button>
                              <button onClick={async () => { await axios.delete(`${API}/tasks/${task._id}`, { headers: {'x-auth-token': localStorage.getItem('token')} }); loadTasks(localStorage.getItem('token')); }} className="p-3 rounded-xl text-red-600 bg-red-500/10 hover:bg-red-600 hover:text-white transition-all"><Trash2 size={24}/></button>
                           </div>
                        </div>
                        {/* COLLABORATION HUB */}
                        <div className="mt-4 border-t dark:border-white/5 pt-8">
                           <h5 className="text-[10px] font-black uppercase text-gray-500 mb-6 flex items-center gap-2 tracking-widest"><MessageSquare size={14}/> Collaboration Hub</h5>
                           <div className="space-y-4 mb-6">
                              {task.comments?.map((c, i) => (<div key={i} className="text-xs bg-slate-50 dark:bg-slate-900 p-4 rounded-[2rem] border dark:border-white/5 shadow-inner"><span className="font-black text-indigo-500 mr-2 uppercase tracking-tighter">{c.userName}:</span><span className="text-gray-500 font-medium">{c.text}</span></div>))}
                           </div>
                           <div className="flex gap-3"><input className="w-full p-4 glass rounded-[1.5rem] outline-none text-xs dark:text-white border border-transparent focus:border-indigo-500 shadow-inner" placeholder="Signal update or share feedback..." value={commentText[task._id] || ""} onChange={e => setCommentText({...commentText, [task._id]: e.target.value})} /><button onClick={async () => { await axios.post(`${API}/tasks/${task._id}/comments`, { text: commentText[task._id] }, { headers: {'x-auth-token': localStorage.getItem('token')} }); setCommentText({...commentText, [task._id]: ""}); loadTasks(localStorage.getItem('token')); }} className={`p-4 rounded-2xl ${themes[themeColor].split(' ')[1]} text-white shadow-xl`}><Plus size={20}/></button></div>
                        </div>
                        <Bell className="absolute -right-4 -top-4 opacity-5 rotate-45" size={80}/>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          </main>
        )} />
      </Routes>
      <footer className="py-20 text-center text-gray-500 text-[10px] font-black uppercase tracking-[0.8em] border-t dark:border-white/5 shadow-inner bg-white dark:bg-slate-950">TASKPRO ECOSYSTEM • INTERNSHIP FINAL PROJECT • 2026</footer>
    </div>
  );
};

const AuthPage = ({ handleAuth, themes, themeColor }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  return (
    <div className="min-h-[85vh] flex items-center justify-center p-6 bg-[url('https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=2000')] bg-cover relative">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"></div>
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="glass p-12 rounded-[3.5rem] w-full max-w-md shadow-2xl border dark:border-white/5 text-center relative z-10">
        <Zap size={40} className="mx-auto text-indigo-500 mb-4" fill="currentColor"/><h2 className="text-4xl font-black dark:text-white uppercase mb-8 tracking-tighter">TaskPro</h2>
        <form onSubmit={(e) => handleAuth(e, isRegister, form)} className="space-y-4 text-left">
          {isRegister && <input className="w-full p-4 bg-gray-100/10 dark:bg-slate-900 rounded-2xl outline-none dark:text-white border border-white/10" placeholder="Student Name" onChange={e => setForm({...form, name: e.target.value})} required />}
          <input className="w-full p-4 bg-gray-100/10 dark:bg-slate-900 rounded-2xl outline-none dark:text-white border border-white/10" placeholder="Email" type="email" onChange={e => setForm({...form, email: e.target.value})} required />
          <input className="w-full p-4 bg-gray-100/10 dark:bg-slate-900 rounded-2xl outline-none dark:text-white border border-white/10" placeholder="Password" type="password" onChange={e => setForm({...form, password: e.target.value})} required />
          <button className={`w-full ${themes[themeColor].split(' ')[1]} text-white p-4 rounded-2xl font-black shadow-xl mt-4`}>Sign {isRegister ? "Up" : "In"}</button>
        </form>
        <button onClick={() => setIsRegister(!isRegister)} className="mt-6 text-[10px] font-black uppercase text-gray-400 underline decoration-indigo-500/30 underline-offset-4 tracking-widest">{isRegister ? "Go to Login" : "Create Workspace"}</button>
      </motion.div>
    </div>
  );
};

const LandingPage = () => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-[85vh] flex flex-col items-center justify-center text-center px-6">
    <div className="bg-indigo-600/10 text-indigo-500 px-6 py-2 rounded-full text-xs font-black mb-8 uppercase tracking-[0.2em] border border-indigo-500/20 shadow-xl">Master Student Productivity</div>
    <h1 className="text-7xl md:text-[11rem] font-black mb-8 dark:text-white tracking-tighter leading-none italic uppercase">TASK<span className="text-indigo-600">PRO</span></h1>
    <p className="max-w-2xl text-gray-500 dark:text-gray-400 text-2xl md:text-3xl mb-12 font-medium italic">"The definitive high-performance student ecosystem."</p>
    <Link to="/login" className="bg-indigo-600 text-white px-14 py-7 rounded-[2.5rem] font-black text-2xl shadow-3xl hover:scale-110 transition-all border border-white/10">Get Access</Link>
  </motion.div>
);

export default function App() { return <Router><AppContent /></Router>; }