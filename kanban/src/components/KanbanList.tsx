import React, { useEffect } from 'react';
import KanbanCreator from './KanbanCreator';
import { useDrop } from 'react-dnd';
import { useRecoilState } from 'recoil';
import { kanbanListState } from '../recoil';
import './KanbanList.scss';

// 로컬 스토리지에서 카드 목록을 불러오는 함수
const loadFromLocalStorage = (): any[] => {
  const storedData = localStorage.getItem('kanbanCards');
  return storedData ? JSON.parse(storedData) : [];
};

function KanbanList({ title, children }: { title: string; children: any }) {
  const [{ canDrop, isOver }, drop] = useDrop({
    accept: 'card',
    drop: () => ({ name: title }),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  const [kanbanList, setKanbanList] = useRecoilState(kanbanListState);

  // 로컬 스토리지에서 카드 목록을 로드하여 상태를 초기화
  useEffect(() => {
    const loadedList = loadFromLocalStorage();
    setKanbanList(loadedList);
  }, [setKanbanList]);

  return (
    <div className="kanbanListWrap" ref={drop}>
      <div className="kanbanTitle">{title}</div>
      {children}
      <KanbanCreator title={title} />
    </div>
  );
}

export default React.memo(KanbanList);
