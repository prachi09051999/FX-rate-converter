import { FXCardListProps } from "../store/fxCardListSlice";

const sortCards = (state: FXCardListProps) => {
    state.storedCards.sort((a, b) => {
      let comparison = 0;
  
      if (state.sortBy === 'fxRate') {
        comparison = a.fxRate - b.fxRate;
      } else if (state.sortBy === 'createdTimestamp') {
        comparison = a.createdTimestamp - b.createdTimestamp;
      } else if (state.sortBy === 'lastUpdatedTimestamp') {
        comparison = a.lastUpdatedTimestamp - b.lastUpdatedTimestamp;
      }
  
      return state.sortOrderASC ? comparison : -comparison;
    });
  };
export default sortCards;
