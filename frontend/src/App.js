import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Moon, Sun, Plus, Trash2, Bell, LogOut, Calendar, Zap, Search, Timer, 
  Trophy, Tag, Check, User, Palette, Star, X, Settings, Info, Mail, ExternalLink, Edit3, Quote, Rocket, Shield, Cpu
} from 'lucide-react';

// UPDATE THIS LINE at the top of App.js
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
  
  // Task Inputs
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

  const loadTasks = useCallback(async (token) => {
    try {
      const res = await axios.get(`${API}/tasks`, { headers: { 'x-auth-token': token } });
      setTasks(res.data);
    } catch (err) { console.error(err); }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Restore profile from LocalStorage temporarily
      const name = localStorage.getItem('userName');
      const theme = localStorage.getItem('themeColor') || 'indigo';
      const av = localStorage.getItem('userAvatar') || 'Felix';
      setUser({ name });
      setThemeColor(theme);
      setSelectedAvatar(av);
      loadTasks(token);
    }
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode, loadTasks]);

  // --- PERMANENT DB SAVE LOGIC ---
  const saveProfileToDB = async (updatedName, updatedTheme, updatedAvatar) => {
    const token = localStorage.getItem('token');
    try {
      await axios.put(`${API}/auth/update-profile`, 
        { name: updatedName, themeColor: updatedTheme, avatarSeed: updatedAvatar }, 
        { headers: { 'x-auth-token': token } }
      );
      localStorage.setItem('userName', updatedName);
      localStorage.setItem('themeColor', updatedTheme);
      localStorage.setItem('userAvatar', updatedAvatar);
    } catch (err) { console.log("Cloud sync failed"); }
  };

  const handleAuth = async (e, isRegister, authForm) => {
    e.preventDefault();
    try {
      const url = isRegister ? `${API}/auth/register` : `${API}/auth/login`;
      const res = await axios.post(url, authForm);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('userName', res.data.user.name);
      localStorage.setItem('themeColor', res.data.user.themeColor);
      localStorage.setItem('userAvatar', res.data.user.avatarSeed);
      
      setUser(res.data.user);
      setThemeColor(res.data.user.themeColor);
      setSelectedAvatar(res.data.user.avatarSeed);
      navigate('/');
    } catch (err) { alert("Auth Failed"); }
  };

  const welcomeData = {
    greet: new Date().getHours() < 12 ? "Good Morning" : new Date().getHours() < 17 ? "Good Afternoon" : "Good Evening",
    quote: "Small progress is still progress."
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-all duration-500 font-sans">
      <nav className="glass sticky top-0 z-50 px-8 py-4 flex justify-between items-center border-b dark:border-white/5 shadow-xl">
        <div className="flex items-center gap-10">
          <Link to="/" className={`flex items-center gap-2 font-black text-3xl tracking-tighter ${themes[themeColor].split(' ')[0]}`}>
            <Zap fill="currentColor" size={28}/> TaskPro
          </Link>
          <div className="hidden md:flex gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
             <Link to="/" className="hover:text-indigo-500 transition flex items-center gap-2"><Zap size={14}/> Dashboard</Link>
             <Link to="/about" className="hover:text-indigo-500 transition flex items-center gap-2"><Info size={14}/> About Project</Link>
             <Link to="/contact" className="hover:text-indigo-500 transition flex items-center gap-2"><Mail size={14}/> Support</Link>
          </div>
        </div>
        <div className="flex items-center gap-5">
          <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-xl bg-gray-100 dark:bg-slate-900 transition-all hover:rotate-12">
            {darkMode ? <Sun size={20} className="text-yellow-400"/> : <Moon size={20}/>}
          </button>
          {user && (
             <button onClick={() => setShowProfile(!showProfile)} className={`flex items-center gap-2 p-1 pr-4 bg-gray-100 dark:bg-slate-900 rounded-full ring-2 ${themes[themeColor].split(' ')[4]} transition-all`}>
                <img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${selectedAvatar}`} className="w-9 h-9 rounded-full bg-slate-800" alt="me" />
                <span className="text-xs font-black uppercase tracking-widest hidden sm:block">{user.name.split(' ')[0]}</span>
             </button>
          )}
        </div>
      </nav>

      {/* --- PROFILE CUSTOMIZATION (MODAL) --- */}
      <AnimatePresence>
        {showProfile && user && (
          <motion.div initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 100 }} className="fixed right-6 top-24 w-80 glass p-8 rounded-[3rem] z-[100] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] border dark:border-white/10">
            <div className="flex justify-between mb-8">
               <h4 className="font-black text-xs uppercase tracking-widest text-gray-400">Settings</h4>
               <X className="cursor-pointer text-red-500" onClick={() => setShowProfile(false)} />
            </div>

            <div className="mb-6 bg-slate-100 dark:bg-slate-800 p-5 rounded-3xl">
               {isEditingName ? (
                 <div className="flex gap-2">
                   <input className="bg-transparent border-b border-indigo-500 outline-none w-full dark:text-white font-bold" value={newName} onChange={e => setNewName(e.target.value)} />
                   <Check className="text-green-500 cursor-pointer" onClick={() => { setUser({...user, name: newName}); setIsEditingName(false); saveProfileToDB(newName, themeColor, selectedAvatar); }} />
                 </div>
               ) : (
                 <div className="flex justify-between items-center">
                    <span className="text-sm font-bold dark:text-white">{user.name}</span>
                    <Edit3 size={16} className="text-indigo-500 cursor-pointer" onClick={() => {setNewName(user.name); setIsEditingName(true)}} />
                 </div>
               )}
            </div>

            <h4 className="text-[10px] font-black uppercase text-gray-500 mb-4 tracking-widest flex items-center gap-2"><Palette size={14}/> Accent Color</h4>
            <div className="flex gap-3 mb-8">
               {Object.keys(themes).map(c => (
                 <button key={c} onClick={() => {setThemeColor(c); saveProfileToDB(user.name, c, selectedAvatar);}} className={`w-8 h-8 rounded-full ${themes[c].split(' ')[1]} ${themeColor === c ? 'ring-4 ring-white' : ''}`} />
               ))}
            </div>

            <h4 className="text-[10px] font-black uppercase text-gray-500 mb-4 tracking-widest flex items-center gap-2"><Star size={14}/> Avatar Style</h4>
            <div className="grid grid-cols-4 gap-2 mb-8">
               {avatars.map(a => (
                 <button key={a} onClick={() => {setSelectedAvatar(a); saveProfileToDB(user.name, themeColor, a);}} className={`p-1 bg-slate-700 rounded-xl ${selectedAvatar === a ? 'ring-2 ring-white' : ''}`}><img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${a}`} alt="a"/></button>
               ))}
            </div>

            <button onClick={() => {localStorage.clear(); window.location.href="/";}} className="w-full p-4 rounded-2xl bg-red-500 text-white font-black flex items-center justify-center gap-2 shadow-xl shadow-red-500/20">
               <LogOut size={18}/> Logout
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <Routes>
        {/* --- ABOUT PAGE (EXPANDED) --- */}
        <Route path="/about" element={
          <div className="max-w-6xl mx-auto py-20 px-6">
            <div className="text-center mb-20">
               <h2 className="text-7xl font-black dark:text-white tracking-tighter">The <span className="text-indigo-500 italic">TaskPro</span> Vision</h2>
               <p className="text-gray-500 text-xl mt-4 max-w-2xl mx-auto">Bridging the gap between internship deadlines and academic excellence.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
               <div className="glass p-10 rounded-[3rem] border-t-8 border-indigo-500">
                  <Cpu className="text-indigo-500 mb-4" size={40}/>
                  <h4 className="text-xl font-bold dark:text-white mb-2">Automated Ecosystem</h4>
                  <p className="text-sm text-gray-400">Powered by Nodemailer and Node-Cron for instant email task dispatches.</p>
               </div>
               <div className="glass p-10 rounded-[3rem] border-t-8 border-emerald-500">
                  <Shield className="text-emerald-500 mb-4" size={40}/>
                  <h4 className="text-xl font-bold dark:text-white mb-2">High Security</h4>
                  <p className="text-sm text-gray-400">State-of-the-art JWT authentication and Bcrypt hashing for student data.</p>
               </div>
               <div className="glass p-10 rounded-[3rem] border-t-8 border-rose-500">
                  <Rocket className="text-rose-500 mb-4" size={40}/>
                  <h4 className="text-xl font-bold dark:text-white mb-2">Native Speed</h4>
                  <p className="text-sm text-gray-400">Direct MongoDB driver implementation for sub-100ms database response.</p>
               </div>
            </div>
          </div>
        }/>

        <Route path="/contact" element={
          <div className="max-w-xl mx-auto py-20 px-6 text-center">
            <Mail size={60} className="mx-auto text-indigo-500 mb-8" />
            <h2 className="text-5xl font-black dark:text-white mb-4">Support Center</h2>
            <p className="text-gray-500 mb-10">Email: myselfadmin123@gmail.com</p>
            <form className="glass p-8 rounded-[3rem] space-y-4 shadow-2xl" onSubmit={(e)=>{e.preventDefault(); alert("Deployed!");}}>
               <input className="w-full p-4 glass rounded-2xl outline-none dark:text-white" placeholder="Context Title" required />
               <textarea className="w-full p-4 glass rounded-2xl outline-none dark:text-white h-32" placeholder="Describe the issue..." required />
               <button className="w-full bg-indigo-600 text-white p-4 rounded-2xl font-black">Submit to Admin</button>
            </form>
          </div>
        } />

        <Route path="/login" element={
          <div className="min-h-[85vh] flex items-center justify-center p-6 bg-[url('https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=2000')] bg-cover">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"></div>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="glass p-12 rounded-[3.5rem] w-full max-w-md shadow-2xl border dark:border-white/5 relative z-10 text-center">
              <h2 className="text-5xl font-black mb-8 dark:text-white tracking-tighter">TASK<span className="text-indigo-500">PRO</span></h2>
              <form onSubmit={(e) => handleAuth(e, isRegister, authForm)} className="space-y-4 text-left">
                {isRegister && <input className="w-full p-4 bg-gray-100/10 dark:bg-slate-900 rounded-2xl outline-none dark:text-white border border-white/10" placeholder="Full Name" onChange={e => setAuthForm({...authForm, name: e.target.value})} required />}
                <input className="w-full p-4 bg-gray-100/10 dark:bg-slate-900 rounded-2xl outline-none dark:text-white border border-white/10" placeholder="Email" onChange={e => setAuthForm({...authForm, email: e.target.value})} required />
                <input className="w-full p-4 bg-gray-100/10 dark:bg-slate-900 rounded-2xl outline-none dark:text-white border border-white/10" type="password" placeholder="Password" onChange={e => setAuthForm({...authForm, password: e.target.value})} required />
                <button className={`w-full ${themes[themeColor].split(' ')[1]} text-white p-4 rounded-2xl font-black shadow-xl mt-4`}>Connect</button>
              </form>
              <button onClick={() => setIsRegister(!isRegister)} className="mt-6 text-[10px] font-black uppercase text-gray-400 hover:text-indigo-500 transition-all underline">Toggle Register/Login</button>
            </motion.div>
          </div>
        } />

        <Route path="/" element={!user ? (
          <div className="min-h-[85vh] flex flex-col items-center justify-center text-center px-6">
            <h1 className="text-9xl font-black mb-6 dark:text-white tracking-tighter">TASK<span className="text-indigo-600 italic">PRO</span></h1>
            <p className="max-w-2xl text-gray-500 text-2xl mb-12">Next-Generation Internship Workflow.</p>
            <Link to="/login" className="bg-indigo-600 text-white px-12 py-6 rounded-[2.5rem] font-black text-xl shadow-2xl hover:scale-110 transition-all">Get Workspace Access</Link>
          </div>
        ) : (
          <main className="max-w-7xl mx-auto p-6 md:p-12 grid lg:grid-cols-12 gap-12">
            {/* Dashboard Sidebar */}
            <div className="lg:col-span-4 space-y-8">
               <div className={`p-10 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden ${themes[themeColor].split(' ')[1]}`}>
                  <h2 className="text-4xl font-black italic mb-2">{welcomeData.greet}!</h2>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-8 flex items-center gap-2"><Quote size={12}/> {welcomeData.quote}</p>
                  <div className="w-full bg-white/20 h-3 rounded-full overflow-hidden mb-6"><motion.div animate={{ width: `${progress}%` }} className="bg-white h-full shadow-[0_0_20px_white]" /></div>
                  <div className="flex justify-between items-center text-[10px] font-black uppercase">
                     <span className="flex items-center gap-2"><Trophy size={14}/> {Math.round(progress)}% Goal Score</span>
                     <span className="flex items-center gap-2"><Bell size={14}/> Real-time Sync</span>
                  </div>
                  <Zap size={100} className="absolute -right-4 -bottom-4 opacity-10 rotate-12" />
               </div>

               <form onSubmit={addTask} className="glass p-8 rounded-[3.5rem] space-y-4 shadow-xl border dark:border-white/5">
                  <h3 className="font-black text-xs uppercase tracking-widest text-indigo-500 flex items-center gap-2"><Plus size={16}/> New Task</h3>
                  <input className="w-full p-4 bg-gray-50 dark:bg-slate-900 rounded-2xl outline-none dark:text-white border border-transparent focus:border-indigo-500" placeholder="Project Title" value={taskTitle} onChange={e => setTaskTitle(e.target.value)} required />
                  <textarea className="w-full p-4 bg-gray-50 dark:bg-slate-900 rounded-2xl outline-none dark:text-white h-24" placeholder="Description..." value={taskDesc} onChange={e => setTaskDesc(e.target.value)} />
                  <input type="date" className="w-full p-4 bg-gray-100 dark:bg-slate-900 rounded-2xl outline-none dark:text-white" value={taskDate} onChange={e => setTaskDate(e.target.value)} required />
                  <div className="flex gap-2">
                     {['Low', 'Medium', 'High'].map(p => (
                       <button key={p} type="button" onClick={() => setPriority(p)} className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${priority === p ? themes[themeColor].split(' ')[1] + ' text-white' : 'bg-gray-100 dark:bg-slate-800 text-gray-500'}`}>{p}</button>
                     ))}
                  </div>
                  <button className={`w-full ${themes[themeColor].split(' ')[1]} text-white p-5 rounded-[2rem] font-black text-lg shadow-xl`}>Add to TaskPro</button>
               </form>
            </div>

            {/* Task Area */}
            <div className="lg:col-span-8 space-y-8">
               <div className="flex flex-col md:flex-row gap-6 justify-between items-center bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] shadow-xl border dark:border-white/5">
                  <div className="relative w-full md:w-96">
                    <Search className="absolute left-5 top-4 text-gray-500" size={20} />
                    <input placeholder="Search projects..." className="w-full pl-14 p-4 glass rounded-[2rem] outline-none dark:text-white" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                  </div>
                  <div className="flex bg-gray-100 dark:bg-slate-900 px-6 py-3 rounded-full border dark:border-white/5 gap-4 items-center shadow-inner">
                     <Timer size={20} className={isTimerRunning ? "animate-pulse text-indigo-500" : "text-gray-500"}/>
                     <span className="font-mono font-black text-lg dark:text-white">{Math.floor(timeLeft/60)}:{timeLeft%60 < 10 ? '0' : ''}{timeLeft%60}</span>
                     <button onClick={() => setIsTimerRunning(!isTimerRunning)} className="text-[10px] font-black uppercase text-indigo-500 underline">{isTimerRunning ? "Pause" : "Focus"}</button>
                  </div>
               </div>

               <div className="flex bg-gray-200 dark:bg-slate-900 p-1.5 rounded-2xl w-max shadow-inner border dark:border-white/5">
                  {['All', 'Pending', 'Completed'].map(f => (
                    <button key={f} onClick={() => setFilter(f)} className={`px-8 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${filter === f ? 'bg-white dark:bg-slate-800 shadow-2xl ' + themes[themeColor].split(' ')[0] : 'text-gray-400'}`}>{f}</button>
                  ))}
               </div>

               <div className="space-y-4 pb-20">
                  <AnimatePresence mode='popLayout'>
                    {filteredTasks.map(task => (
                      <motion.div key={task._id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                        className={`glass p-8 rounded-[3.5rem] flex flex-col md:flex-row md:items-center justify-between gap-6 border-l-[16px] ${task.priority === 'High' ? 'border-rose-500' : task.priority === 'Medium' ? 'border-amber-500' : 'border-emerald-500'} ${task.status === 'Completed' ? 'opacity-40 grayscale blur-[1px]' : ''} hover:shadow-2xl transition-all relative overflow-hidden`}
                      >
                        <div className="flex items-start gap-8">
                           <button onClick={async () => { const s = task.status === 'Pending' ? 'Completed' : 'Pending'; await axios.put(`${API}/tasks/${task._id}`, { status: s }, { headers: {'x-auth-token': localStorage.getItem('token')} }); loadTasks(localStorage.getItem('token')); }} 
                              className={`p-6 rounded-[2rem] shadow-inner ${task.status === 'Completed' ? themes[themeColor].split(' ')[1] + ' text-white' : 'bg-gray-100 dark:bg-slate-900 text-transparent hover:text-gray-400'}`}
                           ><Check size={32} strokeWidth={4}/></button>
                           <div className="flex flex-col">
                              <h4 className="text-2xl font-black dark:text-white uppercase tracking-tighter italic">{task.title}</h4>
                              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-1 mb-4 leading-relaxed">{task.description}</p>
                              <div className="flex flex-wrap gap-4 items-center">
                                 <span className="text-[10px] font-black px-4 py-1.5 rounded-full bg-slate-100 dark:bg-slate-900 text-gray-400 border dark:border-white/5 uppercase tracking-widest flex items-center gap-2"><Tag size={12}/> {new Date(task.dueDate).toLocaleDateString()}</span>
                                 <a href={`https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(task.title)}&dates=${task.dueDate.replace(/-/g, '')}/${task.dueDate.replace(/-/g, '')}`} target="_blank" rel="noreferrer" className={`text-[10px] font-black uppercase flex items-center gap-1 hover:underline ${themes[themeColor].split(' ')[0]}`}><ExternalLink size={12}/> Sync Calendar</a>
                              </div>
                           </div>
                        </div>
                        <button onClick={async () => { await axios.delete(`${API}/tasks/${task._id}`, { headers: {'x-auth-token': localStorage.getItem('token')} }); loadTasks(localStorage.getItem('token')); }} className="p-4 rounded-2xl text-red-500 bg-red-500/10 hover:bg-red-500 hover:text-white transition-all self-center shadow-xl"><Trash2 size={24}/></button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
               </div>
            </div>
          </main>
        )} />
      </Routes>

      <footer className="py-20 text-center text-gray-500 text-[10px] font-black uppercase tracking-[0.8em] border-t dark:border-white/5">
         TASKPRO ECOSYSTEM • INTERNSHIP PROJECT • 45-DAY INTENSIVE FINAL BUILD
      </footer>
    </div>
  );
};

export default function App() { return <Router><AppContent /></Router>; }