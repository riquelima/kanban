
import React from 'react';
import { DayColumnType, TaskCardType, DayOfWeekId } from '../types';
import DayColumn from './DayColumn';

interface BoardProps {
  boardData: DayColumnType[];
  onAddTask: (dayId: DayOfWeekId, taskName: string) => void;
  onOpenChecklist: (dayId: DayOfWeekId, task: TaskCardType) => void;
  onDeleteTask: (dayId: DayOfWeekId, taskId: string) => void;
}

const Board: React.FC<BoardProps> = ({ boardData, onAddTask, onOpenChecklist, onDeleteTask }) => {
  return (
    <div className="flex space-x-4 p-4 overflow-x-auto h-full items-start">
      {boardData.map((day) => (
        <DayColumn 
          key={day.id} 
          day={day} 
          onAddTask={onAddTask}
          onOpenChecklist={onOpenChecklist}
          onDeleteTask={onDeleteTask}
        />
      ))}
    </div>
  );
};

export default Board;
