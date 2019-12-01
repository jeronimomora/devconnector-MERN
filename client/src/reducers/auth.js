import {
    REGISTER_SUCCESS,
    REGISTER_FAIL
} from '../actions/types'

const initalState = {
    token: localStorage.getItem('token'),
    isAuthenticated: null,
    loading: true,
    user: null
}

export default (state = initalState, { type, payload }) => {
    switch(type) {
        case REGISTER_SUCCESS:
            localStorage.setItem('token', payload.token)
            return {
                ...state,
                token: payload.token,
                isAuthenticated: true,
                loading: false,
            }
        case REGISTER_FAIL:
            localStorage.removeItem('token')
            return {
                ...state,
                token: null,
                isAuthenticated: false,
                loading: false,
            }
        default:
            return state
    }
}