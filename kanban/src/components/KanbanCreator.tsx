import { useCallback } from 'react';
import { useRecoilState } from 'recoil';
import { kanbanListState } from '../recoil';
import React from 'react';
import './KanbanCreator.scss';

const saveToLocalStorage = (cards: any[]) => {
  localStorage.setItem('kanbanCards', JSON.stringify(cards));
};

function KanbanCreator({ title }: { title: string }) {
  const [kanbanList, setKanbanList] = useRecoilState(kanbanListState);

  const addCard = useCallback(() => {
    try {
      const getId: number =
        kanbanList.length > 0 ? kanbanList[kanbanList.length - 1].id + 1 : 0;

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

      console.log('Adding new card:', newCard); // 디버깅 로그

      const updatedList = [...kanbanList, newCard];
      setKanbanList(updatedList);
      saveToLocalStorage(updatedList);

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
