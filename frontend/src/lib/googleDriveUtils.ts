/**
 * Convert Google Drive share links to direct image URLs
 * From: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
 * To: https://drive.google.com/uc?export=view&id=FILE_ID
 */
export const convertGoogleDriveLink = (url: string): string => {
  if (!url) return url;
  
  // Check if it's a Google Drive link
  if (!url.includes('drive.google.com')) {
    return url;
  }

  // Extract file ID from various Google Drive URL formats
  let fileId = '';

  // Format 1: https://drive.google.com/file/d/FILE_ID/view?usp=...
  const match1 = url.match(/\/file\/d\/([a-zA-Z0-9-_]+)/);
  if (match1) {
    fileId = match1[1];
  }

  // Format 2: https://drive.google.com/open?id=FILE_ID
  const match2 = url.match(/id=([a-zA-Z0-9-_]+)/);
  if (!fileId && match2) {
    fileId = match2[1];
  }

  // If we found a file ID, convert to direct view URL
  if (fileId) {
    return `https://drive.google.com/uc?export=view&id=${fileId}`;
  }

  return url;
};
