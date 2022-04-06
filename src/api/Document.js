import axios from '@/utils/fetch';

const base = '/api/v1.0'

export const getOneByProjectId = (projectId, parameters) => {
    return axios.get(base + '/projects/'+projectId+'/documents', {
        params: parameters
    })
}

export const getTables = (projectId,documentId, tableIds) => {
    return axios.post(base  + '/projects/'+projectId+'/documents/'+documentId+'/table_documents', tableIds)
}

export const getSimpleOneByProjectId = (projectId, parameters) => {
    return axios.get(base + '/projects/'+projectId+'/documents/simple', {
        params: parameters
    })
}

export const syncByProjectId = (projectId) => {
    return axios.post(base + "/projects/"+projectId+"/documents")
}

export const getVersionByProjectId =(projectId, parameters) => {
    return axios.get(base + "/projects/"+projectId+"/document_versions", {
        params: parameters
    })
}

export const getDiff =(projectId, parameters) => {
    return axios.get(base + "/projects/"+projectId+"/diff_documents", {
        params: parameters
    })
}

export const exportDocument = (projectId, params, name, callback) => {
    return fileDownload(base + "/projects/"+projectId+"/document_files", params, name, callback)
}

export const listTables =(projectId, parameters) => {
    return axios.get(base + "/projects/"+projectId+"/tables", {
        params: parameters
    })
}

function fileDownload(path, params, name, callback){
    axios.get(path, {
      responseType: 'blob', 
      params: params
    }).then(response => {
        let urlObj = window.URL || window.webkitURL || window;
        const link = document.createElement('a');
        link.href = urlObj.createObjectURL(new Blob([response]));
        link.download = name +".md"; //or any other extension
        document.body.appendChild(link);
        link.click();
        callback()
    }).catch(() => callback())
  }
