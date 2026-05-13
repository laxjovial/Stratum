'use client';

import React, { useState, useEffect, useCallback } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap, 
  Node, 
  Edge,
  Handle, 
  Position,
  Panel,
  useNodesState,
  useEdgesState
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useApi } from '../lib/api';
import { useAuth } from '../hooks/use-auth';
import { Network, Briefcase, Plus, Loader2, MousePointer2, Trash2, Edit3, X, Save, AlertCircle } from 'lucide-react';

// --- Custom Node Components ---

const DepartmentNode = ({ id, data }: any) => {
  return (
    <div className="px-6 py-4 shadow-2xl rounded-[24px] bg-white border-2 border-blue-600 min-w-[200px] group transition-all hover:shadow-blue-100 relative">
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-blue-600 border-2 border-white" />
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
          <Network className="w-5 h-5" />
        </div>
        <div>
          <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-0.5">Department</div>
          <div className="text-sm font-black text-gray-900">{data.label}</div>
        </div>
      </div>

      {/* Node Actions Overlay */}
      <div className="absolute -top-3 -right-3 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={(e) => { e.stopPropagation(); data.onAddChild(id); }}
          className="p-2 bg-blue-600 text-white rounded-full shadow-lg hover:scale-110 transition-transform"
        >
          <Plus className="w-3 h-3" />
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); data.onDelete(id); }}
          className="p-2 bg-red-600 text-white rounded-full shadow-lg hover:scale-110 transition-transform"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-blue-600 border-2 border-white" />
    </div>
  );
};

const nodeTypes = {
  department: DepartmentNode
};

export default function OrgChart() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [targetDeptId, setTargetDeptId] = useState<string | null>(null);
  const [newDeptName, setNewDeptName] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const api = useApi();
  const { user } = useAuth();

  const fetchHierarchy = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const profile = await api.get('/auth/me');
      if (!profile.organization_id) {
        setError('No organization found. Please complete onboarding.');
        return;
      }

      const depts = await api.get(`/departments/${profile.organization_id}`);

      const newNodes: Node[] = depts.map((dept: any, index: number) => ({
        id: dept.id,
        type: 'department',
        data: { 
          label: dept.name,
          onAddChild: (parentId: string) => {
            setTargetDeptId(parentId);
            setModalMode('add');
            setIsModalOpen(true);
          },
          onDelete: async (id: string) => {
            if (confirm('Are you sure you want to delete this department and all its connections?')) {
               try {
                 await api.delete(`/departments/${id}`);
                 fetchHierarchy();
               } catch (err: any) {
                 alert(`Failed to delete: ${err.message}`);
               }
            }
          }
        },
        position: { x: index * 250, y: dept.parent_department_id ? 200 : 0 },
      }));

      const newEdges: Edge[] = depts
        .filter((dept: any) => dept.parent_department_id)
        .map((dept: any) => ({
          id: `e-${dept.parent_department_id}-${dept.id}`,
          source: dept.parent_department_id,
          target: dept.id,
          animated: true,
          style: { stroke: '#3b82f6', strokeWidth: 2 },
        }));

      setNodes(newNodes);
      setEdges(newEdges);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [api, setNodes, setEdges]);

  useEffect(() => {
    if (user) fetchHierarchy();
  }, [user, fetchHierarchy]);

  const handleCreateDept = async () => {
    if (!newDeptName) return;
    try {
      setLoading(true);
      const profile = await api.get('/auth/me');
      if (!profile.organization_id) throw new Error('No organization ID found');

      await api.post(`/departments/${profile.organization_id}`, {
        name: newDeptName,
        parent_department_id: targetDeptId
      });
      setNewDeptName('');
      setIsModalOpen(false);
      fetchHierarchy();
    } catch (err: any) {
      alert(`Failed to create department: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading && nodes.length === 0) {
    return (
      <div className="h-[600px] flex flex-col items-center justify-center space-y-4 bg-gray-50/50 rounded-[40px] border border-dashed border-gray-200">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
        <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Rendering Neural Net...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[600px] flex flex-col items-center justify-center space-y-6 bg-red-50/30 rounded-[40px] border border-dashed border-red-100 text-center p-10">
        <div className="p-4 bg-red-100 text-red-600 rounded-3xl">
          <AlertCircle className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Hierarchy Offline</h3>
          <p className="text-gray-500 font-medium max-w-xs mx-auto">{error}</p>
        </div>
        <button 
          onClick={() => fetchHierarchy()}
          className="px-8 py-3 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-800 transition-all"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="h-[700px] w-full bg-white rounded-[40px] shadow-2xl border border-gray-100 overflow-hidden relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        className="bg-gray-50/30"
      >
        <Background color="#f1f5f9" gap={20} />
        <Controls className="bg-white border-none shadow-xl rounded-xl overflow-hidden" />
        <MiniMap 
            nodeColor="#3b82f6"
            maskColor="rgba(241, 245, 249, 0.7)"
            className="rounded-3xl border border-gray-100 shadow-xl"
        />
        
        <Panel position="top-left" className="bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-xl border border-white m-4">
            <div className="space-y-4">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-600 text-white rounded-xl shadow-lg">
                        <Network className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">Organization Web</h2>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Live Hierarchy Control</p>
                    </div>
                </div>
            </div>
        </Panel>

        <Panel position="bottom-right" className="m-4">
            <button 
                onClick={() => {
                  setTargetDeptId(null);
                  setModalMode('add');
                  setIsModalOpen(true);
                }}
                className="flex items-center space-x-2 px-6 py-4 bg-gray-900 text-white rounded-2xl shadow-2xl hover:scale-105 transition-all group font-black text-xs uppercase tracking-widest"
            >
                <Plus className="w-5 h-5" />
                <span>Add Root Dept</span>
            </button>
        </Panel>
      </ReactFlow>

      {/* Simple Modal */}
      {isModalOpen && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-6">
          <div className="bg-white rounded-[40px] shadow-2xl p-10 w-full max-w-md space-y-8 animate-in zoom-in duration-300">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-black text-gray-900 tracking-tight uppercase">
                {modalMode === 'add' ? 'New Department' : 'Edit Department'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Department Name</label>
                <input 
                  type="text" 
                  value={newDeptName}
                  onChange={(e) => setNewDeptName(e.target.value)}
                  placeholder="e.g. Engineering, Sales..."
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 transition-all font-bold"
                  autoFocus
                />
              </div>

              <button 
                onClick={handleCreateDept}
                disabled={loading}
                className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>{modalMode === 'add' ? 'Create Node' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="absolute bottom-6 left-6 flex items-center space-x-2 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full border border-white text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] shadow-sm pointer-events-none">
        <MousePointer2 className="w-3 h-3" />
        <span>Hover nodes for actions • Drag to reorder</span>
      </div>
    </div>
  );
}
