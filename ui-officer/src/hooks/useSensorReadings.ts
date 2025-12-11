import { useEffect, useState } from 'react';
import {
  collection,
  query,
  orderBy,
  limit,
  where,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface SensorReadingData {
  id: string;
  mq2_raw: number;
  mq2_percent: number;
  temp_ambient: number;
  temp_object: number;
  pulse_raw: number;
  device_id: string;
  created_at: Timestamp | string;
}

export const useSensorReadings = (deviceId?: string, maxReadings: number = 100) => {
  const [readings, setReadings] = useState<SensorReadingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let q;
    
    try {
      if (deviceId) {
        q = query(
          collection(db, 'readings'),
          where('device_id', '==', deviceId),
          orderBy('created_at', 'desc'),
          limit(maxReadings)
        );
      } else {
        q = query(
          collection(db, 'readings'),
          orderBy('created_at', 'desc'),
          limit(maxReadings)
        );
      }
    } catch (queryError: any) {
      if (queryError.code === 'failed-precondition') {
        try {
          if (deviceId) {
            q = query(
              collection(db, 'readings'),
              where('device_id', '==', deviceId),
              limit(maxReadings)
            );
          } else {
            q = query(
              collection(db, 'readings'),
              limit(maxReadings)
            );
          }
        } catch (retryError) {
          setError(retryError as Error);
          setLoading(false);
          return;
        }
      } else {
        setError(queryError as Error);
        setLoading(false);
        return;
      }
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => {
          const docData = doc.data();
          return {
            id: doc.id,
            mq2_raw: docData.mq2_raw || 0,
            mq2_percent: docData.mq2_percent || 0,
            temp_ambient: docData.temp_ambient || 0,
            temp_object: docData.temp_object || 0,
            pulse_raw: docData.pulse_raw || 0,
            device_id: docData.device_id || 'unknown',
            created_at: docData.created_at,
          } as SensorReadingData;
        });

        // ترتيب البيانات يدوياً إذا لم يكن orderBy يعمل
        if (!deviceId) {
          data.sort((a, b) => {
            const getTime = (ts: any): number => {
              if (ts instanceof Date) return ts.getTime();
              if (typeof ts === 'string') return new Date(ts).getTime();
              if (ts && typeof ts === 'object' && 'toMillis' in ts) {
                return (ts as Timestamp).toMillis();
              }
              return 0;
            };
            return getTime(b.created_at) - getTime(a.created_at);
          });
        }

        setReadings(data);
        setLoading(false);
        setError(null);
      },
      (err: any) => {
        setError(err as Error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [deviceId, maxReadings]);

  return { readings, loading, error };
};

export const useLatestReading = (deviceId?: string) => {
  const { readings, loading, error } = useSensorReadings(deviceId, 1);
  return {
    reading: readings[0] || null,
    loading,
    error,
  };
};


