import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const uploadDocument = async (formData, token) => {
    return await axios.post(`${apiUrl}/documents/upload`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
        }
    });
};

export const verifyDocument = async (docId, token) => {
    return await axios.post(`${apiUrl}/documents/verify`, { docId }, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};

export const getMyDocuments = async (email, token) => {
    return await axios.get(`${apiUrl}/documents/my/${email}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};

export const getDocumentById = async (docId, token) => {
    return await axios.get(`${apiUrl}/documents/${docId}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};

export const getAllDocuments = async (token) => {
    return await axios.get(`${apiUrl}/documents/all`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};

export const getAllUsers = async (token) => {
    return await axios.get(`${apiUrl}/auth/users`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};

export const addStudent = async (formData, token) => {
    return await axios.post(`${apiUrl}/auth/add-student`, formData, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};

export const verifyByHash = async (hashValue) => {
    return await axios.get(`${apiUrl}/documents/hash/${hashValue}`);
};

export const changePassword = async (currentPassword, newPassword, token) => {
    return await axios.put(`${apiUrl}/auth/change-password`, { currentPassword, newPassword }, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};

export const getDownloadUrl = async (docId, token) => {
    return await axios.get(`${apiUrl}/documents/download/${docId}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};

export const deleteStudent = async (userId, token) => {
    return await axios.delete(`${apiUrl}/auth/students/${userId}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};

export const unverifyDocument = async (docId, token) => {
    return await axios.post(`${apiUrl}/documents/unverify`, { docId }, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};
