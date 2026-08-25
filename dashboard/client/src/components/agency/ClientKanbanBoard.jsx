import React, { useState, useEffect, useMemo } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Loader2, User, Phone, CheckCircle2, AlertCircle, Clock, Globe2, Briefcase } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '../../lib/api-client';

const KANBAN_STAGES = [
  { id: 'ENTRY', title: 'New Entry', color: 'bg-slate-100 border-slate-300' },
  { id: 'PROCESSING', title: 'Processing', color: 'bg-sky-50 border-sky-200' },
  { id: 'VISA_SUBMITTED', title: 'Visa Submitted', color: 'bg-amber-50 border-amber-200' },
  { id: 'FLIGHT_BOOKED', title: 'Flight Booked', color: 'bg-purple-50 border-purple-200' },
  { id: 'COMPLETED', title: 'Completed', color: 'bg-emerald-50 border-emerald-200' }
];

export function ClientKanbanBoard() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCases = async () => {
    setLoading(true);
    try {
      // using candidate endpoints since that's what frontdesk uses
      const res = await apiClient.get('/api/v1/client/candidates');
      const data = res.data?.data || res.data || [];
      setCases(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error('Failed to load candidate cases for board.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const columns = useMemo(() => {
    const cols = {
      ENTRY: [],
      PROCESSING: [],
      VISA_SUBMITTED: [],
      FLIGHT_BOOKED: [],
      COMPLETED: []
    };
    cases.forEach(c => {
      // Default to ENTRY if unknown or mapped status
      let st = c.status || 'ENTRY';
      if (!cols[st]) st = 'ENTRY'; 
      cols[st].push(c);
    });
    return cols;
  }, [cases]);

  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;

    if (source.droppableId === destination.droppableId) return;

    // Optimistic UI update
    const sourceStatus = source.droppableId;
    const destStatus = destination.droppableId;

    const updatedCases = cases.map(c => {
      if (c._id === draggableId || c.did === draggableId) {
        return { ...c, status: destStatus };
      }
      return c;
    });

    setCases(updatedCases);

    // Persist changes
    try {
      await apiClient.patch(`/api/v1/client/candidates/${draggableId}/status`, {
        status: destStatus
      });
      toast.success(`Candidate moved to ${destStatus.replace('_', ' ')}`);
    } catch (err) {
      toast.error('Failed to update status. Reverting.');
      fetchCases(); // Revert on failure
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-sky-500">
        <Loader2 className="w-8 h-8 animate-spin mb-3" />
        <p className="text-sm font-semibold">Loading Kanban Board...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full p-4 overflow-x-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Briefcase className="w-6 h-6 text-sky-600" />
          Client Pipeline Board
        </h2>
        <p className="text-xs text-slate-500">Drag and drop candidates across deployment stages to track progress.</p>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex items-start gap-4 h-[calc(100vh-250px)] pb-4">
          {KANBAN_STAGES.map((stage) => (
            <div key={stage.id} className={`flex-shrink-0 w-80 h-full flex flex-col rounded-xl border ${stage.color} overflow-hidden shadow-sm`}>
              {/* Column Header */}
              <div className="p-3 border-b border-inherit bg-white/50 backdrop-blur-sm flex justify-between items-center">
                <h3 className="font-bold text-sm text-slate-800">{stage.title}</h3>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-900 text-white">
                  {columns[stage.id].length}
                </span>
              </div>

              {/* Droppable Area */}
              <Droppable droppableId={stage.id}>
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`flex-1 p-3 overflow-y-auto space-y-3 transition-colors ${snapshot.isDraggingOver ? 'bg-black/5' : ''}`}
                  >
                    {columns[stage.id].map((c, index) => (
                      <Draggable key={c._id || c.did || c.fileNumber} draggableId={c._id || c.did || c.fileNumber} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`bg-white p-3 rounded-lg border border-slate-200 shadow-sm hover:border-sky-400 transition-all ${snapshot.isDragging ? 'shadow-lg rotate-2 scale-105' : ''}`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-[10px] font-mono font-bold text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded">
                                {c.fileNumber || 'NEW-000'}
                              </span>
                              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(c.createdAt || Date.now()).toLocaleDateString()}
                              </span>
                            </div>
                            
                            <h4 className="font-bold text-sm text-slate-800 leading-tight mb-1">
                              {c.candidateName}
                            </h4>
                            
                            <div className="text-[11px] text-slate-600 flex items-center gap-1.5 mt-2">
                              <Globe2 className="w-3.5 h-3.5 text-slate-400" />
                              <span className="truncate">{c.destinationCountry || 'Unassigned'}</span>
                            </div>
                            <div className="text-[11px] text-slate-600 flex items-center gap-1.5 mt-1">
                              <Phone className="w-3.5 h-3.5 text-slate-400" />
                              <span className="truncate">{c.candidatePhone || 'N/A'}</span>
                            </div>

                            {/* Tags */}
                            <div className="mt-3 flex flex-wrap gap-1">
                              <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500">
                                {c.tradeSkill || 'Labor'}
                              </span>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
