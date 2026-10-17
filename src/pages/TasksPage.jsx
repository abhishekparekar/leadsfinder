import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, 
  Calendar, 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  Phone, 
  Mail, 
  Users, 
  Plus, 
  X,
  FileText
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { LeadDetailModal } from '../components/leads/LeadDetailModal';

export function TasksPage({ onOpenOutreach }) {
  const { currentUser } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dueToday'); // 'dueToday' | 'overdue' | 'upcoming' | 'completed'

  // Task Creation Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newLeadId, setNewLeadId] = useState('');
  const [newType, setNewType] = useState('call');
  const [newDueAt, setNewDueAt] = useState('');

  // Complete Task Modal
  const [completingTask, setCompletingTask] = useState(null);
  const [completionOutcome, setCompletionOutcome] = useState('');

  // Lead detail drawer
  const [selectedLeadId, setSelectedLeadId] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tasksData, leadsData] = await Promise.all([
        api.getTasks(),
        api.getLeads()
      ]);
      setTasks(tasksData);
      setLeads(leadsData);
      if (leadsData.length > 0 && !newLeadId) {
        setNewLeadId(leadsData[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await api.createTask({
        leadId: newLeadId,
        title: newTitle,
        type: newType,
        dueAt: new Date(newDueAt).toISOString(),
        actorUid: currentUser?.uid
      });
      setCreateModalOpen(false);
      setNewTitle('');
      setNewDueAt('');
      loadData();
    } catch (err) {
      alert('Error creating task: ' + err.message);
    }
  };

  const handleCompleteTask = async () => {
    if (!completingTask) return;
    try {
      await api.updateTask(completingTask.id, {
        status: 'Completed',
        outcome: completionOutcome || 'Task marked complete.'
      }, currentUser?.uid);
      setCompletingTask(null);
      setCompletionOutcome('');
      loadData();
    } catch (err) {
      alert('Error completing task: ' + err.message);
    }
  };

  const now = new Date();
  const overdueTasks = tasks.filter(t => t.status === 'Pending' && new Date(t.dueAt) < now);
  const tasksDueToday = tasks.filter(t => {
    if (t.status !== 'Pending') return false;
    const d = new Date(t.dueAt);
    return d.toDateString() === now.toDateString();
  });
  const upcomingTasks = tasks.filter(t => {
    if (t.status !== 'Pending') return false;
    const d = new Date(t.dueAt);
    return d > now && d.toDateString() !== now.toDateString();
  });
  const completedTasks = tasks.filter(t => t.status === 'Completed');

  const currentList = 
    activeTab === 'dueToday' ? tasksDueToday :
    activeTab === 'overdue' ? overdueTasks :
    activeTab === 'upcoming' ? upcomingTasks :
    completedTasks;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Tasks & Follow-up Discipline</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-600/20 text-blue-400 border border-blue-500/30 font-semibold">
              PRD Section 7.6
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            "A lead database without follow-up discipline will not create sales by itself."
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule New Task</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-900/60 rounded-t-2xl px-4">
        <button
          onClick={() => setActiveTab('dueToday')}
          className={`py-3.5 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition ${
            activeTab === 'dueToday' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Due Today ({tasksDueToday.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('overdue')}
          className={`py-3.5 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition ${
            activeTab === 'overdue' ? 'border-rose-500 text-rose-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <AlertCircle className="w-4 h-4" />
          <span>Overdue ({overdueTasks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('upcoming')}
          className={`py-3.5 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition ${
            activeTab === 'upcoming' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Upcoming 7 Days ({upcomingTasks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('completed')}
          className={`py-3.5 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition ${
            activeTab === 'completed' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Completed ({completedTasks.length})</span>
        </button>
      </div>

      {/* Task List */}
      <div className="rounded-b-2xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden divide-y divide-slate-800">
        {currentList.length === 0 ? (
          <div className="py-20 text-center text-slate-500 text-xs">
            No tasks in this category.
          </div>
        ) : (
          currentList.map(task => {
            const lead = leads.find(l => l.id === task.leadId);
            return (
              <div key={task.id} className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-slate-850/50 transition">
                <div className="flex items-start gap-3 flex-1">
                  <div className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 shrink-0 mt-0.5">
                    {task.type === 'call' ? <Phone className="w-4 h-4 text-emerald-400" /> :
                     task.type === 'meeting' ? <Calendar className="w-4 h-4 text-purple-400" /> :
                     task.type === 'email' ? <Mail className="w-4 h-4 text-blue-400" /> :
                     <FileText className="w-4 h-4 text-amber-400" />}
                  </div>

                  <div className="space-y-1">
                    <p className="font-bold text-sm text-white">{task.title}</p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                      {lead && (
                        <button
                          onClick={() => setSelectedLeadId(lead.id)}
                          className="font-semibold text-cyan-400 hover:underline"
                        >
                          {lead.businessName} ({lead.locality})
                        </button>
                      )}
                      <span>•</span>
                      <span className="font-mono text-slate-300">
                        Due: {new Date(task.dueAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {task.outcome && (
                        <>
                          <span>•</span>
                          <span className="text-emerald-400 italic">Outcome: {task.outcome}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {task.status !== 'Completed' ? (
                    <button
                      onClick={() => setCompletingTask(task)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white text-xs font-semibold transition flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Complete Task</span>
                    </button>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
                      Completed
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Complete Task Modal */}
      {completingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Record Task Outcome</h3>
            <p className="text-xs text-slate-400">{completingTask.title}</p>

            <div>
              <label className="text-xs text-slate-300 block mb-1">Outcome & Next Steps</label>
              <textarea
                rows={3}
                value={completionOutcome}
                onChange={(e) => setCompletionOutcome(e.target.value)}
                placeholder="e.g. Spoke with Dr. Vivek, agreed to see demo on Thursday..."
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-750 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setCompletingTask(null)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleCompleteTask}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold"
              >
                Save & Mark Complete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <form onSubmit={handleCreateTask} className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-white">Schedule Follow-up Action</h3>
              <button onClick={() => setCreateModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Lead</label>
                <select
                  value={newLeadId}
                  onChange={(e) => setNewLeadId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-750 text-slate-200"
                  required
                >
                  {leads.map(l => (
                    <option key={l.id} value={l.id}>{l.businessName} ({l.locality})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Task Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Call regarding clinic proposal follow-up"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-750 text-slate-200"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-750 text-slate-200"
                  >
                    <option value="call">Call</option>
                    <option value="meeting">Meeting</option>
                    <option value="email">Email</option>
                    <option value="review">Review</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Due Date & Time</label>
                  <input
                    type="datetime-local"
                    value={newDueAt}
                    onChange={(e) => setNewDueAt(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-750 text-slate-200"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold"
              >
                Schedule Task
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lead Detail Modal */}
      {selectedLeadId && (
        <LeadDetailModal
          leadId={selectedLeadId}
          onClose={() => setSelectedLeadId(null)}
          onLeadUpdated={() => loadData()}
          onOpenOutreach={onOpenOutreach}
        />
      )}
    </div>
  );
}
