const successResponse = (msg)=>{
    return {
        status:true,
        message:msg,
        status_code:200
    }
}
const successResponseWithData = (msg,data)=>{
    return {
        status:true,
        message:msg,
        data:data,
        status_code:200
    }
}
const errorResponse = (msg)=>{
    return {
        status:false,
        message:msg,
        status_code:400
    }
}
const internalServerResponse = (msg,error)=>{
    return {
        status:false,
        message:msg,
        error:error,
        status_code:500
    }
}

const extractPublicIdFromUrl = (url) => {
  const regex = /\/upload\/(?:v\d+\/)?(.+?)\.(jpg|png|gif|jpeg|mp4|mov|avi|webm)$/;
  const match = url.match(regex);
  return match ? match[1] : null;
}
function getResourceTypeFromUrl(url) {
  const ext = url.split('.').pop().toLowerCase();
  const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
  const videoExts = ['mp4', 'mov', 'avi', 'webm', 'mkv'];
  const rawExts = ['pdf', 'doc', 'docx', 'txt', 'zip'];

  if (imageExts.includes(ext)) return 'image';
  if (videoExts.includes(ext)) return 'video';
  if (rawExts.includes(ext)) return 'raw';
  return null;
}

export default {
    successResponse,
    successResponseWithData,
    errorResponse,
    internalServerResponse,
    extractPublicIdFromUrl,
    getResourceTypeFromUrl
}