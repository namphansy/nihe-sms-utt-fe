export const GET_LOADING = "GET_LOADING"

export const getLoading = (loading) => dispatch => {
    dispatch({
        type: GET_LOADING,
        payload: loading
    })
}