import {
    GET_LOADING
} from '../actions/LoadingActions'

const initialState = {
    loading: false
};

const LoadingReducer = (state = initialState, action) => {
    switch (action.type) {
        case GET_LOADING:
            return {
                ...state,
                loading: action.payload
            };
        default:
            return { ...state };
    }
};

export default LoadingReducer;