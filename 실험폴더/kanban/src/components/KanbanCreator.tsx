import { useCallback } from 'react';
import { useRecoilState } from 'recoil';
import { kanbanListState } from '../recoil';
import React from 'react';
import './KanbanCreator.scss';

function KanbanCreator({ title }: { title: string }) {
  const [kanbanList, setKanbanList] = useRecoilState(kanbanListState);
  const addCard = useCallback(async () => {
    try {
      const response = await fetch('/api/newcard/id');
      const res = await response.json();
      const getId = res.id;
      // const getId: number =

      const newCard = {
        id: getId,
        title: '',
        content: '',
        category: title,
        isChecked: false,
        dateRange: null, // 새로운 필드 추가
        startDate: null, // 새로운 필드 추가
        endDate: null, // 새로운 필드 추가
        assignee: null
      };

      // console.log('Adding new card:', newCard); // 디버깅 로그

      const updatedList = [...kanbanList, newCard];
      setKanbanList(updatedList);

      fetch('/api/newcard', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(newCard)
      });

    } catch (error) {
      console.error('Error adding card:', error);
    }
  }, [kanbanList, setKanbanList, title]);

  return (
    <div className="addBtnWrap">
      <button className="cardAddBtn" onClick={addCard}>
        + 새 업무
      </button>
    </div>
  );
}

export default React.memo(KanbanCreator);
