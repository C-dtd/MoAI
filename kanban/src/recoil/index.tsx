import { atom } from 'recoil';

export const kanbanListState = atom<cardtype[]>({
  key: 'kanbanState',
  default: [],
});
