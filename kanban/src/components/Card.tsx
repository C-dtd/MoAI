// Card.tsx
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDrag } from 'react-dnd';
import { useRecoilState } from 'recoil';
import { TITLE_NAME } from '../App';
import { kanbanListState } from '../recoil';
import './Card.scss';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ko } from 'date-fns/locale';
import ReactDOM from 'react-dom';
import axios from 'axios';


function Card({ item }: { item: cardtype }) {
  const [list, setList] = useRecoilState(kanbanListState);
  const [badgeColor, setBadgeColor] = useState('');
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState<string | null>(item.dateRange || null);
  const [startDate, setStartDate] = useState<Date | null>(item.startDate || null);
  const [endDate, setEndDate] = useState<Date | null>(item.endDate || null);
  const [assignee, setAssignee] = useState<string | null>(item.assignee || null);
  const [isAssigneePickerVisible, setIsAssigneePickerVisible] = useState(false);
  const [assignees, setAssignees] = useState<string[]>([]);

  const index = list.findIndex((data) => data.id === item.id);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const datePickerButtonRef = useRef<HTMLButtonElement>(null);
  const selectedDateRangeRef = useRef<HTMLSpanElement>(null);
  const datePickerRef = useRef<HTMLDivElement>(null);
  const assignPickerButtonRef = useRef<HTMLButtonElement>(null);
  const assignPickerRef = useRef<HTMLDivElement>(null);

  const { TO_DO, IN_PROGRESS, DONE, NOTE } = TITLE_NAME;

  const replaceIndex = (list: cardtype[], index: number, data: cardtype) => {
    return [...list.slice(0, index), data, ...list.slice(index + 1)];
  };

  const editTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newList = replaceIndex(list, index, {
      ...item,
      title: e.target.value,
      dateRange: selectedDateRange,
      startDate,
      endDate,
    });
    setList(newList);
  };

  const updateTitleInDatabase = (newTitle: string) => {
    fetch('/api/editcard/title', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: item.id,
        title: newTitle
      })
    });
  };
  

  const editText = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newList = replaceIndex(list, index, {
      ...item,
      content: e.target.value,
      dateRange: selectedDateRange,
      startDate,
      endDate,
    });
    setList(newList);
  };

   // 내용을 데이터베이스에 업데이트하는 함수
   const updateContentInDatabase = (newContent: string) => {
    fetch('/api/editcard/text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: item.id,
        content: newContent
      })
    });
  };

  const handleResizeHeight = useCallback(() => {
    if (contentRef.current === null) {
      return;
    }
    contentRef.current.style.height = '70px';
    contentRef.current.style.height = contentRef.current.scrollHeight + 'px';
  }, []);

  const deleteItem = () => {
    const newList = list.filter((_, i) => i !== index);
    setList(newList);

    fetch('/api/deletecard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: item.id,
      })
    });
  };

  const changeItemCategory = (selectedItem: cardtype, title: string) => {
    setList((prevList) => {
      const updatedList = prevList.map((e) =>
        e.id === selectedItem.id
          ? {
            ...e,
            category: title,
          }
          : e
      );

      fetch('/api/editcard/category', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedItem.id,
          category: title
        })
      });
      return updatedList;
    });
  };

  const [{ isDragging }, dragRef] = useDrag(() => ({
    type: 'card',
    item: { ...item },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end: (draggedItem: cardtype, monitor) => {
      const dropResult: drop | null = monitor.getDropResult();
      if (dropResult) {
        changeItemCategory(draggedItem, dropResult.name);
      }
    },
  }));

  useEffect(() => {
    switch (item.category) {
      case TO_DO:
        setBadgeColor('#ef5777');
        break;
      case IN_PROGRESS:
        setBadgeColor('#B33771');
        break;
      case DONE:
        setBadgeColor('#341f97');
        break;
      case NOTE:
        setBadgeColor('#130f40');
        break;
      default:
        break;
    }
  }, [item.category]);

  useEffect(() => {
    setSelectedDateRange(item.dateRange || null);
    setStartDate(item.startDate || null);
    setEndDate(item.endDate || null);
    setAssignee(item.assignee || null);
  }, [item]);

  useEffect(() => {
    const fetchAssignees = async () => {
      try {
        const response = await axios.get('/api/assignees');
        setAssignees(response.data);
      } catch (error) {
        console.error('Error fetching assignees:', error);
      }
    };
    fetchAssignees();
  }, []);

  const handleDateChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);

    if (start && end) {
      const startFormatted = start.toLocaleDateString('ko-KR');
      const endFormatted = end.toLocaleDateString('ko-KR');
      const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      setSelectedDateRange(`${startFormatted} ~ ${endFormatted} (총 ${totalDays}일)`);
      setIsDatePickerVisible(false);

      const newList = replaceIndex(list, index, {
        ...item,
        dateRange: `${startFormatted} ~ ${endFormatted} (총 ${totalDays}일)`,
        startDate: start,
        endDate: end,
      });
      setList(newList);

      fetch('/api/editcard/date', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: item.id,
          dateRange: `${startFormatted} ~ ${endFormatted} (총 ${totalDays}일)`,
          startDate: start,
          endDate: end
        })
      });
    } else {
      setSelectedDateRange(null);
    }
  };

  const getDatePickerPosition = () => {
    let top = 0;
    let left = 0;
    if (datePickerButtonRef.current) {
      const rect = datePickerButtonRef.current.getBoundingClientRect();
      top = rect.bottom + window.scrollY + 10;
      left = rect.left + window.scrollX;
    }
    if (selectedDateRangeRef.current) {
      const rangeRect = selectedDateRangeRef.current.getBoundingClientRect();
      top = rangeRect.bottom + window.scrollY + 10;
      left = rangeRect.left + window.scrollX;
    }
    return { top, left };
  };

  useEffect(() => {
    const handleClickOutsideCal = (event: MouseEvent | TouchEvent) => {
      if (
        datePickerRef.current &&
        !datePickerRef.current.contains(event.target as Node) &&
        !datePickerButtonRef.current?.contains(event.target as Node)
      ) {
        setIsDatePickerVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutsideCal);
    document.addEventListener('touchstart', handleClickOutsideCal);

    return () => {
      document.removeEventListener('mousedown', handleClickOutsideCal);
      document.removeEventListener('touchstart', handleClickOutsideCal);
    };
  }, []);
  
  useEffect(() => {
    const handleClickOutsideAssign = (event: MouseEvent | TouchEvent) => {
      if (
        assignPickerRef.current &&
        !assignPickerRef.current.contains(event.target as Node) &&
        !assignPickerButtonRef.current?.contains(event.target as Node)
      ) {
        setIsAssigneePickerVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutsideAssign);
    document.addEventListener('touchstart', handleClickOutsideAssign);

    return () => {
      document.removeEventListener('mousedown', handleClickOutsideAssign);
      document.removeEventListener('touchstart', handleClickOutsideAssign);
    };
  }, []);	

  const handleAssigneeChange = (newAssignee: string) => {
    setAssignee(newAssignee);

    const newList = list.map((card) => {
      if (card.id === item.id) {
        return { ...card, assignee: newAssignee };
      }
      return card;
    });

    setList(newList);

    fetch('/api/editcard/assignee', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: item.id,
        assignee: newAssignee
      })
    });
    setIsAssigneePickerVisible(false);
  };

  return (
    <div
      className="cardWrap"
      ref={dragRef}
      style={{ opacity: isDragging ? '0.3' : '1' }}
    >
      <div className="cardHeaderWrap">
        <span
          className="cardTitleBadge"
          style={{ backgroundColor: badgeColor }}
        >
          {item.category}
        </span>
        <img
          className="deleteimg"
          src="images/cancel.png"
          alt="delete"
          onClick={deleteItem}
        />
      </div>
      <div className="cardContentWrap">
      <div className="assigneeWrap">
          <button
            className="assigneeButton"
            ref={assignPickerButtonRef}
            onClick={() => setIsAssigneePickerVisible(!isAssigneePickerVisible)}
          >
            {assignee ? assignee : '담당자'}
          </button>
          {isAssigneePickerVisible && (
            <div 
              className="assigneePicker"
              ref={assignPickerRef}
            >
              {assignees.map((name) => (
                <div
                  key={name}
                  className="assigneeOption"
                  onClick={() => handleAssigneeChange(name)}
                >
                  {name}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="inputWrap">
          <input
            className="cardTitle"
            type="text"
            value={item.title}
            onChange={editTitle}
            onBlur={(e) => updateTitleInDatabase(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault(); // Enter 키가 textarea에서 줄바꿈을 하지 않도록 방지
                updateTitleInDatabase(e.currentTarget.value);
              }
            }}
            placeholder="제목을 입력하세요"
          />
        </div>
        <div className="textareaWrap">
          <textarea
            className="cardContent"
            value={item.content}
            onChange={editText}
            onBlur={(e) => updateContentInDatabase(e.target.value)}
            onInput={handleResizeHeight}
            ref={contentRef}
            placeholder="내용을 입력하세요"
            spellCheck="false"
          />
        </div>
        
        <div className="dateRangeWrap">
          {!selectedDateRange ? (
            <button
              className="dateRangeButton"
              ref={datePickerButtonRef}
              onClick={() => setIsDatePickerVisible(!isDatePickerVisible)}
            >
              기간 설정
            </button>
          )
          : (
            <span
              className="selectedDateRange"
              ref={selectedDateRangeRef}
              onClick={() => setIsDatePickerVisible(true)}
            >
              {selectedDateRange}
            </span>
          )}
          {isDatePickerVisible &&
            ReactDOM.createPortal(
              <div
                className="datePickers"
                ref={datePickerRef}
                style={{
                  position: 'absolute',
                  top: `${getDatePickerPosition().top}px`,
                  left: `${getDatePickerPosition().left}px`,
                  zIndex: 1000,
                }}
              >
                <DatePicker
                  locale={ko}
                  selected={startDate}
                  onChange={(dates: [Date | null, Date | null]) => handleDateChange(dates)}
                  startDate={startDate ?? undefined}
                  endDate={endDate ?? undefined}
                  selectsRange
                  inline
                  dateFormat="yyyy-MM-dd"
                />
              </div>,
              document.body
            )}
        </div>
      </div>
    </div>
  );
}

export default React.memo(Card);
