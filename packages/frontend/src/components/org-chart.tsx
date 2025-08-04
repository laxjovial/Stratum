'use client';

import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, OnDragEndResponder } from 'react-beautiful-dnd';
import api from '../lib/api'; // Import the new API utility

// --- Types ---
interface Department {
  id: string;
  name: string;
  parent_department_id: string | null;
  children: Department[];
}

// --- Helper function to build the tree structure ---
const buildTree = (departments: Omit<Department, 'children'>[]): Department[] => {
    const map = new Map<string, Department>();
    const roots: Department[] = [];

    departments.forEach(dept => {
        map.set(dept.id, { ...dept, children: [] });
    });

    departments.forEach(dept => {
        if (dept.parent_department_id && map.has(dept.parent_department_id)) {
            map.get(dept.parent_department_id)!.children.push(map.get(dept.id)!);
        } else {
            roots.push(map.get(dept.id)!);
        }
    });
    return roots;
};

// --- Department Node Component ---
const DepartmentNode = ({ dept, index }: { dept: Department; index: number }) => (
  <Draggable draggableId={dept.id} index={index}>
    {(provided) => (
      <div
        ref={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
        className="p-3 mb-2 bg-white border rounded shadow-sm hover:bg-gray-50"
      >
        <p className="font-medium">{dept.name}</p>
        <Droppable droppableId={dept.id} type="DEPARTMENT">
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`ml-4 mt-2 p-2 min-h-[50px] rounded transition-colors ${snapshot.isDraggingOver ? 'bg-blue-100' : 'bg-gray-50'}`}
            >
              {dept.children.map((child, childIndex) => (
                <DepartmentNode key={child.id} dept={child} index={childIndex} />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>
    )}
  </Draggable>
);

// --- Main Org Chart Component ---
export default function OrgChart() {
  const [departments, setDepartments] = useState<Omit<Department, 'children'>[]>([]);
  const [tree, setTree] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Placeholder for the current user's organization ID
  const organizationId = 'your-organization-id'; // This would come from a user context or similar

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setLoading(true);
        const data = await api.get(`/departments/${organizationId}`);
        setDepartments(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDepartments();
  }, [organizationId]);

  useEffect(() => {
    if(departments.length > 0) {
        setTree(buildTree(departments));
    }
  }, [departments]);

  const onDragEnd: OnDragEndResponder = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newParentId = destination.droppableId;

    // Optimistic UI update
    const originalDepts = [...departments];
    const updatedDepts = departments.map(d =>
        d.id === draggableId ? { ...d, parent_department_id: newParentId } : d
    );
    setDepartments(updatedDepts);

    try {
        // Persist the change to the backend
        await api.put(`/departments/${draggableId}`, { parent_department_id: newParentId });
    } catch (err: any) {
        setError(err.message);
        // Revert the optimistic update on failure
        setDepartments(originalDepts);
    }
  };

  if (loading) return <p>Loading hierarchy...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="root" type="DEPARTMENT">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef}>
            {tree.map((dept, index) => (
              <DepartmentNode key={dept.id} dept={dept} index={index} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
