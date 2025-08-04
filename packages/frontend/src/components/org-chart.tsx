'use client';

import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, OnDragEndResponder } from 'react-beautiful-dnd';

// --- Types ---
interface Department {
  id: string;
  name: string;
  parent_department_id: string | null;
  children: Department[];
}

// --- Mock Data & API ---
// In a real app, this would be fetched from the API
const MOCK_DEPARTMENTS: Department[] = [
  { id: '1', name: 'CEO Office', parent_department_id: null, children: [] },
  { id: '2', name: 'Product Division', parent_department_id: '1', children: [] },
  { id: '3', name: 'Engineering', parent_department_id: '2', children: [] },
  { id: '4', name: 'Design', parent_department_id: '2', children: [] },
  { id: '5', name: 'Revenue Division', parent_department_id: '1', children: [] },
  { id: '6', name: 'Sales', parent_department_id: '5', children: [] },
  { id: '7', name: 'Marketing', parent_department_id: '5', children: [] },
];

const buildTree = (departments: Department[]): Department[] => {
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
        className="p-3 mb-2 bg-white border rounded shadow-sm"
      >
        <p>{dept.name}</p>
        <Droppable droppableId={dept.id} type="DEPARTMENT">
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`ml-4 mt-2 p-2 min-h-[50px] rounded ${snapshot.isDraggingOver ? 'bg-blue-100' : 'bg-gray-50'}`}
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
  const [departments, setDepartments] = useState<Department[]>([]);
  const [tree, setTree] = useState<Department[]>([]);

  useEffect(() => {
    // TODO: Replace with actual API call to GET /departments/{org_id}
    setDepartments(MOCK_DEPARTMENTS);
  }, []);

  useEffect(() => {
    setTree(buildTree(departments));
  }, [departments]);

  const onDragEnd: OnDragEndResponder = (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }

    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    // This is a complex operation. A real implementation would need a robust
    // state management library (like Redux or Zustand) to handle this immutably.
    // For now, we'll just update the parent and optimistically re-render.
    const newParentId = destination.droppableId;

    setDepartments(prevDepts => {
        const newDepts = prevDepts.map(d => {
            if (d.id === draggableId) {
                // TODO: Here you would make the API call:
                // PUT /departments/{draggableId} with body { parent_department_id: newParentId }
                console.log(`Moving department ${draggableId} to new parent ${newParentId}`);
                return { ...d, parent_department_id: newParentId };
            }
            return d;
        });
        return newDepts;
    });
  };

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
