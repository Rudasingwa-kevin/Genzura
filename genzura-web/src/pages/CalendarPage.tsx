import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, CheckSquare, Plus, Clock, MoreVertical, Filter, AlertCircle, X, ExternalLink, MapPin } from 'lucide-react';
import AppLayout from '../components/AppLayout';
import { EVENTS, TASKS, type CalendarEvent, type Task, type EventType } from '../data/calendar';

// ─── Modals ───────────────────────────────────────────────────────────────────

function Modal({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-brand-dark/20 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl border border-border-base p-8 animate-in zoom-in-95 fade-in duration-300">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold text-brand-dark">{title}</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-page-bg text-text-muted transition-colors">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function NewEventModal({ onClose, onAdd }: { onClose: () => void; onAdd: (e: CalendarEvent) => void }) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [type, setType] = useState<EventType>('Meeting');

  return (
    <Modal onClose={onClose} title="Create New Event">
      <div className="space-y-5">
        <div>
          <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">Event Title</label>
          <input 
            type="text" value={title} onChange={e => setTitle(e.target.value)}
            className="w-full h-12 px-4 rounded-xl bg-page-bg border border-transparent focus:bg-white focus:border-brand-blue outline-none transition-all font-medium"
            placeholder="e.g., Settlement Discussion"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">Date</label>
            <input 
              type="date" value={date} onChange={e => setDate(e.target.value)}
              className="w-full h-12 px-4 rounded-xl bg-page-bg border border-transparent focus:bg-white focus:border-brand-blue outline-none transition-all font-medium"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">Time</label>
            <input 
              type="text" value={time} onChange={e => setTime(e.target.value)}
              className="w-full h-12 px-4 rounded-xl bg-page-bg border border-transparent focus:bg-white focus:border-brand-blue outline-none transition-all font-medium"
              placeholder="02:00 PM"
            />
          </div>
        </div>
        <div>
          <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">Type</label>
          <select 
            value={type} onChange={e => setType(e.target.value as any)}
            className="w-full h-12 px-4 rounded-xl bg-page-bg border border-transparent focus:bg-white focus:border-brand-blue outline-none transition-all font-bold text-sm"
          >
            <option value="Meeting">Meeting</option>
            <option value="Court Date">Court Date</option>
            <option value="Deadline">Deadline</option>
            <option value="Filing">Filing</option>
          </select>
        </div>
        <button 
          onClick={() => {
            if (!title || !date) return;
            onAdd({ id: Math.random().toString(), title, date, time, type, color: 'bg-brand-blue' });
            onClose();
          }}
          className="w-full h-14 bg-brand-blue text-white rounded-2xl font-bold shadow-lg shadow-brand-blue/25 hover:shadow-xl hover:-translate-y-0.5 transition-all mt-4"
        >
          Schedule Event
        </button>
      </div>
    </Modal>
  );
}

function NewTaskModal({ onClose, onAdd }: { onClose: () => void; onAdd: (t: Task) => void }) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Task['priority']>('Medium');

  return (
    <Modal onClose={onClose} title="Create New Task">
      <div className="space-y-5">
        <div>
          <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">Task Title</label>
          <input 
            type="text" value={title} onChange={e => setTitle(e.target.value)}
            className="w-full h-12 px-4 rounded-xl bg-page-bg border border-transparent focus:bg-white focus:border-brand-blue outline-none transition-all font-medium"
            placeholder="e.g., Review settlement brief"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">Priority</label>
          <div className="flex gap-2">
            {(['High', 'Medium', 'Low'] as const).map(p => (
              <button
                key={p}
                onClick={() => setPriority(p)}
                className={`flex-1 h-12 rounded-xl border font-bold text-xs transition-all ${
                  priority === p ? 'bg-brand-blue border-brand-blue text-white shadow-md' : 'bg-page-bg border-transparent text-text-muted hover:border-border-base'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
        <button 
          onClick={() => {
            if (!title) return;
            onAdd({ id: Math.random().toString(), title, priority, dueDate: 'Today', completed: false, assignee: 'James W.' });
            onClose();
          }}
          className="w-full h-14 bg-brand-blue text-white rounded-2xl font-bold shadow-lg shadow-brand-blue/25 hover:shadow-xl hover:-translate-y-0.5 transition-all mt-4"
        >
          Create Task
        </button>
      </div>
    </Modal>
  );
}

function EventDetailModal({ event, onClose }: { event: CalendarEvent; onClose: () => void }) {
  const navigate = useNavigate();
  
  return (
    <Modal onClose={onClose} title="Event Details">
      <div className="space-y-6">
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-2xl ${event.color} text-white flex items-center justify-center shrink-0 shadow-lg`}>
            <CalendarIcon size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-brand-dark leading-tight">{event.title}</h3>
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-page-bg text-text-muted mt-1.5 uppercase tracking-wider">
              {event.type}
            </span>
          </div>
        </div>

        <div className="space-y-3 bg-page-bg/50 p-5 rounded-2xl border border-border-base">
          <div className="flex items-center gap-3 text-sm text-brand-dark font-semibold">
            <Clock size={16} className="text-brand-blue" />
            {new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} at {event.time}
          </div>
          {event.description && (
            <div className="flex items-start gap-3 text-sm text-text-secondary">
              <MapPin size={16} className="text-brand-blue shrink-0 mt-0.5" />
              {event.description}
            </div>
          )}
        </div>

        {event.caseId && (
          <div className="p-4 rounded-2xl bg-brand-light border border-brand-blue/10 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-brand-blue uppercase tracking-wider mb-0.5">Associated Case</p>
              <p className="text-sm font-bold text-brand-dark">{event.caseId}</p>
            </div>
            <button 
              onClick={() => navigate(`/cases/${event.caseId}`)}
              className="flex items-center gap-2 bg-brand-blue text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all active:scale-95"
            >
              View Case <ExternalLink size={14} />
            </button>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="flex-1 h-12 rounded-xl border border-border-base font-bold text-brand-dark hover:bg-page-bg transition-all">
            Close
          </button>
          <button className="flex-1 h-12 rounded-xl bg-brand-dark text-white font-bold shadow-lg shadow-brand-dark/20 hover:shadow-xl hover:-translate-y-0.5 transition-all">
            Edit Event
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState(TASKS);
  const [events, setEvents] = useState(EVENTS);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [taskFilter, setTaskFilter] = useState<'All' | 'Overdue' | 'My Tasks'>('All');

  const filteredTasks = tasks.filter(t => {
    if (taskFilter === 'My Tasks') return t.assignee.includes('James');
    if (taskFilter === 'Overdue') return !t.completed && t.dueDate === 'Today';
    return true;
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  
  const days = [];
  // Padding
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    const dayEvents = events.filter(e => e.date === dateStr);
    days.push({ day: i, dateStr, events: dayEvents });
  }

  const toggleTask = (taskId: string) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t));
  };

  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const goToToday = () => setCurrentDate(new Date());

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const todayStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;
  const upcomingEvents = events.filter(e => e.date >= todayStr).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 3);

  return (
    <AppLayout 
      title="Calendar & Tasks"
      action={
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowTaskModal(true)}
            className="flex items-center gap-2 bg-white text-brand-dark px-4 py-2.5 rounded-xl font-bold border border-border-base shadow-sm hover:shadow-md transition-all active:scale-95"
          >
            <CheckSquare size={18} /> New Task
          </button>
          <button 
            onClick={() => setShowEventModal(true)}
            className="flex items-center gap-2 bg-brand-blue text-white px-4 py-2.5 rounded-xl font-bold shadow-lg shadow-brand-blue/30 hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95"
          >
            <Plus size={18} /> New Event
          </button>
        </div>
      }
    >
      {showEventModal && (
        <NewEventModal 
          onClose={() => setShowEventModal(false)} 
          onAdd={(e) => setEvents([...events, e])}
        />
      )}
      {showTaskModal && (
        <NewTaskModal 
          onClose={() => setShowTaskModal(false)} 
          onAdd={(t) => setTasks([t, ...tasks])}
        />
      )}
      {selectedEvent && (
        <EventDetailModal 
          event={selectedEvent} 
          onClose={() => setSelectedEvent(null)} 
        />
      )}
      <div className="flex flex-col xl:flex-row gap-6 items-start">
        
        {/* Main Calendar View */}
        <div className="flex-1 bg-white rounded-[2rem] border border-border-base p-8 shadow-sm min-w-0 w-full overflow-hidden">
          
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold text-brand-dark">
                {monthNames[month]} {year}
              </h2>
              <button 
                onClick={goToToday}
                className="px-3 py-1.5 rounded-lg border border-border-base text-sm font-bold text-text-secondary hover:text-brand-blue hover:bg-brand-light transition-colors"
              >
                Today
              </button>
            </div>
            
            <div className="flex items-center gap-2">
              <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-page-bg border border-transparent hover:border-border-base transition-all">
                <ChevronLeft size={20} className="text-text-muted hover:text-brand-dark" />
              </button>
              <button onClick={nextMonth} className="p-2 rounded-xl hover:bg-page-bg border border-transparent hover:border-border-base transition-all">
                <ChevronRight size={20} className="text-text-muted hover:text-brand-dark" />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-px bg-border-base rounded-xl overflow-hidden border border-border-base animate-in-fade">
            {dayNames.map(day => (
              <div key={day} className="bg-page-bg/80 py-3 text-center text-xs font-bold text-text-muted uppercase tracking-wider">
                {day}
              </div>
            ))}
            
            {days.map((dayObj, index) => (
              <div 
                key={index} 
                className={`min-h-[140px] bg-white p-3 border-t border-transparent hover:border-brand-blue/30 transition-colors relative group ${!dayObj ? 'bg-page-bg/30' : ''}`}
              >
                {dayObj && (
                  <>
                    <span className={`text-sm font-bold mb-2 inline-block ${
                      dayObj.dateStr === todayStr 
                        ? 'bg-brand-blue text-white w-7 h-7 rounded-full flex items-center justify-center -ml-1.5 -mt-1.5' 
                        : 'text-text-secondary'
                    }`}>
                      {dayObj.day}
                    </span>
                    
                    <div className="space-y-1.5 mt-1 overflow-y-auto max-h-[100px] no-scrollbar">
                      {dayObj.events.map(evt => (
                        <div 
                          key={evt.id} 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEvent(evt);
                          }}
                          className={`px-2 py-1.5 rounded-lg text-xs font-semibold cursor-pointer truncate transition-all hover:scale-[1.02] active:scale-95 ${
                            evt.type === 'Court Date' ? 'bg-red-50 text-red-700 hover:bg-red-100' :
                            evt.type === 'Deadline'   ? 'bg-amber-50 text-amber-700 hover:bg-amber-100' :
                                                        'bg-blue-50 text-brand-blue hover:bg-blue-100'
                          }`}
                          title={`${evt.time} - ${evt.title}`}
                        >
                          <span className="font-bold mr-1">{evt.time.split(' ')[0]}</span>
                          {evt.title}
                        </div>
                      ))}
                    </div>

                    <button 
                      onClick={() => {
                        setShowEventModal(true);
                      }}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 text-text-muted hover:text-brand-blue transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Sidebar - Agenda & Tasks */}
        <div className="w-full xl:w-[380px] space-y-6">
          
          {/* Upcoming Agenda */}
          <div className="bg-white rounded-[2rem] border border-border-base p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg text-brand-dark flex items-center gap-2">
                <CalendarIcon size={18} className="text-brand-blue" /> Upcoming Agenda
              </h3>
              <button className="text-text-muted hover:text-brand-blue">
                <MoreVertical size={18} />
              </button>
            </div>
            
            <div className="space-y-4">
              {upcomingEvents.map((evt, i) => (
                <div key={evt.id} className="flex gap-4 group animate-in-up" style={{ animationDelay: `${(i + 1) * 100}ms` }}>
                  <div className="w-12 h-12 rounded-xl bg-page-bg flex flex-col items-center justify-center shrink-0 border border-border-base group-hover:border-brand-blue/30 transition-colors">
                    <span className="text-xs font-bold text-text-muted uppercase">{new Date(evt.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                    <span className="text-sm font-bold text-brand-dark">{new Date(evt.date).getDate()}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p 
                      onClick={() => setSelectedEvent(evt)}
                      className="font-bold text-brand-dark text-sm truncate group-hover:text-brand-blue transition-colors cursor-pointer"
                    >
                      {evt.title}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-xs text-text-secondary flex items-center gap-1">
                        <Clock size={12} /> {evt.time}
                      </p>
                      {evt.caseId && (
                        <p className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-light text-brand-blue">
                          {evt.caseId}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {upcomingEvents.length === 0 && (
                <div className="text-center py-6 text-text-muted text-sm font-medium">
                  No upcoming events.
                </div>
              )}
            </div>
            <button className="w-full mt-6 py-2.5 rounded-xl border border-border-base text-sm font-bold text-brand-dark hover:bg-page-bg transition-colors">
              View All Events
            </button>
          </div>

          {/* Tasks Widget */}
          <div className="bg-white rounded-[2rem] border border-border-base p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg text-brand-dark flex items-center gap-2">
                <CheckSquare size={18} className="text-brand-blue" /> Priority Tasks
              </h3>
              <div className="flex gap-1 bg-page-bg p-1 rounded-lg">
                {(['All', 'Overdue', 'My Tasks'] as const).map(f => (
                  <button 
                    key={f}
                    onClick={() => setTaskFilter(f)}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${taskFilter === f ? 'bg-white text-brand-blue shadow-sm' : 'text-text-muted hover:text-brand-dark'}`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="space-y-3">
              {filteredTasks.length === 0 ? (
                <p className="text-center py-6 text-xs text-text-muted font-medium">No tasks found.</p>
              ) : filteredTasks.map((task, i) => (
                <div 
                  key={task.id} 
                  className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer animate-in-up active:scale-95 ${
                    task.completed 
                      ? 'border-transparent bg-page-bg/50 opacity-60' 
                      : 'border-border-base hover:border-brand-blue/50 bg-white hover:shadow-sm'
                  }`}
                  style={{ animationDelay: `${(i + 1) * 50 + 200}ms` }}
                  onClick={() => toggleTask(task.id)}
                >
                  <div className={`mt-0.5 shrink-0 flex items-center justify-center w-5 h-5 rounded border transition-colors ${
                    task.completed ? 'bg-brand-blue border-brand-blue text-white' : 'border-border-base bg-white'
                  }`}>
                    {task.completed && <CheckSquare size={12} className="stroke-[3]" />}
                  </div>
                  
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-semibold truncate transition-all ${task.completed ? 'line-through text-text-muted' : 'text-brand-dark'}`}>
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                        task.priority === 'High' ? 'bg-red-50 text-red-600' :
                        task.priority === 'Medium' ? 'bg-amber-50 text-amber-600' :
                        'bg-slate-50 text-slate-600'
                      }`}>
                        {task.priority}
                      </span>
                      <span className="text-xs text-text-muted flex items-center gap-1">
                        <AlertCircle size={10} /> {task.dueDate}
                      </span>
                      <span className="text-xs text-text-muted ml-auto">
                        {task.assignee}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
        </div>
      </div>
    </AppLayout>
  );
}
