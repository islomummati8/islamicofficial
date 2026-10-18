import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  startAfter,
  writeBatch
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

const CHUNK_BYTES = 256 * 1024;
const CHUNKS_PER_BATCH = 8;
const CHUNKS_PER_READ = 20;
const MAX_FILE_BYTES = 20 * 1024 * 1024;

function bytesToBase64(bytes) {
  let binary = '';
  for (let offset = 0; offset < bytes.length; offset += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
  }
  return btoa(binary);
}

function base64ToBytes(value) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

async function removeUploadedChunks(db, refs) {
  for (let offset = 0; offset < refs.length; offset += 400) {
    const batch = writeBatch(db);
    refs.slice(offset, offset + 400).forEach((chunkRef) => batch.delete(chunkRef));
    await batch.commit();
  }
}

export async function uploadBookFile(db, file, metadata, onProgress = () => {}) {
  if (!(file instanceof Blob) || file.size <= 0 || file.size > MAX_FILE_BYTES) {
    throw new Error('Fayl hajmi 20 MB gacha bo‘lishi kerak.');
  }

  const bookRef = doc(collection(db, 'books'));
  const chunksRef = collection(db, 'books', bookRef.id, 'fileChunks');
  const chunkCount = Math.ceil(file.size / CHUNK_BYTES);
  const uploadedRefs = [];

  try {
    for (let batchStart = 0; batchStart < chunkCount; batchStart += CHUNKS_PER_BATCH) {
      const batch = writeBatch(db);
      const batchEnd = Math.min(batchStart + CHUNKS_PER_BATCH, chunkCount);
      for (let index = batchStart; index < batchEnd; index += 1) {
        const start = index * CHUNK_BYTES;
        const bytes = new Uint8Array(await file.slice(start, start + CHUNK_BYTES).arrayBuffer());
        const chunkRef = doc(chunksRef, String(index).padStart(5, '0'));
        batch.set(chunkRef, { index, data: bytesToBase64(bytes) });
        uploadedRefs.push(chunkRef);
      }
      await batch.commit();
      onProgress(batchEnd, chunkCount);
    }

    await setDoc(bookRef, {
      ...metadata,
      storageType: 'firestore-chunks',
      chunkCount,
      fileSize: file.size,
      createdAt: serverTimestamp()
    });
    return bookRef.id;
  } catch (error) {
    try {
      await removeUploadedChunks(db, uploadedRefs);
      await deleteDoc(bookRef);
    } catch (cleanupError) {
      console.error('Could not remove incomplete Firestore PDF upload:', cleanupError);
      error.cleanupError = cleanupError;
    }
    throw error;
  }
}

export async function loadBookFile(db, book) {
  if (book.storageType !== 'firestore-chunks'
    || !Number.isInteger(book.chunkCount)
    || book.chunkCount < 1
    || book.chunkCount > Math.ceil(MAX_FILE_BYTES / CHUNK_BYTES)) {
    throw new Error('Kitob fayli uchun saqlash ma’lumoti noto‘g‘ri.');
  }

  const chunksRef = collection(db, 'books', book.id, 'fileChunks');
  const chunks = [];
  let cursor = null;

  while (chunks.length < book.chunkCount) {
    const constraints = [orderBy('index'), limit(CHUNKS_PER_READ)];
    if (cursor) constraints.push(startAfter(cursor));
    const snapshot = await getDocs(query(chunksRef, ...constraints));
    if (snapshot.empty) break;
    snapshot.docs.forEach((chunk) => chunks.push(chunk.data()));
    cursor = snapshot.docs[snapshot.docs.length - 1];
    if (snapshot.size < CHUNKS_PER_READ) break;
  }

  chunks.sort((left, right) => left.index - right.index);
  if (chunks.length !== book.chunkCount
    || chunks.some((chunk, index) => chunk.index !== index || typeof chunk.data !== 'string')) {
    throw new Error('Kitobning barcha bo‘laklari topilmadi. Yuklash to‘liq tugamagan bo‘lishi mumkin.');
  }

  const parts = chunks.map((chunk) => base64ToBytes(chunk.data));
  const blob = new Blob(parts, { type: book.contentType || 'application/pdf' });
  if (blob.size !== book.fileSize) {
    throw new Error('Kitob faylining hajmi mos kelmadi.');
  }
  return URL.createObjectURL(blob);
}
