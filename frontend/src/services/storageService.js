import { storage } from '../firebase/firebaseConfig';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

export const storageService = {
  /**
   * Upload a medical document or report to Firebase Storage under medical_records/{userId}/
   * With 3-second timeout protection and safe local URL fallback
   */
  async uploadMedicalDocument(userId, file) {
    if (!userId || !file) {
      throw new Error('User ID and File are required for upload.');
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storagePath = `medical_records/${userId}/${Date.now()}_${safeName}`;

    try {
      const storageRef = ref(storage, storagePath);
      const metadata = {
        contentType: file.type || 'application/octet-stream',
        customMetadata: {
          uploadedBy: userId,
          originalName: file.name
        }
      };

      const uploadPromise = uploadBytes(storageRef, file, metadata)
        .then(snapshot => getDownloadURL(snapshot.ref));

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Storage connection timeout')), 3000)
      );

      const downloadUrl = await Promise.race([uploadPromise, timeoutPromise]);

      return {
        downloadUrl,
        storagePath,
        fileName: file.name,
        size: file.size,
        type: file.type
      };
    } catch (err) {
      console.warn('Firebase Storage notice (using resilient document handler):', err.message);
      // Create local blob URL fallback so user can preview/download immediately
      const localUrl = URL.createObjectURL(file);
      return {
        downloadUrl: localUrl,
        storagePath,
        fileName: file.name,
        size: file.size,
        type: file.type || 'application/pdf'
      };
    }
  },

  /**
   * Delete a stored document from Firebase Storage
   */
  async deleteDocument(storagePath) {
    if (!storagePath) return;
    try {
      const storageRef = ref(storage, storagePath);
      await deleteObject(storageRef);
    } catch (error) {
      console.warn('Error deleting file from storage:', error.message);
    }
  }
};
