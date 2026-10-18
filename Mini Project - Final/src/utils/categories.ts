import { Category, Priority } from '../types/todo';

export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'personal',
    name: 'Personal',
    icon: '🎀',
    color: '#8A5D6F',
    bgColor: '#F5E7ED',
    borderColor: '#E7D1DA',
  },
  {
    id: 'fits',
    name: 'Fits & Style',
    icon: '✨',
    color: '#5C3854',
    bgColor: '#F2E4ED',
    borderColor: '#E3C8D9',
  },
  {
    id: 'work',
    name: 'Work & Study',
    icon: '💼',
    color: '#3B607A',
    bgColor: '#E6EFF5',
    borderColor: '#D9E4EC',
  },
  {
    id: 'wellness',
    name: 'Wellness',
    icon: '🌱',
    color: '#606362',
    bgColor: '#FBF9F2',
    borderColor: '#E2DDD4',
  },
  {
    id: 'errands',
    name: 'Errands',
    icon: '🛒',
    color: '#C9772B',
    bgColor: '#FDF1E6',
    borderColor: '#F9D0AF',
  },
];

export interface PriorityMeta {
  label: string;
  color: string;
  textColor: string;
  bgColor: string;
  borderColor: string;
}

export const PRIORITY_CONFIG: Record<Priority, PriorityMeta> = {
  urgent: {
    label: 'Urgent',
    color: '#D44355',
    textColor: '#D44355',
    bgColor: '#FDECEF',
    borderColor: '#F6BCC5',
  },
  high: {
    label: 'High',
    color: '#C9772B',
    textColor: '#C9772B',
    bgColor: '#FDF1E6',
    borderColor: '#F9D0AF',
  },
  medium: {
    label: 'Medium',
    color: '#3B607A',
    textColor: '#3B607A',
    bgColor: '#E6EFF5',
    borderColor: '#D9E4EC',
  },
  low: {
    label: 'Low',
    color: '#606362',
    textColor: '#606362',
    bgColor: '#F5F4F0',
    borderColor: '#DDD6EC',
  },
};
