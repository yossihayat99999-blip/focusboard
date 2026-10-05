export const sendResult = (res, result) => {
    const data = result.status >= 400 ? { error: result.data } : result.data;
    return res.status(result.status).json(data);
};

