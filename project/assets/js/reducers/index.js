import * as types from '../constants/ActionTypes';

const initialState = {
  userDatasets: [],
};

export default function friends(state=initialState, action) {
  switch (action.type) {

    case types.INITIAL_USER_DATASET:
      axios.get('/api/user-dataset')
        .then(function(res) {
          console.log(res.data);
        });
      return state.userDatasets.push('foo');

    default:
      return state;
  }
}
