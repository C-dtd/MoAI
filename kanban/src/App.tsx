import { useRecoilValue } from 'recoil';
import KanbanList from './components/KanbanList';
import Card from './components/Card';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { kanbanListState } from './recoil';
import './App.scss';

function App() {
  const kanbanList = useRecoilValue(kanbanListState);
  const { TO_DO, IN_PROGRESS, DONE, NOTE } = TITLE_NAME;

  const cardDataHandler = (cardTitle: string) => {
    return kanbanList
      .filter((data) => data.category === cardTitle)
      .map((item, index) => <Card key={item.id} item={item} />);
  };

  return (
    <>
      <section className="kanbanListContainer">
        <DndProvider backend={HTML5Backend}>
          <KanbanList title={TO_DO}>{cardDataHandler(TO_DO)}</KanbanList>
          <KanbanList title={IN_PROGRESS}>
            {cardDataHandler(IN_PROGRESS)}
          </KanbanList>
          <KanbanList title={DONE}>{cardDataHandler(DONE)}</KanbanList>
          <KanbanList title={NOTE}>{cardDataHandler(NOTE)}</KanbanList>
        </DndProvider>
      </section>
    </>
  );
}

export default App;

export const TITLE_NAME = {
  TO_DO: 'To do',
  IN_PROGRESS: 'In progress',
  DONE: 'Done',
  NOTE: 'Notes & Reference',
};
