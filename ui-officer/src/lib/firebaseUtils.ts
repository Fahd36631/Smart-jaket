import type { PersonnelRecord, SensorState } from '../types/personnel';
import type { SensorReadingData } from '../hooks/useSensorReadings';
import type { PersonnelData } from '../hooks/usePersonnel';
import { Timestamp } from 'firebase/firestore';

// دالة لتحويل PersonnelData إلى PersonnelRecord
const convertPersonnelDataToRecord = (
  personnelData: PersonnelData,
  reading: SensorReadingData
): PersonnelRecord => {
  const status = getStatus(reading);
  const createdAt = timestampToISO(reading.created_at);

  return {
    id: personnelData.personnel_id || personnelData.id,
    name: personnelData.name,
    rank: personnelData.rank,
    unit: personnelData.unit,
    status,
    lastReadingAt: createdAt,
    phone: personnelData.phone,
    location: {
      lat: 24.774265, // يمكن إضافتها لاحقاً من GPS
      lng: 46.738586,
      city: 'الرياض',
    },
    sensors: {
      temperature: {
        label: 'درجة الحرارة',
        value: reading.temp_object,
        unit: '°C',
        state: getSensorState(reading.temp_object, 'temperature'),
        lastUpdated: createdAt,
      },
      heartRate: {
        label: 'نبض القلب',
        value: reading.pulse_raw,
        unit: 'bpm',
        state: getSensorState(reading.pulse_raw, 'heartRate'),
        lastUpdated: createdAt,
      },
      gasLeak: {
        label: 'تسرب الغاز',
        value: reading.mq2_percent,
        unit: 'ppm',
        state: getSensorState(reading.mq2_percent, 'gas'),
        lastUpdated: createdAt,
      },
    },
  };
};

// تحديد الحالة بناءً على قيم الحساسات
const getStatus = (reading: SensorReadingData): SensorState => {
  if (
    reading.temp_object > 39 ||
    reading.pulse_raw > 120 ||
    reading.mq2_percent > 50
  ) {
    return 'danger';
  }
  if (
    reading.temp_object > 37.5 ||
    reading.pulse_raw > 100 ||
    reading.mq2_percent > 25
  ) {
    return 'warning';
  }
  return 'normal';
};

// تحديد حالة حساس معين
const getSensorState = (
  value: number,
  type: 'temperature' | 'heartRate' | 'gas'
): SensorState => {
  switch (type) {
    case 'temperature':
      if (value > 39) return 'danger';
      if (value > 37.5) return 'warning';
      return 'normal';
    case 'heartRate':
      if (value > 120) return 'danger';
      if (value > 100) return 'warning';
      return 'normal';
    case 'gas':
      if (value > 50) return 'danger';
      if (value > 25) return 'warning';
      return 'normal';
    default:
      return 'normal';
  }
};

// تحويل Timestamp إلى ISO string
const timestampToISO = (timestamp: Timestamp | string | Date): string => {
  if (typeof timestamp === 'string') {
    return timestamp;
  }
  if (timestamp instanceof Date) {
    return timestamp.toISOString();
  }
  if (timestamp && typeof timestamp === 'object' && 'toDate' in timestamp) {
    return (timestamp as Timestamp).toDate().toISOString();
  }
  return new Date().toISOString();
};

// تحويل قراءة الحساسات إلى PersonnelRecord
export const mapSensorReadingToPersonnel = (
  reading: SensorReadingData,
  personnelList: PersonnelData[] = []
): PersonnelRecord | null => {
  // البحث عن معلومات الفرد من Firestore
  const personnelInfo = personnelList.find((p) => p.device_id === reading.device_id);

  if (!personnelInfo) {
    return null;
  }

  return convertPersonnelDataToRecord(personnelInfo, reading);
};

// تحويل مجموعة من القراءات إلى PersonnelRecords
export const mapReadingsToPersonnel = (
  readings: SensorReadingData[],
  personnelList: PersonnelData[] = []
): PersonnelRecord[] => {
  // تجميع القراءات حسب device_id وأخذ آخر قراءة لكل جهاز
  const latestByDevice = new Map<string, SensorReadingData>();

  readings.forEach((reading) => {
    const existing = latestByDevice.get(reading.device_id);
    if (!existing) {
      latestByDevice.set(reading.device_id, reading);
    } else {
      // مقارنة التواريخ وأخذ الأحدث
      const getTime = (ts: Timestamp | string | Date): number => {
        if (ts instanceof Date) return ts.getTime();
        if (typeof ts === 'string') return new Date(ts).getTime();
        if (ts && typeof ts === 'object' && 'toMillis' in ts) {
          return (ts as Timestamp).toMillis();
        }
        return new Date().getTime();
      };
      
      const existingTime = getTime(existing.created_at);
      const readingTime = getTime(reading.created_at);

      if (readingTime > existingTime) {
        latestByDevice.set(reading.device_id, reading);
      }
    }
  });

  // تحويل إلى PersonnelRecords
  const personnelRecords: PersonnelRecord[] = [];
  latestByDevice.forEach((reading) => {
    const personnel = mapSensorReadingToPersonnel(reading, personnelList);
    if (personnel) {
      personnelRecords.push(personnel);
    }
  });

  return personnelRecords;
};

