import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, CheckSquare, Plus, Clock, MoreVertical, Filter, AlertCircle } from 'lucide-react';
import AppLayout from '../components/AppLayout';
import { EVENTS, TASKS, type CalendarEvent, type Task } from '../data/calendar';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState(TASKS);

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
    const dayEvents = EVENTS.filter(e => e.date === dateStr);
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

  // Get next 3 upcoming events for the agenda
  const todayStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;
  const upcomingEvents = EVENTS.filter(e => e.date >= todayStr).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 3);

  return (
    <AppLayout 
      title="Calendar & Tasks"
      action={
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-white text-brand-dark px-4 py-2.5 rounded-xl font-bold border border-border-base shadow-sm hover:shadow-md transition-all">
            <CheckSquare size={18} /> New Task
          </button>
          <button className="flex items-center gap-2 bg-brand-blue text-white px-4 py-2.5 rounded-xl font-bold shadow-lg shadow-brand-blue/30 hover:shadow-xl hover:-translate-y-0.5 transition-all">
            <Plus size={18} /> New Event
          </button>
        </div>
      }
    >
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
          <div className="grid grid-cols-7 gap-px bg-border-base rounded-xl overflow-hidden border border-border-base">
            {/* Days Header */}
            {dayNames.map(day => (
              <div key={day} className="bg-page-bg/80 py-3 text-center text-xs font-bold text-text-muted uppercase tracking-wider">
                {day}
              </div>
            ))}
            
            {/* Calendar Cells */}
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
                          className={`px-2 py-1.5 rounded-lg text-xs font-semibold cursor-pointer truncate ${
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

                    <button className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 text-text-muted hover:text-brand-blue transition-colors">
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
              {upcomingEvents.map(evt => (
                <div key={evt.id} className="flex gap-4 group">
                  <div className="w-12 h-12 rounded-xl bg-page-bg flex flex-col items-center justify-center shrink-0 border border-border-base group-hover:border-brand-blue/30 transition-colors">
                    <span className="text-xs font-bold text-text-muted uppercase">{new Date(evt.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                    <span className="text-sm font-bold text-brand-dark">{new Date(evt.date).getDate()}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-brand-dark text-sm truncate group-hover:text-brand-blue transition-colors cursor-pointer">{evt.title}</p>
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
                <div className="text-center py-6 text-text-muted text-sm">
                  No upcoming events this month.
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
              <button className="text-text-muted hover:text-brand-blue">
                <Filter size={18} />
              </button>
            </div>
            
            <div className="space-y-3">
              {tasks.map(task => (
                <div 
                  key={task.id} 
                  className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                    task.completed 
                      ? 'border-transparent bg-page-bg/50 opacity-60' 
                      : 'border-border-base hover:border-brand-blue/50 bg-white hover:shadow-sm'
                  }`}
                  onClick={() => toggleTask(task.id)}
                >
                  <div className={`mt-0.5 shrink-0 flex items-center justify-center w-5 h-5 rounded border ${
                    task.completed ? 'bg-brand-blue border-brand-blue text-white' : 'border-border-base'
                  }`}>
                    {task.completed && <CheckSquare size={12} className="stroke-[3]" />}
                  </div>
                  
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-semibold truncate ${task.completed ? 'line-through text-text-muted' : 'text-brand-dark'}`}>
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
