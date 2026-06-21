import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Moon, Sun, Plus, Trash2, Bell, LogOut, Calendar, Zap, Search, Timer, 
  Trophy, Tag, Check, User, Palette, Star, X, Settings, Info, Mail, ExternalLink, Edit3, Quote, ChevronRight, MessageSquare, Users, Minimize2, Maximize2
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
  const [expandedTasks, setExpandedTasks] = useState({}); // For Minimize/Expand
  const [searchQuery, setSearchQuery] = useState("");

  // Task Input States
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskDate, setTaskDate] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [commentText, setCommentText] = useState({});

  const themes = {
    indigo: "text-indigo-500 bg-indigo-600 ring-indigo-500 shadow-indigo-500/20",
    emerald: "text-emerald-500 bg-emerald-600 ring-emerald-500 shadow-emerald-500/20",
    rose: "text-rose-500 bg-rose-600 ring-rose-500 shadow-rose-500/20",
    amber: "text-amber-500 bg-amber-600 border-amber-500 ring-amber-500 shadow-amber-500/20"
  };

  const loadTasks = useCallback(async (token) => {
    try {
      const res = await axios.get(`${API}/tasks`, { headers: { 'x-auth-token': token } });
      setTasks(res.data);
    } catch (err) { console.error("Session invalid"); }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) { loadTasks(token); }
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode, loadTasks]);

  const addTask = async (e) => {
    e.preventDefault();
    if (!taskTitle || !taskDate) return;
    const token = localStorage.getItem('token');
    const res = await axios.post(`${API}/tasks`, { 
        title: taskTitle, description: taskDesc, dueDate: taskDate, priority, assignedTo 
    }, { headers: { 'x-auth-token': token } });
    
    setTasks(prev => [res.data, ...prev]); // Immediate UI update
    setTaskTitle(''); setTaskDesc(''); setAssignedTo('');
    alert("Task Saved! Collaboration email dispatched.");
  };

  const updateStatus = async (id, newStatus) => {
    const token = localStorage.getItem('token');
    await axios.put(`${API}/tasks/${id}`, { status: newStatus }, { headers: {'x-auth-token': token} });
    loadTasks(token);
  };

  const toggleExpand = (id) => {
    setExpandedTasks(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const stages = ['To-Do', 'In Progress', 'Review', 'Completed'];
  const progress = tasks.length > 0 ? (tasks.filter(t => t.status === 'Completed').length / tasks.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 transition-all duration-500 font-sans">
      <nav className="glass sticky top-0 z-50 px-6 py-4 flex justify-between items-center border-b dark:border-white/5 shadow-xl">
        <Link to="/" className={`flex items-center gap-2 font-black text-3xl tracking-tighter ${themes[themeColor].split(' ')[0]}`}><Zap fill="currentColor"/> TaskPro</Link>
        <div className="flex items-center gap-4">
           <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-xl bg-white dark:bg-slate-900 shadow-md">
            {darkMode ? <Sun size={20} className="text-yellow-400"/> : <Moon size={20}/>}
          </button>
          {user && (
             <button onClick={() => setShowProfile(!showProfile)} className={`flex items-center gap-3 p-1 pr-4 bg-white dark:bg-slate-900 rounded-full ring-2 ${themes[themeColor].split(' ')[4]} shadow-xl`}>
                <img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${selectedAvatar}`} className="w-9 h-9 rounded-full bg-slate-800" alt="me" />
                <span className="text-[10px] font-black uppercase dark:text-white hidden md:block">{user.name.split(' ')[0]}</span>
             </button>
          )}
        </div>
      </nav>

      <Routes>
        <Route path="/" element={!user ? <LandingPage /> : (
          <div className="max-w-[1800px] mx-auto p-4 md:p-8">
            {/* TOP SUMMARY BAR (Utilizing space) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
               <div className={`p-6 rounded-[2rem] text-white shadow-2xl flex justify-between items-center ${themes[themeColor].split(' ')[1]}`}>
                  <div><h4 className="text-xs font-black uppercase opacity-70">Workspace Flow</h4><p className="text-2xl font-black">{Math.round(progress)}% Complete</p></div>
                  <Trophy size={40} className="opacity-20"/>
               </div>
               <div className="glass p-6 rounded-[2rem] flex items-center gap-4 dark:text-white">
                  <div className="p-3 bg-indigo-500/10 rounded-2xl"><Search className="text-indigo-500"/></div>
                  <input className="bg-transparent outline-none w-full font-bold" placeholder="Search Node..." onChange={e => setSearchQuery(e.target.value)} />
               </div>
               {/* Quick Add Toggle/Modal would go here, using remaining 2 columns for Greeting */}
               <div className="md:col-span-2 glass p-6 rounded-[2rem] flex items-center justify-between dark:text-white">
                  <div><h2 className="text-xl font-black italic">"{welcomeData.quote}"</h2><p className="text-[10px] uppercase font-bold text-gray-400 mt-1">Daily Inspiration</p></div>
                  <button onClick={() => navigate('/about')} className="p-3 bg-slate-500/10 rounded-full"><Plus/></button>
               </div>
            </div>

            {/* BOARD LAYOUT */}
            <div className="flex gap-6 overflow-x-auto pb-10 no-scrollbar" style={{ minHeight: '70vh' }}>
              {/* STAGE 0: INPUT FORM (Left Sidebar replacement) */}
              <div className="min-w-[350px] space-y-6">
                 <form onSubmit={addTask} className="glass p-8 rounded-[3rem] space-y-4 border dark:border-white/5 shadow-2xl">
                    <h3 className="font-black text-xs uppercase text-indigo-500 flex items-center gap-2 mb-2"><Plus size={16}/> New Deployment</h3>
                    <input className="w-full p-4 bg-gray-50 dark:bg-slate-900 rounded-2xl outline-none dark:text-white border border-transparent focus:border-indigo-500 transition-all" placeholder="Objective Name" value={taskTitle} onChange={e => setTaskTitle(e.target.value)} required />
                    <textarea className="w-full p-4 bg-gray-50 dark:bg-slate-900 rounded-2xl outline-none dark:text-white h-24 border border-transparent focus:border-indigo-500 transition-all" placeholder="Collaboration context..." value={taskDesc} onChange={e => setTaskDesc(e.target.value)} />
                    <input className="w-full p-4 bg-gray-50 dark:bg-slate-900 rounded-2xl outline-none dark:text-white border border-transparent focus:border-indigo-500 transition-all" placeholder="Delegate to (Email)" value={assignedTo} onChange={e => setAssignedTo(e.target.value)} />
                    <div className="relative flex items-center"><Calendar className="absolute left-4 top-4 text-gray-500" size={16}/><input type="date" className="w-full p-4 pl-12 bg-gray-100 dark:bg-slate-900 rounded-2xl outline-none dark:text-white" value={taskDate} onChange={e => setTaskDate(e.target.value)} required /></div>
                    <button className={`w-full ${themes[themeColor].split(' ')[1]} text-white p-5 rounded-[2rem] font-black text-lg shadow-xl`}>Deploy Node</button>
                 </form>
              </div>

              {/* KANBAN COLUMNS */}
              {stages.map(stage => (
                <div key={stage} className="min-w-[350px] flex-1">
                  <div className="flex justify-between items-center mb-4 px-4">
                     <h3 className="font-black text-xs uppercase tracking-[0.2em] text-gray-500">{stage}</h3>
                     <span className="bg-slate-200 dark:bg-slate-800 text-[10px] font-black px-2 py-1 rounded-full dark:text-gray-400">
                        {tasks.filter(t => t.status === stage).length}
                     </span>
                  </div>
                  
                  <div className="space-y-4">
                    <AnimatePresence>
                      {tasks.filter(t => t.status === stage && t.title.toLowerCase().includes(searchQuery.toLowerCase())).map(task => {
                        const isExpanded = expandedTasks[task._id];
                        const pColor = task.priority === 'High' ? 'border-rose-500' : task.priority === 'Medium' ? 'border-amber-500' : 'border-emerald-500';
                        return (
                          <motion.div key={task._id} layout className={`glass p-6 rounded-[2.5rem] border-l-[12px] ${pColor} shadow-xl relative overflow-hidden group`}>
                            <div className="flex justify-between items-start mb-2">
                               <h4 className="text-lg font-black dark:text-white uppercase tracking-tighter italic">{task.title}</h4>
                               <button onClick={() => toggleExpand(task._id)} className="p-1 hover:bg-slate-500/10 rounded-full dark:text-gray-500">
                                  {isExpanded ? <Minimize2 size={16}/> : <Maximize2 size={16}/>}
                               </button>
                            </div>

                            <div className="flex items-center gap-2 mb-4">
                               <span className="text-[9px] font-black px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-gray-500 uppercase tracking-widest flex items-center gap-1"><Users size={10}/> {task.assignedTo || "Self"}</span>
                            </div>

                            {isExpanded && (
                               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 border-t dark:border-white/5 pt-4">
                                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-4">{task.description}</p>
                                  
                                  {/* MINI COLLABORATION HUB */}
                                  <div className="space-y-2 mb-4">
                                     {task.comments?.map((c, i) => (
                                        <div key={i} className="text-[10px] bg-slate-50 dark:bg-slate-900 p-2 rounded-xl">
                                           <span className="font-black text-indigo-500">{c.userName}:</span> {c.text}
                                        </div>
                                     ))}
                                  </div>
                                  <div className="flex gap-2">
                                     <input className="w-full bg-slate-50 dark:bg-slate-900 rounded-lg p-2 text-[10px] outline-none dark:text-white" placeholder="Reply..." 
                                       onChange={e => setCommentText({...commentText, [task._id]: e.target.value})} 
                                       onKeyDown={async (e) => {
                                          if(e.key === 'Enter') {
                                             await axios.post(`${API}/tasks/${task._id}/comments`, { text: e.target.value }, { headers: {'x-auth-token': localStorage.getItem('token')} });
                                             loadTasks(localStorage.getItem('token'));
                                          }
                                       }}
                                     />
                                  </div>
                               </motion.div>
                            )}

                            <div className="mt-4 flex justify-between items-center">
                               <div className="flex gap-2">
                                  {stage !== 'Completed' && (
                                     <button onClick={() => updateStatus(task._id, stages[stages.indexOf(stage)+1])} className="p-2 bg-indigo-500 text-white rounded-xl shadow-lg hover:scale-110 transition-all"><ChevronRight size={14}/></button>
                                  )}
                                  <button onClick={async () => { await axios.delete(`${API}/tasks/${task._id}`, { headers: {'x-auth-token': localStorage.getItem('token')} }); loadTasks(localStorage.getItem('token')); }} className="p-2 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={14}/></button>
                               </div>
                               <span className="text-[9px] font-black text-gray-400 flex items-center gap-1"><Calendar size={10}/> {new Date(task.dueDate).toLocaleDateString()}</span>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )} />
        {/* LOGIN, ABOUT, CONTACT Routes remain exactly the same as previous build */}
      </Routes>
    </div>
  );
};

export default function App() { return <Router><AppContent /></Router>; }