import { useEffect, useState } from 'react';
import {
  collection,
  onSnapshot,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface PersonnelData {
  id: string;
  name: string;
  rank: string;
  unit: string;
  phone?: string;
  device_id: string;
  personnel_id?: string;
  created_at: Timestamp | string | null;
  updated_at: Timestamp | string | null;
}

export const usePersonnel = () => {
  const [personnel, setPersonnel] = useState<PersonnelData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'personnel'),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => {
          const docData = doc.data();
          return {
            id: doc.id,
            ...docData,
            created_at: docData.created_at,
            updated_at: docData.updated_at,
          } as PersonnelData;
        });

        setPersonnel(data);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err as Error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { personnel, loading, error };
};

export const usePersonnelByDevice = (deviceId: string) => {
  const { personnel, loading, error } = usePersonnel();
  const person = personnel.find((p) => p.device_id === deviceId);
  return { person, loading, error };
};

// دالة لإضافة فرد جديد
export const addPersonnel = async (data: Omit<PersonnelData, 'id' | 'created_at' | 'updated_at'>) => {
  const docRef = await addDoc(collection(db, 'personnel'), {
    ...data,
    created_at: Timestamp.now(),
    updated_at: Timestamp.now(),
  });
  return docRef.id;
};

// دالة لتحديث فرد
export const updatePersonnel = async (id: string, data: Partial<PersonnelData>) => {
  await updateDoc(doc(db, 'personnel', id), {
    ...data,
    updated_at: Timestamp.now(),
  });
};

// دالة لحذف فرد
export const deletePersonnelById = async (id: string) => {
  await deleteDoc(doc(db, 'personnel', id));
};


